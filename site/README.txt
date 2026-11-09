YALE OUTDOORS SITE
Open index.html to view. Upload the whole folder to any web host (Yale Sites, Google Sites embed, GitHub Pages, Netlify).

1. Edit content.js: paste the Apps Script Web app URL (see Code.gs header) into API_URL and add ZELLE. The club Google Calendar is already set in CAL_ID.
2. Photos: use the Board login link in the footer, or drop files in photos/ named like home-1.jpg and list the names in LOCAL_PHOTOS.
3. Events, break-trip details, Zelle and the calendar live in the Google Sheet tabs (Events, Trips, Settings).
4. The hidden page is founders.html, linked only by the small tree on the History page.

TRAIL DESIGN AND CHECKS
The trail branch homepage is an illustrated walk: trailhead, clearing and live calendar, signpost junction, expedition lookout, clickable site map, and campfire. The signpost and map link to the existing pages and forms. Each inner page links back to the junction.

trail.css contains the scoped trail design plus shared Lora / DM Sans font tokens. trail.js draws the winding route, updates the current-stop guide, and marks visited side pages using sessionStorage. It uses normal browser scrolling. Parallax and campfire animation respect prefers-reduced-motion. The layout and navigation remain usable without JavaScript; the calendar shows its normal client-rendered content when JavaScript is enabled.

The landscape and forest are original vector artwork in img/trail-landscape.svg, img/trail-forest.svg and img/trail-margins.svg. Club photographs are documented in photos/README.md. Editable homepage photo slots are home-1, home-2 and home-3.

Run `node --test tests/*.test.cjs` from the repository root. For a local preview, run `python3 -m http.server 8000 --directory site` and open http://localhost:8000.
