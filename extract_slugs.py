import csv

INPUT_FILE = "nemlig_product_urls.csv"
OUTPUT_FILE = "nemlig_slugs.csv"

def extract_slug(url):
    # Remove domain
    slug_part = url.replace("https://www.nemlig.com/", "")
    
    # Remove trailing ID (everything after last dash)
    parts = slug_part.split("-")
    return "-".join(parts[:-1])

def main():
    slugs = []

    with open(INPUT_FILE, newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)  # skip header

        for row in reader:
            url = row[0].strip().replace('"', '')
            slug = extract_slug(url)
            slugs.append(slug)

    # Remove duplicates
    slugs = list(set(slugs))

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["slug"])
        for s in slugs:
            writer.writerow([s])

    print(f"Saved {len(slugs)} slugs to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()