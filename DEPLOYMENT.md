# Publication and domain migration

The temporary site is `https://elman.digital/3dd/`. GitHub Pages inherits the account's pre-existing custom domain. The clinic repository must not change the portfolio's domain or DNS.

The temporary landing contains `meta name="robots" content="noindex"`. Keep the page crawlable so search engines can read that rule. Do not block the entire personal domain or add a project-directory robots.txt as an indexing control.

The user has already instructed that the temporary indexing restriction must be removed when the clinic moves to its own domain:

1. Confirm the clinic domain and update `publication.json`: `environment: "production"` and `publicUrl` with the actual dedicated HTTPS URL.
2. Rebuild using the task's `work/build_landing.py`. Production removes the temporary noindex tag automatically and updates the canonical URL. Do not copy an old standalone HTML file to production.
3. Verify the deployed HTML has no noindex; verify DNS, HTTPS, redirects, canonical and all map/form links. Update the backend's allowed origins to the real clinic origin. Only then add the new destination to search tooling/sitemap as appropriate.

The live cooperation contact currently uses telephone and WhatsApp. The Google Apps Script authorization remains blocked by Google under the intended Elman account. No live form/Telegram delivery is claimed. The independent offline presentation contains private commercial terms and must not be added to this public website repository.
