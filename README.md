# AI Tech Magic Website

A modern, single-page website for AI Tech Magic, LLC — your AI consulting business.

## Quick Start

### 1. Deploy to Netlify

**Option A: Drag & Drop (Fastest)**
1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag this entire folder onto the page
3. Your site is live! Netlify will give you a temporary URL like `random-name-123.netlify.app`

**Option B: Connect to Git (Recommended for ongoing updates)**
1. Push this folder to a GitHub/GitLab repo
2. Log into [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repo
5. Deploy settings are auto-configured via `netlify.toml`

---

### 2. Set Up Supabase (Contact Form Database)

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Name it something like `aitechmagic`
4. Choose a strong database password (save it somewhere safe)
5. Select a region close to your audience
6. Click "Create new project" and wait ~2 minutes

#### Create the Leads Table
1. In your Supabase dashboard, go to **Table Editor** (left sidebar)
2. Click **New Table**
3. Configure:
   - Name: `leads`
   - Enable Row Level Security: **ON** (leave checked)
4. Add these columns:

| Name | Type | Default | Primary |
|------|------|---------|---------|
| id | int8 | (auto) | ✓ |
| created_at | timestamptz | now() | |
| name | text | | |
| email | text | | |
| company | text | | |
| interest | text | | |
| message | text | | |

5. Click **Save**

#### Set Up Row Level Security (RLS) Policy
1. Go to **Authentication** → **Policies** in the sidebar
2. Find the `leads` table
3. Click **New Policy**
4. Choose **Create a policy from scratch**
5. Configure:
   - Policy name: `Allow anonymous inserts`
   - Allowed operation: **INSERT**
   - Target roles: `anon`
   - USING expression: (leave empty)
   - WITH CHECK expression: `true`
6. Click **Save policy**

This allows the contact form to insert records without authentication, but prevents anyone from reading or modifying existing leads.

#### Get Your API Credentials
1. Go to **Settings** → **API** in the sidebar
2. Copy these two values:
   - **Project URL** (looks like `https://xyzabc123.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

#### Update Your Website
1. Open `index.html`
2. Find this section near the bottom:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```
3. Replace with your actual values:
```javascript
const SUPABASE_URL = 'https://xyzabc123.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...your-long-key...';
```
4. Save and redeploy

---

### 3. Connect Your Domain (Squarespace → Netlify)

#### In Netlify:
1. Go to your site's dashboard
2. Click **Domain settings** → **Add custom domain**
3. Enter `aitechmagic.com` (or your domain)
4. Netlify will show you DNS settings to configure

#### In Squarespace (DNS):
1. Log into your Squarespace account
2. Go to **Domains** → Select your domain → **DNS Settings**
3. **Option A: CNAME (Recommended)**
   - Delete any existing A or CNAME records for `@` or `www`
   - Add a CNAME record:
     - Host: `www`
     - Value: `your-site-name.netlify.app`
   - Add a redirect from `@` to `www.aitechmagic.com` in Squarespace

4. **Option B: Netlify DNS (Full control)**
   - In Netlify, go to Domains → Add domain → Set up Netlify DNS
   - Netlify will give you nameservers like `dns1.p01.nsone.net`
   - In Squarespace, update nameservers to point to Netlify's

5. Wait 15-60 minutes for DNS propagation
6. Back in Netlify, click **Verify** then **Provision SSL certificate**

---

### 4. Enable HTTPS

Once your domain is connected:
1. In Netlify → Domain settings → HTTPS
2. Click **Verify DNS configuration**
3. Click **Provision certificate**
4. Enable **Force HTTPS**

---

## File Structure

```
aitechmagic-site/
├── index.html        # Main website (all sections)
├── terms.html        # Terms of Service page
├── privacy.html      # Privacy Policy page
├── netlify.toml      # Netlify configuration
└── README.md         # This file
```

---

## Viewing Your Leads

1. Go to your Supabase dashboard
2. Click **Table Editor** → **leads**
3. You'll see all form submissions with name, email, company, interest, and message

**Pro tip:** Set up email notifications
1. In Supabase, go to **Database** → **Webhooks**
2. Create a webhook that fires on INSERT to the `leads` table
3. Point it to a service like Zapier or Make.com to send you an email

---

## Customization

### Colors
Edit the CSS variables at the top of `index.html`:
```css
:root {
  --color-accent: #E8784A;      /* Orange - buttons, links */
  --color-primary: #2D3E50;     /* Dark blue - headings */
  --color-bg: #FAFAF8;          /* Off-white background */
}
```

### Content
All text is in `index.html`. Search for section IDs:
- `#home` - Hero section
- `#services` - Service cards
- `#about` - About/credentials
- `#contact` - Contact form

### Adding a Logo
Replace the text logo in the nav with an image:
```html
<a href="#" class="logo">
  <img src="/logo.png" alt="AI Tech Magic" height="40">
</a>
```

---

## Support

Questions? Email info@aitechmagic.com
