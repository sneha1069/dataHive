from playwright.sync_api import sync_playwright

def inspect_indeed():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page.goto("https://in.indeed.com/jobs?q=data+analyst", timeout=60000)
        page.wait_for_timeout(5000)

        # Page ka pura HTML ek file mein save karo
        html = page.content()
        with open("indeed_page.html", "w", encoding="utf-8") as f:
            f.write(html)

        print("Saved page HTML to indeed_page.html")
        browser.close()

if __name__ == "__main__":
    inspect_indeed()