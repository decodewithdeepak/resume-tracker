# Resume Tracker - Version Control + Tracking

A simple, privacy-friendly Next.js app to host your resume as a PDF with basic visit tracking (IP, browser, source) and a clean analytics dashboard. It uses LaTeX for creating a version-controlled, professional resume, automatically built via GitHub Actions and served through Vercel. Ideal for job seekers who want to track when and where their resume is viewed, especially by recruiters.

## Features

- **PDF Resume:** Embedded at `/`.
- **Visit Logging:** Logs time, IP, user agent, and source to MongoDB.
- **Custom Share Links:** Use `?source=company` to track viewers.
- **Analytics Dashboard:** Password-protected `/visits` route with visit stats.
- **Easy Updates:** Edit `resume.tex`, push to GitHub, PDF auto-deployed.
- **No Tracking Scripts:** All analytics are server-side.

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** MongoDB
- **PDF Generation:** LaTeX
- **Deployment:** Vercel (for Next.js), GitHub Actions (for PDF updates)
- **Version Control:** Git

## Quick Start

1. Clone repo & install dependencies:
   ```bash
   git clone https://github.com/decodewithdeepak/resume-tracker.git
   cd resume-tracker
   npm install
   ```
2. Add MongoDB connection & admin password to `.env.local`.
3. Edit `public/resume.tex` to update your resume content.
4. Run locally:
   ```bash
   npm run dev
   ```
5. Deploy to Vercel or your preferred hosting provider.

---

Made with Next.js, MongoDB, LaTeX, and Tailwind CSS.
