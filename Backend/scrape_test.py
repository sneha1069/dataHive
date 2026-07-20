from playwright.sync_api import sync_playwright

def test_naukri():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)  # headless=False matlab browser dikhega
        page = browser.new_page()
        page.goto("https://www.naukri.com/data-analyst-jobs", timeout=60000)
        page.wait_for_timeout(5000)  # 5 second wait, page load hone do

        page.screenshot(path="naukri_test.png", full_page=False)
        print("Screenshot saved as naukri_test.png")

        browser.close()

if __name__ == "__main__":
    test_naukri()