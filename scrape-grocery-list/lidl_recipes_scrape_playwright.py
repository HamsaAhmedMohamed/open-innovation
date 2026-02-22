import csv, time
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright

BASE = "https://opskrifter.lidl.dk"
INDEX_URL = f"{BASE}/opskrifter"
OUT = "lidl_recipes.csv"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(INDEX_URL, wait_until="networkidle")

        # Grab recipe links from the fully rendered page
        hrefs = page.eval_on_selector_all("a[href]", "els => els.map(e => e.getAttribute('href'))")
        links = sorted({
            urljoin(BASE, h) for h in hrefs
            if h and h.startswith("/") and "/udvalg/" not in h and h != "/opskrifter"
        })

        print(f"Found {len(links)} links (filtered)")

        with open(OUT, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["url", "title"])

            for i, url in enumerate(links, 1):
                try:
                    page.goto(url, wait_until="networkidle")
                    title = page.locator("h1").first.inner_text().strip() if page.locator("h1").count() else ""
                    w.writerow([url, title])
                    print(f"[{i}/{len(links)}] {title}")
                except Exception as e:
                    print(f"[{i}/{len(links)}] ERROR {url}: {e}")
                time.sleep(0.5)

        browser.close()
        print(f"Saved -> {OUT}")

if __name__ == "__main__":
    main()