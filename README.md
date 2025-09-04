# Resume Tracker - Versioning + Tracking

A simple Next.js application that hosts your resume as an embedded PDF with visit tracking and analytics. Features a complete CI/CD pipeline using LaTeX for version-controlled resume generation, automatically compiled and deployed via GitHub Actions whenever you update your resume content.

## Features

- **PDF Resume:** Embedded at `/` with download option
- **Visit Tracking:** Logs IP, browser, timestamp, and custom sources
- **Custom Links:** Use `?source=linkedin` or `?source=company-name` to track viewers
- **Analytics Dashboard:** Password-protected `/visits` with visit stats and filtering
- **Auto PDF Updates:** Edit `resume.tex`, push to GitHub → GitHub Actions auto-builds PDF
- **Privacy-First:** No client-side tracking scripts

## Tech Stack

Next.js • MongoDB • Tailwind CSS • TypeScript • LaTeX • GitHub Actions • Vercel

## Setup

1. **Clone & Install:**

   ```bash
   git clone https://github.com/decodewithdeepak/resume-tracker.git
   cd resume-tracker
   npm install
   ```

2. **Environment Variables:**
   Create `.env.local` (see `.env.example`):

   ```bash
   MONGODB_URI=your_mongodb_connection_string
   ADMIN_PASSWORD=your_dashboard_password
   ```

3. **Update Resume:**
   Edit `public/resume.tex` with your content (LaTeX format)

4. **Run Locally:**

   ```bash
   npm run dev
   ```

5. **Deploy:**
   Deploy to Vercel, add environment variables to dashboard

## Usage

- **Resume:** `https://resume.deepakmodi.tech/`
- **Track Sources:** `https://resume.deepakmodi.tech/?gh-repo`
- **Analytics:** `https://resume.deepakmodi.tech/visits` (requires password)

---

Made with Next.js, MongoDB, LaTeX, and Tailwind CSS.
