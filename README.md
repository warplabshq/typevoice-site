# Site

Static landing page, the legal pages, the thank-you page Dodo Payments returns to, and the
Sparkle appcast.

- `index.html` — marketing page
- `support.html` — support + FAQ
- `privacy.html` — privacy policy
- `terms.html` — terms of use (purchase, refunds)
- `eula.html` — the license agreement for the app
- `changelog.html` — what's new per release (mirror the top entry of the app repo's `CHANGELOG.md`)
- `thanks.html` — Dodo's return URL after checkout; shows the key from `?license_key=…` and
  offers `typevoice://activate?key=…`, which activates the app in one click
- `appcast.xml` — Sparkle feed; replaced by `dist/appcast.xml` from `make release` in the app repo

Everything brand-specific is in `site.js` (`SITE`): name, company, email, domain, download
link, Dodo checkout link, price, refund window, Mac limit, date, jurisdiction, postal
address. Change it there and every page updates. Keep `price`, `refundDays` and `macLimit`
in step with the Dodo product and the app's `Brand.swift`.

SEO lives in the `<head>` of each page and can't come from JS: canonical and Open Graph URLs,
the JSON-LD (`SoftwareApplication` + `FAQPage` on the home page), `robots.txt` and
`sitemap.xml`. The domain is `https://typevoice.ai` everywhere (`CNAME` holds it for GitHub
Pages); if it ever changes, replace it in one go:

    grep -rl "typevoice.ai" . | xargs sed -i '' 's|https://typevoice.ai|https://your.domain|g'

and in the app: `Brand.website` in `Sources/TypeVoice/Support/Brand.swift`, `SUFeedURL` in
`Packaging/Info.plist`, and the Dodo brand's URL.

On a rebrand, also replace "TypeVoice" in the `<title>`, `og:*` and JSON-LD tags, and re-render
`assets/og.png` (1200×630, the social preview). The display font is self-hosted in
`assets/fonts/` (SIL OFL) so the site makes no third-party requests, which the privacy
policy promises.

Deploy: it's plain HTML. Drop the folder on GitHub Pages, Cloudflare Pages, Netlify or Vercel.
