import re
import time
from playwright.sync_api import sync_playwright
from datetime import datetime, timezone

from app import create_app
from models import db, Job

# Reuse shared logic already written for Indeed / Internshala
from scraper_indeed import guess_role, save_jobs_to_db, clean_location
from scraper_internshala import parse_posted_date  # handles "X ago" + absolute date fallback


# Hirist URL format: hirist.com/k/{slug}-jobs.html
SEARCH_QUERIES = [
    "data-analyst",
    "data-engineer",
    "data-scientist",
    "bi-developer",
    "sql-developer",
    "analytics-engineer",
]


def guess_mode_hirist(location_text):
    if not location_text:
        return "Onsite"
    text = location_text.lower()
    if "work from home" in text or "remote" in text:
        return "Remote"
    if "hybrid" in text:
        return "Hybrid"
    return "Onsite"


def parse_experience_hirist(exp_text):
    """'6 - 11 yrs' -> (6, 11). '1 - 6 yrs' -> (1, 6). '0 yrs' -> (0, 0)."""
    if not exp_text:
        return None, None
    numbers = re.findall(r"\d+", exp_text)
    if not numbers:
        return None, None
    nums = [int(n) for n in numbers]
    if len(nums) >= 2:
        return nums[0], nums[1]
    return nums[0], nums[0]


def split_title_company(raw_title):
    """Hirist sometimes prefixes the title with the company, e.g.
    'Tiger Analytics - Pharma Analyst' -> ('Tiger Analytics', 'Pharma Analyst').
    Many listings DON'T include the company (confidential postings), so this
    is a best-effort heuristic, not guaranteed accurate."""
    if not raw_title:
        return "Not Disclosed", raw_title

    parts = raw_title.split(" - ", 1)
    if len(parts) == 2:
        return parts[0].strip(), parts[1].strip()
    return "Not Disclosed", raw_title.strip()


def scrape_hirist(search_query="data-analyst", max_jobs=20):
    jobs = []
    url = f"https://www.hirist.com/k/{search_query}-jobs.html"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        print(f"Opening: {url}")
        page.goto(url, timeout=90000, wait_until="domcontentloaded")

        # This is a JS-rendered (Next.js) app - job cards load async, so we
        # need to wait for network activity to settle and scroll a bit.
        try:
            page.wait_for_load_state("networkidle", timeout=20000)
        except Exception:
            pass

        page.mouse.wheel(0, 2000)
        page.wait_for_timeout(3000)
        page.mouse.wheel(0, 2000)
        page.wait_for_timeout(3000)

        try:
            page.wait_for_selector("div.joblist-card-v2", timeout=15000)
        except Exception as e:
            print(f"Selector wait failed: {e}")
            page.screenshot(path=f"debug_hirist_{search_query}.png", full_page=True)

        cards = page.query_selector_all("div.joblist-card-v2")
        print(f"Found {len(cards)} job cards")

        for card in cards[:max_jobs]:
            try:
                title_el = card.query_selector('p[data-testid="job_title"]')
                exp_el = card.query_selector('span[data-testid="job_experience"]')
                location_el = card.query_selector('p[data-testid="job_location"]')
                date_el = card.query_selector('span[data-testid="date_posted"]')
                link_el = card.query_selector('a[href*="/j/"]')

                raw_title = title_el.inner_text().strip() if title_el else None
                if not raw_title:
                    continue

                company, title = split_title_company(raw_title)

                exp_text = exp_el.inner_text().strip() if exp_el else None
                location = location_el.inner_text().strip() if location_el else None
                date_text = date_el.inner_text().strip() if date_el else ""

                relative_link = link_el.get_attribute("href") if link_el else None
                if relative_link and relative_link.startswith("http"):
                    apply_link = relative_link
                elif relative_link:
                    apply_link = f"https://www.hirist.com{relative_link}"
                else:
                    apply_link = None

                exp_min, exp_max = parse_experience_hirist(exp_text)
                posted_date = parse_posted_date(date_text)

                # Collect skill tags (job_tag_0, job_tag_1, ...)
                tag_els = card.query_selector_all('span[data-testid^="job_tag_"]')
                skills = ",".join(t.inner_text().strip() for t in tag_els if t.inner_text().strip())

                jobs.append({
                    "title": title,
                    "role": guess_role(title),
                    "company": company,
                    "location": clean_location(location),
                    "mode": guess_mode_hirist(location),
                    "salary_min": None,
                    "salary_max": None,
                    "experience_min": exp_min,
                    "experience_max": exp_max,
                    "skills": skills,
                    "source": "Hirist",
                    "apply_link": apply_link,
                    "posted_date": posted_date,
                    "scraped_at": datetime.now(timezone.utc),
                })
            except Exception as e:
                print(f"Skipped a card due to error: {e}")
                continue

        browser.close()

    return jobs


def run_full_hirist_scrape():
    all_jobs = []

    for query in SEARCH_QUERIES:
        print(f"\n--- Scraping Hirist: {query} ---")
        try:
            results = scrape_hirist(query, max_jobs=10)
            all_jobs.extend(results)
        except Exception as e:
            print(f"Failed to scrape {query}: {e}")
        time.sleep(5)

    print(f"\nTotal scraped from Hirist: {len(all_jobs)} jobs")
    save_jobs_to_db(all_jobs)


if __name__ == "__main__":
    run_full_hirist_scrape()