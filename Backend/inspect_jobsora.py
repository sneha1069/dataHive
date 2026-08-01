from playwright.sync_api import sync_playwright

URL = "https://in.jobsora.com/jobs-data-analyst-india"


def inspect():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        print(f"Opening: {URL}")
        page.goto(URL, timeout=60000, wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

        # Save the full page HTML for reference
        with open("jobsora_debug.html", "w", encoding="utf-8") as f:
            f.write(page.content())
        print("Saved full page HTML to jobsora_debug.html")

        # Confirmed from the first run: job cards are <article class="c-job-item ...">
        cards = page.query_selector_all("article.c-job-item")
        print(f"Found {len(cards)} article.c-job-item cards")

        if cards:
            first = cards[0]
            print("\n\n===== FIRST CARD - PLAIN TEXT (to spot the posted-date line) =====\n")
            print(first.inner_text())

            print("\n\n===== FIRST CARD - FULL HTML (untruncated) =====\n")
            print(first.inner_html())

        browser.close()


if __name__ == "__main__":
    inspect()