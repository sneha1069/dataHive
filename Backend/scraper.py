import time
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

SEARCH_TERMS = [
    "data-analyst",
    "data-engineer",
    "data-scientist",
    "bi-developer",
    "sql-developer",
    "analytics-engineer",
]


def guess_role(title):
    title_lower = title.lower()
    for keyword, role in ROLE_KEYWORDS.items():
        if keyword in title_lower:
            return role
    return "Data Analyst"


def parse_experience(exp_text):
    if not exp_text:
        return None, None
    exp_text = exp_text.replace("Yrs", "").strip()
    if "-" in exp_text:
        parts = exp_text.split("-")
        try:
            return int(parts[0].strip()), int(parts[1].strip())
        except ValueError:
            return None, None
    return None, None


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


def scrape_naukri(search_query="data-analyst", max_jobs=20):
    jobs = []
    url = f"https://www.naukri.com/{search_query}-jobs"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

        print(f"Opening: {url}")
        page.goto(url, timeout=60000)

        try:
            page.wait_for_selector("div.cust-job-tuple", timeout=15000)
        except Exception as e:
            print(f"Selector wait failed: {e}")
            page.screenshot(path=f"debug_{search_query}.png", full_page=True)
            print(f"Saved debug screenshot: debug_{search_query}.png")

        page.wait_for_timeout(3000)

        cards = page.query_selector_all("div.cust-job-tuple")
        print(f"Found {len(cards)} job cards")

        for card in cards[:max_jobs]:
            try:
                title_el = card.query_selector("a.title")
                company_el = card.query_selector("a.comp-name")
                exp_el = card.query_selector("span.exp-wrap")
                loc_el = card.query_selector("span.loc-wrap")

                title = title_el.inner_text().strip() if title_el else None
                apply_link = title_el.get_attribute("href") if title_el else None
                company = company_el.inner_text().strip() if company_el else None
                experience_text = exp_el.inner_text().strip() if exp_el else None
                location = loc_el.inner_text().strip() if loc_el else None

                if not title or not company:
                    continue

                exp_min, exp_max = parse_experience(experience_text)

                jobs.append({
                    "title": title,
                    "role": guess_role(title),
                    "company": company,
                    "location": clean_location(location),
                    "mode": guess_mode(location),
                    "salary_min": None,
                    "salary_max": None,
                    "experience_min": exp_min,
                    "experience_max": exp_max,
                    "skills": "",
                    "source": "Naukri",
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


def run_full_scrape():
    all_jobs = []

    for term in SEARCH_TERMS:
        print(f"\n--- Scraping: {term} ---")
        try:
            results = scrape_naukri(term, max_jobs=10)
            all_jobs.extend(results)
        except Exception as e:
            print(f"Failed to scrape {term}: {e}")
        time.sleep(5)

    print(f"\nTotal scraped: {len(all_jobs)} jobs")
    save_jobs_to_db(all_jobs)


if __name__ == "__main__":
    run_full_scrape()