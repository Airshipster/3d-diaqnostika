# Publication and domain migration

## Clinic production destination

The clinic domain is `3dd.az`. The doctor cooperation page is `https://3dd.az/doctors/` and its privacy page is `https://3dd.az/doctors/privacy.html`. The domain root redirects to `/doctors/`, preserving language query and hash, until a separate homepage is created.

The short address `https://3dd.az/doc` redirects to the same doctor page through `site/doc/index.html`. It preserves the language query and section hash and keeps `noindex`; the build regenerates this alias on every publication.

The production build writes the landing to `site/doctors/` and retains the public form endpoint. Search indexing is disabled by the owner's latest instruction: `publication.json` has `indexable: false`, and every HTML page, including root redirects and privacy pages, contains `noindex`. Keep crawling allowed so search engines can read that tag. The sitemap contains no page URLs and is not advertised in robots.txt. A production domain must not automatically enable indexing; require an explicit owner request.

The separate Cloudflare zone `3dd.az` points to this repository's GitHub Pages. Do not change the account-level GitHub Pages domain, portfolio DNS, existing Cloudflare zones, or unrelated Workers.

The backend's ALLOWED_ORIGINS includes `https://3dd.az`; former origins are retained until the complete new-domain submission is verified. Google OAuth remains In production. No backend source or scope changes are required for the new form origin.

Use `work/build_landing.py` from the task workspace to rebuild and `work/verify_domain_migration.py` to check paths, canonical, assets, indexing and public-source boundaries. A live HTTP/HTTPS and genuine form-delivery check are required before reporting migration complete.

## Previous staging destination

The temporary site is `https://elman.digital/3dd/`. GitHub Pages inherits the account's pre-existing custom domain. The clinic repository must not change the portfolio's domain or DNS.

The temporary landing contains `meta name="robots" content="noindex"`. Keep the page crawlable so search engines can read that rule. Do not block the entire personal domain or add a project-directory robots.txt as an indexing control.

The earlier instruction to remove temporary noindex on migration was superseded by the owner's explicit request to keep the site out of search on the clinic domain.

1. Maintain the dedicated HTTPS URL and `indexable: false` in `publication.json`.
2. Rebuild using the task's `work/build_landing.py`. Do not copy an old standalone HTML file to production.
3. Verify deployed noindex, DNS, HTTPS, redirects, canonical and map/form links. Keep the backend's allowed origins aligned with the clinic origin. Do not submit the site for search indexing unless requested.

The cooperation form uses a private Google Sheet and Telegram notifications through an isolated owner-authorized Apps Script backend. Its dedicated Cloud OAuth application is In production. After a domain migration, update the OAuth homepage, privacy URL and authorized domain as well as the backend allowed origins. Verify a complete form submission before removing the old destination.

The independent offline presentation contains private commercial terms and must not be added to this public website repository.
