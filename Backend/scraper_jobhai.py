import re
import time
from playwright.sync_api import sync_playwright
from datetime import datetime, timezone, timedelta

from app import create_app
from models import db, Job

# Reuse shared logic already written for Indeed
from scraper_indeed import guess_role, save_jobs_to_db, clean_location


# JobHai URL format: jobhai.com/{slug}-jobs-jrl
SEARCH_QUERIES = [
    "data-analyst",
    "data-engineer",
    "data-scientist",
    "bi-developer",
    "sql-developer",
    "analytics-engineer",
]


def guess_mode_jobhai(location_text):
    if not location_text:
        return "Onsite"
    text = location_text.lower()
    if "work from home" in text or "remote" in text:
        return "Remote"
    if "hybrid" in text:
        return "Hybrid"
    return "Onsite"


def parse_posted_date_jobhai(text):
    """JobHai uses formats like 'Posted 2 hours ago', 'Posted a day ago',
    'Posted 3 days ago', 'Posted 10+ days ago'."""
    if not text:
        return datetime.now(timezone.utc)

    text = text.lower()
    now = datetime.now(timezone.utc)

    if "today" in text:
        return now
    if "yesterday" in text:
        return now - timedelta(days=1)

    # Normalize "a day ago" / "an hour ago" -> "1 day ago" / "1 hour ago"
    text = re.sub(
        r"\b(a|an)\b(?=\s+(day|days|week|weeks|month|months|hour|hours)\s+ago)",
        "1",
        text,
    )

    match = re.search(r"(\d+)\+?\s*(hour|hours)\s+ago", text)
    if match:
        return now - timedelta(hours=int(match.group(1)))

    match = re.search(r"(\d+)\+?\s*(day|days)\s+ago", text)
    if match:
        return now - timedelta(days=int(match.group(1)))

    match = re.search(r"(\d+)\+?\s*(week|weeks)\s+ago", text)
    if match:
        return now - timedelta(weeks=int(match.group(1)))

    match = re.search(r"(\d+)\+?\s*(month|months)\s+ago", text)
    if match:
        return now - timedelta(days=int(match.group(1)) * 30)

    return now


def parse_experience_jobhai(card_text):
    """Experience isn't a separate tagged field on JobHai - it's embedded in
    the free-text summary, e.g. 'up to 0 - 2 years of experience'."""
    if not card_text:
        return None, None

    text = card_text.lower()
    if "fresher" in text:
        return 0, 0

    match = re.search(r"(\d+)\s*-\s*(\d+)\+?\s*years?\s+of\s+experience", text)
    if match:
        return int(match.group(1)), int(match.group(2))

    match = re.search(r"(\d+)\+?\s*years?\s+of\s+experience", text)
    if match:
        return int(match.group(1)), int(match.group(1))

    return None, None


def parse_salary_jobhai(salary_text):
    """JobHai shows MONTHLY salary, e.g. '₹ 18,000 - 38,000 per month'.
    We convert to an ANNUAL rupee figure (x12) to stay consistent with the
    other scrapers. NOTE: confirm this matches parse_salary()'s unit
    convention in scraper_indeed.py - adjust the *12 here if that function
    stores something different (e.g. LPA as a plain number like 12 instead
    of 1200000)."""
    if not salary_text:
        return None, None

    numbers = re.findall(r"[\d,]+", salary_text)
    numbers = [int(n.replace(",", "")) for n in numbers if n.replace(",", "").isdigit()]
    if not numbers:
        return None, None

    if len(numbers) >= 2:
        return numbers[0] * 12, numbers[1] * 12
    return numbers[0] * 12, numbers[0] * 12


def scrape_jobhai(search_query="data-analyst", max_jobs=20):
    jobs = []
    url = f"https://www.jobhai.com/{search_query}-jobs-jrl"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        print(f"Opening: {url}")
        page.goto(url, timeout=60000, wait_until="domcontentloaded")

        try:
            page.wait_for_selector("div[jobid]", timeout=15000)
        except Exception as e:
            print(f"Selector wait failed: {e}")
            page.screenshot(path=f"debug_jobhai_{search_query}.png", full_page=True)

        page.wait_for_timeout(3000)

        cards = page.query_selector_all("div[jobid]")
        print(f"Found {len(cards)} job cards")

        for card in cards[:max_jobs]:
            try:
                title_el = card.query_selector("#job-title")
                salary_el = card.query_selector("#job-salary")
                company_el = card.query_selector("#hiring-organization")
                location_el = card.query_selector("#job-locality")
                skills_el = card.query_selector("#job-skills")
                link_el = card.query_selector('a[href*="-jid"]')

                title = title_el.inner_text().strip() if title_el else None
                if not title:
                    continue

                company = company_el.inner_text().strip() if company_el else "Not Disclosed"
                location = location_el.inner_text().strip() if location_el else None

                salary_text = salary_el.inner_text().strip() if salary_el else None
                salary_min, salary_max = parse_salary_jobhai(salary_text)

                raw_skills = skills_el.inner_text().strip() if skills_el else ""
                skills = re.sub(r"^skills\s*:\s*", "", raw_skills, flags=re.IGNORECASE).strip()

                card_text = card.inner_text()
                exp_min, exp_max = parse_experience_jobhai(card_text)

                # Posted date line looks like "Posted 3 days ago" somewhere in the card
                date_match = re.search(r"posted\s+.*?ago", card_text, flags=re.IGNORECASE)
                posted_date = parse_posted_date_jobhai(date_match.group(0) if date_match else "")

                relative_link = link_el.get_attribute("href") if link_el else None
                if relative_link and relative_link.startswith("http"):
                    apply_link = relative_link
                elif relative_link:
                    apply_link = f"https://www.jobhai.com{relative_link}"
                else:
                    apply_link = None

                jobs.append({
                    "title": title,
                    "role": guess_role(title),
                    "company": company,
                    "location": clean_location(location),
                    "mode": guess_mode_jobhai(location),
                    "salary_min": salary_min,
                    "salary_max": salary_max,
                    "experience_min": exp_min,
                    "experience_max": exp_max,
                    "skills": skills,
                    "source": "JobHai",
                    "apply_link": apply_link,
                    "posted_date": posted_date,
                    "scraped_at": datetime.now(timezone.utc),
                })
            except Exception as e:
                print(f"Skipped a card due to error: {e}")
                continue

        browser.close()

    return jobs


def run_full_jobhai_scrape():
    all_jobs = []

    for query in SEARCH_QUERIES:
        print(f"\n--- Scraping JobHai: {query} ---")
        try:
            results = scrape_jobhai(query, max_jobs=10)
            all_jobs.extend(results)
        except Exception as e:
            print(f"Failed to scrape {query}: {e}")
        time.sleep(5)

    print(f"\nTotal scraped from JobHai: {len(all_jobs)} jobs")
    save_jobs_to_db(all_jobs)


if __name__ == "__main__":
    run_full_jobhai_scrape()