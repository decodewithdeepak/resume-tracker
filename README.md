
# Resume Tracker - Version Control for Your Resume

A simple, privacy-friendly Next.js app to track who views your online resume. Perfect for job seekers who want to know when and where their resume is being viewed—especially by recruiters or companies you reach out to.

## Features

- **Embedded Resume:** Displays your resume as a PDF at the main page (`/`).
- **Visit Logging:** Every visit is logged to MongoDB (via Mongoose), capturing:
  - Timestamp
  - IP address
  - User agent (browser/device info)
  - Source (e.g. `?source=companyname` in the URL)
- **Personalized Links:** Add `?source=companyname` to your resume URL when sharing. See exactly which company viewed your resume.
- **Analytics Dashboard:**
  - Password-protected `/visits` route
  - View all logs, visit counts by source, and browser stats
  - Mobile-friendly: Only the most important columns (time, source, count) are shown on small screens
- **Admin Resume Upload:** Upload a new PDF resume from the `/visits` dashboard. The new file instantly replaces the old one on the main page.
- **No Tracking Scripts:** All analytics are server-side—no third-party trackers, no cookies for visitors.


## Quick Start

1. **Clone this repo and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd resume-tracker
   npm install
   ```
2. **Set up MongoDB:**
   - Create a MongoDB Atlas cluster (or use your own MongoDB instance)
   - Add your connection string to `.env.local`:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     ADMIN_PASSWORD=your_admin_password
     ```
3. **Add your resume:**
   - Place your initial `resume.pdf` in the `public` folder. (Full path: `public/resume.pdf`)
   - Or, upload a new PDF from the `/visits` admin dashboard after starting the app.
4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view your resume.
5. **Share your resume:**
   - Use links like `https://yourdomain.com/?source=google` or `?source=microsoft` when reaching out to recruiters.
6. **View analytics and upload new resume:**
   - Go to `/visits` and log in with your admin password to see all visit logs, stats, and upload a new PDF resume.


## Customization
- **Change the embedded resume:** Upload a new PDF from the `/visits` dashboard, or replace `public/resume.pdf` manually.
- **Change admin password:** Update `ADMIN_PASSWORD` in `.env.local`.
- **Deploy:** Deploy to Vercel or your favorite host. Set your environment variables in the dashboard.

## Why use this?
- Know when your resume is being viewed (and by whom)
- Like a Version Control for your resume
- No privacy-invasive tracking for your visitors

---

Made with ❤️ using Next.js, MongoDB, and Tailwind CSS.
