# Postful — CLAUDE.md

## Business details
- **Business name:** Postful
- **Service:** Social media management (Instagram + Facebook) for local restaurants and cafes — content creation, consistent posting, monthly performance reports
- **Target customer:** Restaurant and cafe owners who are too busy to post consistently
- **Inquiry email:** Set inside Formspree dashboard (not in code)
- **Tone:** Clean, trustworthy, professional but approachable. Not flashy.

## Design decisions
- **Palette:** Off-white `#F9F6F2` background · Deep navy `#1E2B3C` text/dark sections · Warm amber `#E8924A` accent/CTA buttons
- **Fonts:** Plus Jakarta Sans (body/UI) + Fraunces (display headings) — loaded from Google Fonts
- **Layout:** Single page, centered at max 1100px, mobile-first

## Tech choices
- Pure HTML + CSS + vanilla JS — no frameworks, no build step
- Contact form: Formspree (free tier, 50 submissions/month)
- Hosted: Netlify (free)

## Conventions
- CSS custom properties (variables) defined in `:root` — edit colors there
- All editable content (prices, copy, social links) is marked with a comment: `<!-- EDIT: ... -->`
- One clearly marked Formspree placeholder in index.html: `YOUR_FORMSPREE_ID_HERE`

## User preferences
- No planning pauses — build directly
