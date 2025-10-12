# 🚀 Deploy BlessSoul.com - Complete Guide

## ✅ Prerequisites (Already Done!)

- ✅ Waitlist form working with Supabase
- ✅ All content finalized
- ✅ Design complete and tested
- ✅ Domain: blesssoul.com (on Porkbun)

---

## 📦 Step 1: Create GitHub Repository (5 minutes)

### 1.1 Create the Repository on GitHub

1. Go to https://github.com
2. Click the **"+" icon** (top right) > **"New repository"**
3. Repository name: `blesssoul-website` (or any name)
4. Description: "BlessSoul landing page - Coming Soon"
5. Set to **Public**
6. **DO NOT** initialize with README (we already have files)
7. Click **"Create repository"**

### 1.2 Push Your Code

Open Terminal and run these commands:

```bash
cd blesssoul-website

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: BlessSoul landing page"

# Rename branch to main
git branch -M main

# Add GitHub remote (REPLACE with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/blesssoul-website.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

---

## 🌐 Step 2: Enable GitHub Pages (2 minutes)

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Click **"Pages"** in the left sidebar
4. Under **"Source"**:
   - Branch: Select **"main"**
   - Folder: Select **"/ (root)"**
5. Click **"Save"**

**Your site will be live at:**
`https://YOUR_USERNAME.github.io/blesssoul-website/`

Wait 2-3 minutes, then test this URL!

---

## 🌍 Step 3: Configure Custom Domain (10-30 minutes)

### 3.1 In GitHub Pages

1. Still in **Settings > Pages**
2. Under **"Custom domain"**, enter: `www.blesssoul.com`
3. Click **"Save"**
4. **Wait** - GitHub will check DNS (this takes a few minutes)
5. Once verified, check **"Enforce HTTPS"**

### 3.2 In Porkbun DNS Settings

1. Log in to **Porkbun**: https://porkbun.com/login
2. Go to your **blesssoul.com** domain
3. Click **"DNS"** or **"DNS Records"**
4. **Delete any existing A or CNAME records** for @ and www

5. **Add these NEW records:**

#### Record 1: CNAME for www
```
Type: CNAME
Host: www
Answer: YOUR_USERNAME.github.io
TTL: 600
```

#### Records 2-5: A Records for root domain
```
Type: A
Host: @
Answer: 185.199.108.153
TTL: 600
```

```
Type: A
Host: @
Answer: 185.199.109.153
TTL: 600
```

```
Type: A
Host: @
Answer: 185.199.110.153
TTL: 600
```

```
Type: A
Host: @
Answer: 185.199.111.153
TTL: 600
```

6. **Save all records**

**Important:** Replace `YOUR_USERNAME` with your actual GitHub username!

---

## ⏰ Step 4: Wait for DNS Propagation (10-30 minutes)

DNS changes take time to propagate worldwide:
- Minimum: 10 minutes
- Average: 30 minutes
- Maximum: 48 hours (rare)

### Check DNS Propagation:

Use this tool to check if DNS is ready:
https://www.whatsmydns.net/#A/blesssoul.com

When you see GitHub's IP addresses (185.199.108.153, etc.) worldwide, you're ready!

---

## ✅ Step 5: Verify Your Site is Live

Once DNS propagates, test these URLs:

1. https://blesssoul.com ✓
2. https://www.blesssoul.com ✓
3. Both should show your website!

### Test Checklist:

- [ ] Website loads correctly
- [ ] Logo and iPhone mockup display
- [ ] All 6 features show correctly
- [ ] Waitlist form works (submit a test email)
- [ ] Email appears in Supabase
- [ ] Privacy and Terms links work
- [ ] Mobile responsive (test on phone)
- [ ] HTTPS is enabled (🔒 in browser)

---

## 📧 Step 6: Test Waitlist Form on Live Site

1. Go to https://blesssoul.com
2. Submit a test email
3. Check Supabase Table Editor > `waitlist`
4. Verify the email was saved ✅

---

## 🎉 You're LIVE!

Your website is now live at:
- https://blesssoul.com
- https://www.blesssoul.com

---

## 📊 After Launch: Managing Your Waitlist

### Export Emails for Launch Announcement:

**In Supabase SQL Editor:**
```sql
SELECT email FROM public.waitlist ORDER BY subscribed_at DESC;
```

Copy the results and use them in:
- Resend (for bulk emails)
- Mailchimp
- Any email marketing tool

### Send Launch Email:

When your app is live on App Store:
1. Export all emails from Supabase
2. Import to Resend or email tool
3. Send launch announcement with App Store link
4. Update website to link the App Store badge to your app

---

## 🐛 Troubleshooting

### Site not loading?
- Check DNS propagation: https://www.whatsmydns.net
- Verify GitHub Pages is enabled
- Check custom domain is saved in GitHub

### HTTPS not working?
- Wait for DNS to fully propagate
- Re-enable "Enforce HTTPS" in GitHub Pages settings

### Form not working on live site?
- Check browser console for errors
- Verify Supabase credentials are in `script.js`
- Ensure RLS policies are set up

---

## 🔄 Future Updates

When you need to update the website:

```bash
cd blesssoul-website
# Make your changes to index.html, styles.css, etc.
git add .
git commit -m "Update: description of changes"
git push
```

Changes go live automatically in 1-2 minutes!

---

## 📞 Support

Need help?
- Check this guide
- Email: blesssoulapp@gmail.com (you!)

**Good luck with the launch!** 🚀✨
