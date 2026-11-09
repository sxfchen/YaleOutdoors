YALE OUTDOORS SITE
Open index.html to view. Upload the whole folder to any web host (Yale Sites, Google Sites embed, GitHub Pages, Netlify).

1. Edit content.js: paste the Apps Script Web app URL (see Code.gs header) into API_URL and add ZELLE. The club Google Calendar is already set in CAL_ID.
2. Photos: use the Board login link in the footer, or drop files in photos/ named like home-1.jpg and list the names in LOCAL_PHOTOS.
3. Events, break-trip details, Zelle and the calendar live in the Google Sheet tabs (Events, Trips, Settings).
4. The hidden page is founders.html, linked only by the small tree on the History page.

DESIGN AND CHECKS
Design 2 builds on design-granola with Lora headings, DM Sans body type, original outdoor sketches, and club photographs from the public Yale Connect site (sources in photos/README.md). The homepage photo slots home-1, home-2, home-3 and home-board have local fallbacks and can still be replaced through board editing. The board-letter placeholder remains in index.html. Copy follows design-granola; headings use Lora and all body copy, navigation, labels, captions and form controls use DM Sans.
From the repository root, run `node --test tests/site.test.cjs` for the form and interaction regression checks. For a local preview, run `python3 -m http.server 8000 --directory site` and open http://localhost:8000.
