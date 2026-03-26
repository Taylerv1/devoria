# Devoria

Portfolio & Agency website built with Next.js, Firebase, and Supabase.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env.local
# Then fill in your values in .env.local

# 3. Deploy Firebase security rules
# Go to Firebase Console > Firestore Database > Rules > Copy content from firestore.rules

# 4. Seed the database
npm run seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

**Default Admin Login:**
- Email: `admin@devoria.dev`
- Password: `admin123`

---

## Environment Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the values** - See `.env.example` for all required variables and where to get them:
   - **Firebase:** [console.firebase.google.com](https://console.firebase.google.com)
     - Create project
     - Enable Authentication (Email/Password method)
     - Enable Firestore Database
     - Copy credentials from Project Settings
   - **Supabase:** [supabase.com](https://supabase.com)
     - Create project
     - Create storage bucket
     - Copy API keys from Project Settings
   - **Resend:** [resend.com](https://resend.com)
     - Sign up
     - Create API key

3. **Deploy Firestore Rules:**
   - Go to Firebase Console > Firestore Database > Rules tab
   - Copy the content from `firestore.rules` and paste it there
   - Publish the rules

---

## NPM Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
npm run seed   # Seed database with admin + demo data
```

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Storage:** Supabase Storage
- **Email:** Resend
- **Styling:** Tailwind CSS 4

