# 3D Diaqnostika

Doctor cooperation landing page in Azerbaijani and Russian. Azerbaijani opens by default.

## Website

Production URL: https://3dd.az/doctors/

`site/` is a buildless static website suitable for GitHub Pages. The included workflow publishes that directory. The doctor landing and its assets live in `site/doctors/`; the domain root redirects to `/doctors/` until a separate homepage is created.

The 12 services and prices follow the center's supplied leaflet. Equipment and illustrative clinical images are attributed to Planmeca on the page. Area diagrams are schematic. The interactive map uses the supplied clinic coordinates; it is not a surveyed entrance plan.

## Applications

The cooperation form stores applications in a private Google Sheet and sends Telegram notifications to chats subscribed by authorized administrators. Telephone and WhatsApp remain available. The form acknowledges success only after storage; repeating a request with the same UUID does not duplicate the row or notification.

The map uses bundled MapLibre GL JS 5.24.0 and a locally customized VersaTiles style. Ground, roads, buildings, water and labels use the clinic palette, including a dark theme. The renderer loads when the map approaches the viewport. The 3D tooth diagram is an inline SVG updated in place; clinical photos are decoded ahead of display.

Vector tiles, glyphs and map sprites load from the free public VersaTiles server, which has no uptime guarantee. Map attribution includes OpenStreetMap contributors and ESA WorldCover 2021 / CC BY 4.0. The renderer's BSD-3-Clause and style's MIT licences are bundled in `site/assets/`. [Provider documentation](https://docs.versatiles.org/guides/use_tiles_versatiles_org).

The isolated Google Apps Script backend in `server/` uses a dedicated standard Cloud project with OAuth publishing status In production. The owner granted its three configured scopes on 20 October 2026. The one-time configuration handler has been removed. A clearly marked test application was stored once and its Telegram notification was accepted; the browser also received the genuine storage acknowledgement.

`site/doctors/config.js` contains only the public Apps Script `/exec` endpoint. An empty endpoint hides the form. A review copy opened directly as a local file uses the telephone/WhatsApp fallback; online forms require an allowed HTTP(S) origin. See `server/SETUP.txt` for backend configuration and verification, and `site/doctors/privacy.html` for the bilingual application-data policy.

Telegram tokens, Google credentials, administrator IDs, spreadsheet IDs and webhook secrets must remain outside this public repository. Bot subscriptions require an actual `/start` from an authorized administrator in the intended private or group chat.

`TELEGRAM_BOT_TOKEN` is stored as an encrypted repository Actions secret. Pages does not read or embed it. After authorization, the backend also needs its token in private Apps Script properties; the Actions secret alone does not activate the bot.

The clinic-domain build removes the temporary `noindex`, sets its canonical URL and publishes `robots.txt` and `sitemap.xml`. Cloudflare provides the separate `3dd.az` DNS zone; hosting remains in this repository's GitHub Pages. The portfolio domain and all other Cloudflare zones are independent. See DEPLOYMENT.md and publication.json.
