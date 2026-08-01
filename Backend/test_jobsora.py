from playwright.sync_api import sync_playwright

URL = "https://in.jobsora.com/jobs-data-analyst-india"


def test_salary_click():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page.goto(URL, timeout=60000, wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

        cards = page.query_selector_all("article.c-job-item")
        print(f"Found {len(cards)} cards")

        first_card = cards[0]
        title = first_card.query_selector("h2.c-job-item__title a").inner_text()
        print(f"Clicking 'View salary' on: {title}")

        btn = first_card.query_selector("span.c-job-item__btn")
        if btn:
            btn.click()
            page.wait_for_timeout(2000)

            # Print whatever text is now visible in the card (in case it expanded in place)
            print("\n----- Card text AFTER click -----\n")
            print(first_card.inner_text())

            # Also check if a modal/popup appeared anywhere on the page
            print("\n----- Any visible modal on page? -----\n")
            modal = page.query_selector(".modal.show, .modal.in, [class*='modal'][style*='display: block']")
            if modal:
                print(modal.inner_text())
            else:
                print("No obvious modal found. Current URL:", page.url)
        else:
            print("Button not found with selector span.c-job-item__btn")

        page.wait_for_timeout(5000)  # keep browser open a bit so you can look manually
        browser.close()


if __name__ == "__main__":
    test_salary_click()