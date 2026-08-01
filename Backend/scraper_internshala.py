import time
import re
from playwright.sync_api import sync_playwright
from datetime import datetime, timezone, timedelta
from app import create_app
from models import db, Job

# Reuse shared logic already written for Indeed
from scraper_indeed import guess_role, parse_salary, save_jobs_to_db, clean_location


# Internshala URL uses hyphenated slugs, e.g. internshala.com/jobs/data-analyst-jobs/
SEARCH_QUERIES = [
    "data-analyst",
    "data-engineer",
    "data-scientist",
    "bi-developer",
    "sql-developer",
    "analytics-engineer",
]


def guess_mode_internshala(location_text):
    """Internshala says 'Work from home' instead of 'Remote'."""
    if not location_text:
        return "Onsite"
    text = location_text.lower()
    if "work from home" in text or "remote" in text:
        return "Remote"
    if "hybrid" in text:
        return "Hybrid"
    return "Onsite"


def parse_experience(exp_text):
    """'No experience required' -> (0, 0). '1 year(s)' -> (1, 1). '2-4 years' -> (2, 4)."""
    if not exp_text:
        return None, None
    text = exp_text.lower()
    if "no experience" in text or "fresher" in text:
        return 0, 0
    numbers = re.findall(r"\d+", text)
    if not numbers:
        return None, None
    nums = [int(n) for n in numbers]
    if len(nums) >= 2:
        return nums[0], nums[1]
    return nums[0], nums[0]


def parse_posted_date(card_text):
    """Internshala shows relative time like 'Today', '4 days ago', '3 weeks ago',
    OR sometimes an absolute date like '27 Jul' 26' / '27 Jul 2026'.
    Convert whatever it finds into an actual datetime."""
    if not card_text:
        return datetime.now(timezone.utc)

    text = card_text.lower()
    now = datetime.now(timezone.utc)

    if "today" in text:
        return now
    if "yesterday" in text:
        return now - timedelta(days=1)

    # Relative format: "3 weeks ago", "1 day ago", "2 months ago"
    match = re.search(r"(\d+)\s*(day|days|week|weeks|month|months)\s+ago", text)
    if match:
        num = int(match.group(1))
        unit = match.group(2)
        if "day" in unit:
            return now - timedelta(days=num)
        if "week" in unit:
            return now - timedelta(weeks=num)
        if "month" in unit:
            return now - timedelta(days=num * 30)

    # Absolute format fallback: "27 Jul' 26", "27 Jul 2026", "27 July 2026"
    abs_match = re.search(
        r"(\d{1,2})\s+([a-z]{3,9})'?\s*(\d{2,4})", text
    )
    if abs_match:
        day_str, mon_str, year_str = abs_match.groups()
        year_str = "20" + year_str if len(year_str) == 2 else year_str
        for fmt in ("%d %b %Y", "%d %B %Y"):
            try:
                parsed = datetime.strptime(
                    f"{day_str} {mon_str[:3].title()} {year_str}", "%d %b %Y"
                )
                return parsed.replace(tzinfo=timezone.utc)
            except ValueError:
                continue

    return now


def scrape_internshala(search_query="data-analyst", max_jobs=20):
    jobs = []
    url = f"https://internshala.com/jobs/{search_query}-jobs/"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        print(f"Opening: {url}")
        page.goto(url, timeout=60000, wait_until="domcontentloaded")

        try:
            page.wait_for_selector("div.individual_internship", timeout=15000)
        except Exception as e:
            print(f"Selector wait failed: {e}")
            page.screenshot(path=f"debug_internshala_{search_query}.png", full_page=True)

        page.wait_for_timeout(3000)

        cards = page.query_selector_all("div.individual_internship")
        print(f"Found {len(cards)} job cards")

        for card in cards[:max_jobs]:
            try:
                title_link_el = card.query_selector("h2 a") or card.query_selector("h3 a")
                company_el = card.query_selector("p.company-name")
                location_el = card.query_selector("p.row-1-item.locations")
                row_items = card.query_selector_all("div.row-1-item")

                title = title_link_el.inner_text().strip() if title_link_el else None
                relative_link = title_link_el.get_attribute("href") if title_link_el else None
                if relative_link and relative_link.startswith("http"):
                    apply_link = relative_link
                elif relative_link:
                    apply_link = f"https://internshala.com{relative_link}"
                else:
                    apply_link = None

                company = company_el.inner_text().strip() if company_el else None
                location = location_el.inner_text().strip() if location_el else None

                salary_text = None
                exp_text = None
                for item in row_items:
                    text = item.inner_text().strip()
                    if "₹" in text or "$" in text or "/year" in text or "/month" in text:
                        salary_text = text
                    elif "year" in text.lower() or "no experience" in text.lower() or "fresher" in text.lower():
                        exp_text = text

                if not title or not company:
                    continue

                salary_min, salary_max = parse_salary(salary_text)
                exp_min, exp_max = parse_experience(exp_text)

                raw_card_text = card.inner_text()
                posted_date = parse_posted_date(raw_card_text)
                print(f"[DEBUG] {title[:40]!r} -> posted_date={posted_date.date()} | raw_text={raw_card_text!r}")

                jobs.append({
                    "title": title,
                    "role": guess_role(title),
                    "company": company,
                    "location": clean_location(location),
                    "mode": guess_mode_internshala(location),
                    "salary_min": salary_min,
                    "salary_max": salary_max,
                    "experience_min": exp_min,
                    "experience_max": exp_max,
                    "skills": "",
                    "source": "Internshala",
                    "apply_link": apply_link,
                    "posted_date": posted_date,
                    "scraped_at": datetime.now(timezone.utc),
                })
            except Exception as e:
                print(f"Skipped a card due to error: {e}")
                continue

        browser.close()

    return jobs


def run_full_internshala_scrape():
    all_jobs = []

    for query in SEARCH_QUERIES:
        print(f"\n--- Scraping Internshala: {query} ---")
        try:
            results = scrape_internshala(query, max_jobs=10)
            all_jobs.extend(results)
        except Exception as e:
            print(f"Failed to scrape {query}: {e}")
        time.sleep(5)

    print(f"\nTotal scraped from Internshala: {len(all_jobs)} jobs")
    save_jobs_to_db(all_jobs)


if __name__ == "__main__":
    run_full_internshala_scrape()