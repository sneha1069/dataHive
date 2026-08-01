from playwright.sync_api import sync_playwright

def dump_naukri_html():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page.goto("https://www.naukri.com/data-analyst-jobs", timeout=60000)
        page.wait_for_timeout(5000)

        html = page.content()
        with open("naukri_page.html", "w", encoding="utf-8") as f:
            f.write(html)

        print("Saved to naukri_page.html")
        browser.close()

if __name__ == "__main__":
    dump_naukri_html()