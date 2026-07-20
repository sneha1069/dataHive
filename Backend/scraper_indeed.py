import time
import re
from playwright.sync_api import sync_playwright
from datetime import datetime, timezone
from app import create_app
from models import db, Job


ROLE_KEYWORDS = {
    "data analyst": "Data Analyst",
    "data engineer": "Data Engineer",
    "data scientist": "Data Scientist",
    "bi developer": "BI Developer",
    "sql developer": "SQL Developer",
    "analytics engineer": "Analytics Engineer",
}

SEARCH_QUERIES = [
    "data+analyst",
    "data+engineer",
    "data+scientist",
    "bi+developer",
    "sql+developer",
    "analytics+engineer",
]


def guess_role(title):
    title_lower = title.lower()
    for keyword, role in ROLE_KEYWORDS.items():
        if keyword in title_lower:
            return role
    return "Data Analyst"


def guess_mode(location_text):
    if not location_text:
        return "Onsite"
    location_lower = location_text.lower()
    if "remote" in location_lower:
        return "Remote"
    if "hybrid" in location_lower:
        return "Hybrid"
    return "Onsite"


def clean_location(location_text):
    if not location_text:
        return "India"
    cleaned = location_text
    for word in ["Hybrid -", "Hybrid", "Remote -", "Remote"]:
        cleaned = cleaned.replace(word, "")
    cleaned = cleaned.strip(" -,")
    return cleaned if cleaned else "India"


def parse_salary(salary_text):
    if not salary_text:
        return None, None

    numbers = re.findall(r"[\d,]+", salary_text)
    if not numbers:
        return None, None

    try:
        nums = [int(n.replace(",", "")) for n in numbers]

        is_monthly = "month" in salary_text.lower() or "mo" in salary_text.lower()
        is_hourly = "hour" in salary_text.lower() or "hr" in salary_text.lower()

        def to_lpa(n):
            if is_hourly:
                return (n * 8 * 22 * 12) / 100000
            if is_monthly:
                return (n * 12) / 100000
            return n / 100000

        if len(nums) >= 2:
            lo, hi = to_lpa(nums[0]), to_lpa(nums[1])
        else:
            lo = hi = to_lpa(nums[0])

        if lo is None or lo < 1 or lo > 100:
            return None, None

        return int(round(lo)), int(round(hi))
    except (ValueError, ZeroDivisionError):
        return None, None


def scrape_indeed(search_query="data+analyst", max_jobs=20):
    jobs = []
    url = f"https://in.indeed.com/jobs?q={search_query}"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        print(f"Opening: {url}")
        page.goto(url, timeout=60000)

        try:
            page.wait_for_selector("div.job_seen_beacon", timeout=15000)
        except Exception as e:
            print(f"Selector wait failed: {e}")
            page.screenshot(path=f"debug_indeed_{search_query}.png", full_page=True)

        page.wait_for_timeout(3000)

        cards = page.query_selector_all("div.job_seen_beacon")
        print(f"Found {len(cards)} job cards")

        for card in cards[:max_jobs]:
            try:
                title_link_el = card.query_selector("h3.jobTitle a.jcs-JobTitle")
                title_span_el = card.query_selector("h3.jobTitle span[title]")
                company_el = card.query_selector('span[data-testid="company-name"]')
                location_el = card.query_selector('div[data-testid="text-location"]')
                salary_el = card.query_selector("li.salary-snippet-container span")

                title = title_span_el.inner_text().strip() if title_span_el else None
                relative_link = title_link_el.get_attribute("href") if title_link_el else None
                apply_link = f"https://in.indeed.com{relative_link}" if relative_link else None
                company = company_el.inner_text().strip() if company_el else None
                location = location_el.inner_text().strip() if location_el else None
                salary_text = salary_el.inner_text().strip() if salary_el else None

                if not title or not company:
                    continue

                salary_min, salary_max = parse_salary(salary_text)

                jobs.append({
                    "title": title,
                    "role": guess_role(title),
                    "company": company,
                    "location": clean_location(location),
                    "mode": guess_mode(location),
                    "salary_min": salary_min,
                    "salary_max": salary_max,
                    "experience_min": None,
                    "experience_max": None,
                    "skills": "",
                    "source": "Indeed",
                    "apply_link": apply_link,
                    "posted_date": datetime.now(timezone.utc),
                    "scraped_at": datetime.now(timezone.utc),
                })
            except Exception as e:
                print(f"Skipped a card due to error: {e}")
                continue

        browser.close()

    return jobs


def save_jobs_to_db(jobs_list):
    app = create_app()
    with app.app_context():
        saved_count = 0
        skipped_count = 0

        for job_data in jobs_list:
            existing = Job.query.filter_by(
                title=job_data["title"],
                company=job_data["company"],
                location=job_data["location"],
            ).first()

            if existing:
                skipped_count += 1
                continue

            job = Job(**job_data)
            db.session.add(job)
            saved_count += 1

        db.session.commit()
        print(f"\nSaved {saved_count} new jobs. Skipped {skipped_count} duplicates.")


def run_full_indeed_scrape():
    all_jobs = []

    for query in SEARCH_QUERIES:
        print(f"\n--- Scraping Indeed: {query} ---")
        try:
            results = scrape_indeed(query, max_jobs=10)
            all_jobs.extend(results)
        except Exception as e:
            print(f"Failed to scrape {query}: {e}")
        time.sleep(5)

    print(f"\nTotal scraped from Indeed: {len(all_jobs)} jobs")
    save_jobs_to_db(all_jobs)


if __name__ == "__main__":
    run_full_indeed_scrape()