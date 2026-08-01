from playwright.sync_api import sync_playwright

URL = "https://www.hirist.com/k/data-analyst-jobs.html"


def inspect():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        print(f"Opening: {URL}")
        try:
            page.goto(URL, timeout=90000, wait_until="domcontentloaded")
        except Exception as e:
            print(f"goto failed: {e}")
            print("Trying again with wait_until='commit' (just wait for navigation to start)...")
            page.goto(URL, timeout=90000, wait_until="commit")

        try:
            page.wait_for_load_state("networkidle", timeout=20000)
        except Exception:
            pass  # fine if it times out, we scroll below regardless

        page.mouse.wheel(0, 2000)
        page.wait_for_timeout(3000)
        page.mouse.wheel(0, 2000)
        page.wait_for_timeout(3000)

        with open("hirist_debug.html", "w", encoding="utf-8") as f:
            f.write(page.content())
        print("Saved full page HTML to hirist_debug.html")

        # Job detail pages look like /j/data-analyst-sql-1651944?ref=...
        job_links = page.query_selector_all('a[href*="/j/"]')
        print(f"Found {len(job_links)} links matching /j/ pattern")

        if not job_links:
            print("No /j/ links found - page may need more wait time, or scrolling,")
            print("or a different selector. Check hirist_debug.html manually.")
        else:
            seen = 0
            for link in job_links:
                if seen >= 2:
                    break
                href = link.get_attribute("href")

                card_html = page.evaluate(
                    """(el) => {
                        let node = el;
                        for (let i = 0; i < 5; i++) {
                            if (node.parentElement) node = node.parentElement;
                        }
                        return node.outerHTML;
                    }""",
                    link,
                )
                print(f"\n\n===== CARD SAMPLE {seen + 1} (href={href}) =====\n")
                print(card_html[:5000])
                seen += 1

        page.wait_for_timeout(5000)
        browser.close()


if __name__ == "__main__":
    inspect()