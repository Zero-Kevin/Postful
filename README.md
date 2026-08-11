# Postful — Website README

A complete guide written for non-coders. No technical experience needed.

---

## Table of contents

1. [Preview the site on your computer](#1-preview-the-site-on-your-computer)
2. [Set up Formspree (contact form)](#2-set-up-formspree-contact-form)
3. [Edit text and prices](#3-edit-text-and-prices)
4. [Edit colours and fonts](#4-edit-colours-and-fonts)
5. [Update social media links](#5-update-social-media-links)
6. [Deploy to Netlify for free](#6-deploy-to-netlify-for-free)
7. [Add a custom domain](#7-add-a-custom-domain)
8. [Roll back a change with git](#8-roll-back-a-change-with-git)

---

## 1. Preview the site on your computer

You do not need to install anything. Just:

1. Open the `Postful` folder on your computer.
2. Double-click `index.html`.
3. It opens in your web browser — that's the site.

If you make any changes to the files, save them, then refresh the browser tab to see them.

---

## 2. Set up Formspree (contact form)

The contact form needs a free Formspree account to deliver messages to your email inbox. This takes about 5 minutes.

### Step-by-step

1. Go to **[formspree.io](https://formspree.io)** and click **Sign up** (it's free, no credit card).
2. Once logged in, click **+ New Form**.
3. Give the form a name (e.g., "Postful Contact") and click **Create Form**.
4. In the form dashboard, look for **Settings → Submission email** and type in the email address where you want to receive messages.
5. At the top of the form page you'll see a code snippet — look for a URL that looks like: `https://formspree.io/f/xpwzabcd`. **Copy the part after `/f/`** — that's your Form ID (e.g., `xpwzabcd`).

### Paste your ID into the website

1. Open `index.html` in a text editor (right-click → Open with → Notepad or any editor).
2. Press **Ctrl + F** (Windows) or **Cmd + F** (Mac) and search for: `YOUR_FORMSPREE_ID_HERE`
3. Replace `YOUR_FORMSPREE_ID_HERE` with your actual Form ID.

**Before:**
```
action="https://formspree.io/f/YOUR_FORMSPREE_ID_HERE"
```

**After (example):**
```
action="https://formspree.io/f/xpwzabcd"
```

4. Save the file.

That's it — the form will now deliver messages to your inbox.

> **Test it:** Open the site, fill in the contact form, and submit. You should receive a test email within a minute. Also check Spam just in case.

---

## 3. Edit text and prices

Open `index.html` in a text editor. All the editable content is marked with a comment like `<!-- EDIT: ... -->` — search for `EDIT:` to jump to each one quickly.

### Quick reference: what to change and where

| What | How to find it |
|---|---|
| Business name | Search for `EDIT: Change "Postful"` |
| Hero headline | Search for `EDIT: Change the headline` |
| Pricing amounts | Search for `EDIT: Change the price` — three results |
| Pricing features | Search for `EDIT: Add or remove features` |
| Plan names | Search for `EDIT: Update plan names` |
| Testimonials | Search for `EDIT: Replace these placeholder testimonials` |
| Your email address | Search for `EDIT: Replace with your real email` |
| Social media links | See section 5 below |
| Footer copyright year | Search for `EDIT: Update the year` |

**Example — changing a price:**

Find this line in `index.html`:
```html
<span class="plan__amount">£299</span>
```
Change `£299` to whatever you want, e.g. `£349`.

---

## 4. Edit colours and fonts

Open `style.css`. At the very top you'll find a section called **DESIGN TOKENS** inside `:root { }`. Every colour and font is listed there with a plain-English label. Change the values to update the whole site at once.

```css
--color-accent: #E8924A;  /* amber — buttons and highlights */
```

Change `#E8924A` to any hex colour code. You can pick colours at **[coolors.co](https://coolors.co)** or **[htmlcolorcodes.com](https://htmlcolorcodes.com/color-picker/)**.

---

## 5. Update social media links

In `index.html`, search for `EDIT: Replace # with your real Instagram/Facebook URLs`.

You'll find two `<a href="#">` links for Instagram and Facebook. Replace the `#` with your full profile URL.

**Example:**
```html
<!-- Before -->
<a href="#" class="footer__social" aria-label="Postful on Instagram">

<!-- After -->
<a href="https://www.instagram.com/yourhandle" class="footer__social" aria-label="Postful on Instagram">
```

---

## 6. Deploy to Netlify for free

Netlify hosts your site for free and gives you a public URL in under 2 minutes.

1. Go to **[netlify.com](https://netlify.com)** and sign up (free, no credit card).
2. Once logged in, look for the **"Sites"** section and find the drag-and-drop upload box labelled **"Drag and drop your site folder here"** (it may say "Deploy manually").
3. Open your file explorer and find the `Postful` folder on your Desktop.
4. Drag the whole `Postful` folder into that Netlify box.
5. Netlify gives you a random URL (e.g., `fancy-panda-123.netlify.app`). Your site is live!

To update the site later, drag the folder again — Netlify replaces it automatically.

---

## 7. Add a custom domain

If you have (or buy) a domain like `postful.co.uk`:

1. In your Netlify site dashboard, click **Domain settings → Add a domain**.
2. Type in your domain name and follow the instructions — Netlify will show you two "nameserver" values to copy.
3. Log into wherever you bought the domain (e.g., GoDaddy, Namecheap, Google Domains).
4. Find **DNS settings** or **Nameservers** and replace the existing nameservers with the ones Netlify gave you.
5. Wait up to 24 hours for the change to spread across the internet (usually faster).
6. Netlify automatically adds a free HTTPS/SSL certificate — no extra steps.

---

## 8. Roll back a change with git

This project uses git to track every saved version. If you break something, you can undo it.

Open a terminal (Windows: right-click Desktop → "Open in Terminal") inside the `Postful` folder and run:

**See the list of saved versions:**
```bash
git log --oneline
```

**Undo to the last saved version (discards unsaved changes only):**
```bash
git checkout -- .
```

**Undo to a specific earlier version** (replace `abc1234` with the ID from `git log`):
```bash
git checkout abc1234 -- .
```

---

## What you still need to do

- [ ] **Create a Formspree account** and paste your Form ID into `index.html` (see Section 2)
- [ ] **Create your inquiry email address** and add it to the Formspree dashboard and to the `<!-- EDIT: Replace with your real email -->` spots in `index.html`
- [ ] **Replace placeholder testimonials** with real ones from clients
- [ ] **Add your real Instagram and Facebook URLs** in the footer
- [ ] **Update pricing** to your actual prices
- [ ] **Deploy to Netlify** (see Section 6)
