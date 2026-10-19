# 3D Diaqnostika

Doctor cooperation landing page in Azerbaijani and Russian. Azerbaijani opens by default.

## Website

`site/` is a buildless static website suitable for GitHub Pages. The included workflow publishes that directory.

The 12 services and prices follow the center's supplied leaflet. Equipment and illustrative clinical images are attributed to Planmeca on the page. Area diagrams are schematic, and the local walking map is approximate.

## Applications

The current release uses a telephone contact button. The online form stays hidden while `site/config.js` has an empty `formEndpoint`; it does not claim to send or store applications.

An isolated Google Apps Script backend is prepared in `server/`. The first runtime authorization was blocked by Google on 20 October 2026. It has not received account permissions, and no live application delivery has been verified. Resolve the original project's OAuth authorization through Google's supported process before enabling the form.

After authorization and private configuration, set `formEndpoint` to the verified Apps Script `/exec` URL. The website will show the doctor application form automatically. See `server/SETUP.txt` for backend configuration and verification.

Telegram tokens, Google credentials, administrator IDs, spreadsheet IDs and webhook secrets must remain outside this public repository. Bot subscriptions require an actual `/start` from an authorized administrator in the intended private or group chat.
