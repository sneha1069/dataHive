import time
from playwright.sync_api import sync_playwright
from datetime import datetime, timezone

from app import create_app
from models import db, Job

# Reuse shared logic already written for Indeed / Internshala
from scraper_indeed import guess_role, save_jobs_to_db, clean_location
from scraper_internshala import parse_posted_date  # handles "X ago" + absolute date fallback


# Jobsora URL format: in.jobsora.com/jobs-{slug}-india
SEARCH_QUERIES = [
    "data-analyst",
    "data-engineer",
    "data-scientist",
    "bi-developer",
    "sql-developer",
    "analytics-engineer",
]


def guess_mode_jobsora(location_text):
    """Jobsora sometimes shows 'Remote' / 'Hybrid' as part of the location text."""
    if not location_text:
        return "Onsite"
    text = location_text.lower()
    if "work from home" in text or "remote" in text:
        return "Remote"
    if "hybrid" in text:
        return "Hybrid"
    return "Onsite"


def scrape_jobsora(search_query="data-analyst", max_jobs=20):
    jobs = []
    url = f"https://in.jobsora.com/jobs-{search_query}-india"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        print(f"Opening: {url}")
        page.goto(url, timeout=60000, wait_until="domcontentloaded")

        try:
            page.wait_for_selector("article.c-job-item", timeout=15000)
        except Exception as e:
            print(f"Selector wait failed: {e}")
            page.screenshot(path=f"debug_jobsora_{search_query}.png", full_page=True)

        page.wait_for_timeout(3000)

        cards = page.query_selector_all("article.c-job-item")
        print(f"Found {len(cards)} job cards")

        for card in cards[:max_jobs]:
            try:
                title_link_el = card.query_selector("h2.c-job-item__title a")
                info_items = card.query_selector_all("div.c-job-item__info-item")
                date_el = card.query_selector("div.c-job-item__date")

                title = title_link_el.inner_text().strip() if title_link_el else None
                apply_link = title_link_el.get_attribute("href") if title_link_el else None

                company = info_items[0].inner_text().strip() if len(info_items) > 0 else None
                location = info_items[1].inner_text().strip() if len(info_items) > 1 else None

                if not title or not company:
                    continue

                posted_date_text = date_el.inner_text().strip() if date_el else ""
                posted_date = parse_posted_date(posted_date_text)

                jobs.append({
                    "title": title,
                    "role": guess_role(title),
                    "company": company,
                    "location": clean_location(location),
                    "mode": guess_mode_jobsora(location),
                    "salary_min": None,
                    "salary_max": None,
                    "experience_min": None,
                    "experience_max": None,
                    "skills": "",
                    "source": "Jobsora",
                    "apply_link": apply_link,
                    "posted_date": posted_date,
                    "scraped_at": datetime.now(timezone.utc),
                })
            except Exception as e:
                print(f"Skipped a card due to error: {e}")
                continue

        browser.close()

    return jobs


def run_full_jobsora_scrape():
    all_jobs = []

    for query in SEARCH_QUERIES:
        print(f"\n--- Scraping Jobsora: {query} ---")
        try:
            results = scrape_jobsora(query, max_jobs=10)
            all_jobs.extend(results)
        except Exception as e:
            print(f"Failed to scrape {query}: {e}")
        time.sleep(5)

    print(f"\nTotal scraped from Jobsora: {len(all_jobs)} jobs")
    save_jobs_to_db(all_jobs)


if __name__ == "__main__":
    run_full_jobsora_scrape()