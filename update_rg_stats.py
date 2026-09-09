#!/usr/bin/env python3
"""
update_rg_stats.py â€” Scrape ResearchGate stats and update the website HTML files.

Usage:
    python update_rg_stats.py

Requirements:
    pip install requests beautifulsoup4

Run this manually whenever you want to refresh your ResearchGate stats on the website.
It will update:
  - research.html  (the main stats callout)
  - index.html     (if it contains a stats reference)
"""

import re
import json
import sys
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Missing dependencies. Run:  pip install requests beautifulsoup4")
    sys.exit(1)

# â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
RG_STATS_URL = "https://www.researchgate.net/profile/Suman-Pathak/stats"
RG_PROFILE_URL = "https://www.researchgate.net/profile/Suman-Pathak"

SITE_ROOT = Path(__file__).parent  # folder containing this script

# Files to patch (relative to SITE_ROOT)
TARGET_FILES = [
    "research.html",
    "index.html",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
}

# â”€â”€ Scraper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def fetch_stats() -> dict:
    """
    Attempt to scrape ResearchGate stats page.
    ResearchGate is heavily JavaScript-rendered, so this uses a simple
    heuristic approach â€” it may need updating if RG changes their markup.
    Returns a dict with keys: reads, ris, recommendations (all strings).
    """
    print(f"Fetching: {RG_STATS_URL}")
    try:
        resp = requests.get(RG_STATS_URL, headers=HEADERS, timeout=20)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  FAIL: Request failed: {e}")
        return {}

    soup = BeautifulSoup(resp.text, "html.parser")
    text = soup.get_text(" ", strip=True)

    stats = {}

    # â”€â”€ Reads â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    # Look for patterns like "42,500 reads" or "42.5k reads"
    reads_match = re.search(
        r"([\d,\.]+)\s*k?\s*(?:total\s*)?reads?",
        text, re.IGNORECASE
    )
    if reads_match:
        raw = reads_match.group(1).replace(",", "")
        # Handle "42.5k" style
        if "k" in reads_match.group(0).lower() and "." in raw:
            val = int(float(raw) * 1000)
        else:
            val = int(raw) if raw.isdigit() else None
        if val:
            stats["reads"] = f"{val:,}+"

    # â”€â”€ Research Interest Score â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    ris_match = re.search(
        r"[Rr]esearch\s+[Ii]nterest\s+[Ss]core[:\s]*([\d\.]+)",
        text
    )
    if not ris_match:
        # Try alternative: just look for a decimal near "score"
        ris_match = re.search(r"\b(\d{2,3}\.\d)\b", text)
    if ris_match:
        stats["ris"] = ris_match.group(1)

    # â”€â”€ Recommendations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    recs_match = re.search(
        r"(\d+)\s+[Rr]ecommendations?",
        text
    )
    if recs_match:
        stats["recommendations"] = recs_match.group(1)

    return stats


# â”€â”€ HTML Patcher â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def patch_file(filepath: Path, stats: dict) -> bool:
    """
    Update the three stat values in an HTML file using data-rg-stat attributes.
    The HTML should contain elements like:
        <span id="rg-reads" data-rg-stat="reads"><strong>40,860+</strong></span>
    """
    if not filepath.exists():
        print(f"  âš  File not found: {filepath}")
        return False

    html = filepath.read_text(encoding="utf-8")
    original = html
    changed = False

    if "reads" in stats:
        html, n = re.subn(
            r'(<span[^>]+data-rg-stat="reads"[^>]*>)\s*<strong>[^<]*</strong>',
            rf'\1<strong>{stats["reads"]}</strong>',
            html
        )
        if n:
            print(f"  âœ“ reads â†’ {stats['reads']}")
            changed = True

    if "ris" in stats:
        html, n = re.subn(
            r'(<span[^>]+data-rg-stat="ris"[^>]*>)\s*<strong>[^<]*</strong>',
            rf'\1<strong>{stats["ris"]}</strong>',
            html
        )
        if n:
            print(f"  âœ“ RIS â†’ {stats['ris']}")
            changed = True

    if "recommendations" in stats:
        html, n = re.subn(
            r'(<span[^>]+data-rg-stat="recs"[^>]*>)\s*<strong>[^<]*</strong>',
            rf'\1<strong>{stats["recommendations"]}</strong>',
            html
        )
        if n:
            print(f"  âœ“ recommendations â†’ {stats['recommendations']}")
            changed = True

    if changed and html != original:
        filepath.write_text(html, encoding="utf-8")
        print(f"  â†’ Saved: {filepath.name}")
    elif not changed:
        print(f"  â„¹ No matching stat placeholders found in {filepath.name}")

    return changed


# â”€â”€ Manual Override â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def manual_update(reads: str, ris: str, recommendations: str):
    """
    Use this if the scraper fails (RG is JS-heavy and may block bots).
    Just fill in the values yourself from the RG stats page and call:
        python update_rg_stats.py manual "42,500+" "61.2" "4"
    """
    stats = {
        "reads": reads,
        "ris": ris,
        "recommendations": recommendations,
    }
    print(f"Manual update: {stats}")
    for filename in TARGET_FILES:
        filepath = SITE_ROOT / filename
        print(f"\nPatching {filepath.name}:")
        patch_file(filepath, stats)
    print("\nDone. Commit and push the changes.")


# â”€â”€ Main â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
def main():
    if len(sys.argv) >= 5 and sys.argv[1] == "manual":
        # Usage: python update_rg_stats.py manual "42,500+" "61.2" "4"
        manual_update(sys.argv[2], sys.argv[3], sys.argv[4])
        return

    print("=== ResearchGate Stats Updater ===\n")
    stats = fetch_stats()

    if not stats:
        print("\nâš   Scraper returned no data.")
        print("   ResearchGate uses heavy JavaScript rendering, so the page")
        print("   content may not be available via simple HTTP requests.")
        print()
        print("   Use the manual override instead:")
        print("   1. Open https://www.researchgate.net/profile/Suman-Pathak/stats")
        print("   2. Note the values (reads, RIS, recommendations)")
        print("   3. Run:  python update_rg_stats.py manual \"42,500+\" \"61.2\" \"4\"")
        return

    print(f"\nFound stats: {json.dumps(stats, indent=2)}\n")

    any_changed = False
    for filename in TARGET_FILES:
        filepath = SITE_ROOT / filename
        print(f"Patching {filepath.name}:")
        if patch_file(filepath, stats):
            any_changed = True
        print()

    if any_changed:
        print("âœ…  Done. Review the changes, then commit and push:\n")
        print("    git add research.html index.html")
        print("    git commit -m \"Update ResearchGate stats\"")
        print("    git push\n")
    else:
        print("Nothing was changed.")


if __name__ == "__main__":
    main()

