from playwright.sync_api import sync_playwright

URL = "https://www.jobhai.com/data-analyst-jobs-jrl"


def inspect():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        print(f"Opening: {URL}")
        page.goto(URL, timeout=60000, wait_until="domcontentloaded")
        page.wait_for_timeout(3000)

        with open("jobhai_debug.html", "w", encoding="utf-8") as f:
            f.write(page.content())
        print("Saved full page HTML to jobhai_debug.html")

        # Job detail pages end in "-jid" based on the URLs we saw
        job_links = page.query_selector_all('a[href*="-jid"]')
        print(f"Found {len(job_links)} links matching -jid pattern")

        if not job_links:
            print("No -jid links found. Check jobhai_debug.html manually.")
        else:
            seen = 0
            for link in job_links:
                if seen >= 2:
                    break
                href = link.get_attribute("href")

                card_html = page.evaluate(
                    """(el) => {
                        let node = el;
                        for (let i = 0; i < 4; i++) {
                            if (node.parentElement) node = node.parentElement;
                        }
                        return node.outerHTML;
                    }""",
                    link,
                )
                print(f"\n\n===== CARD SAMPLE {seen + 1} (href={href}) =====\n")
                print(card_html[:4000])
                seen += 1

        page.wait_for_timeout(3000)
        browser.close()


if __name__ == "__main__":
    inspect()