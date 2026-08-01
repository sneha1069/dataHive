"""
Quick inspector: opens Internshala jobs page, prints the outer HTML
of the first job card so we can identify correct selectors.
Run this once, share the printed output, then we'll build the real
scraper_internshala.py using the exact class names.
"""
from playwright.sync_api import sync_playwright

SEARCH_URL = "https://internshala.com/jobs/python-jobs/"  # change keyword as needed

def inspect():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)  # headless=False so tu dekh bhi sake
        page = browser.new_page()
        page.goto(SEARCH_URL, timeout=60000, wait_until="domcontentloaded")
        page.wait_for_timeout(5000)  # thoda extra wait, JS render hone do

        # Common Internshala container class guesses — try each
        candidates = [
            "div.individual_internship",
            "div.internship_meta",
            "div[id^='job_']",
            "div.job-card",
            "div.container-fluid.individual_internship",
        ]

        found = False
        for selector in candidates:
            cards = page.query_selector_all(selector)
            if cards:
                print(f"\n✅ Selector worked: '{selector}' -> {len(cards)} cards found\n")
                print("----- First card HTML -----")
                print(cards[0].inner_html()[:3000])  # first 3000 chars
                found = True
                break

        if not found:
            print("❌ Koi candidate selector match nahi hua. Poora page HTML dump kar rahe hain (pehle 5000 chars):")
            print(page.content()[:5000])

        browser.close()

if __name__ == "__main__":
    inspect()