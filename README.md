# 🎬 inthebox

A modern, fast, and personal movie & series discovery platform built with Next.js 16 and Tailwind CSS v4.

> [!WARNING]  
> **Current Status:** This project is designed for **local development and testing only**. User-to-user interaction (sharing reviews, public lists, etc.) is not currently a live feature. All data is stored in your local SQLite database.

---

## ✨ Features

- 🔍 **Advanced Discovery:** Access the latest movies and TV shows via TMDB API integration.
- 📺 **Tracking System:** Mark titles as watched and manage your personal watchlist.
- 📊 **Personal Profile:** View your watch statistics and favorite content.
- 🌓 **Modern UI:** Sleek, dark-mode-first design powered by Tailwind CSS v4.
- 🔐 **Authentication:** Secure login options powered by NextAuth.js.

---

## 🛠️ Local Setup

Follow these steps to run the project on your local machine.

### 📋 Prerequisites
1.  **Node.js 18+** must be installed.
2.  **TMDB API Key:** You need a free API key from [The Movie Database (TMDB)](https://www.themoviedb.org/settings/api) to fetch media data.

---

## 🛠️ Local Development (Step-by-Step)

Want to run this on your own computer? Here is the foolproof guide.

### 1. Get the Code
If you have Git installed, run this command in your terminal/command prompt:
```bash
git clone https://github.com/RafaelSanzio01/inthebox
cd inthebox
```
*(Or simply download the ZIP from GitHub and extract it).*

### 2. Install Dependencies
This project uses **Node.js** packages. Make sure you are in the `inthebox` folder and run:
```bash
npm install
```

### 3. Usage & Configuration (Mandatory)
**You MUST create a `.env` file for the project to work.**

### 3. Usage & Configuration (Mandatory)
**You MUST create a `.env` file with the following 3 mandatory settings.**

1.  Copy the example file:
    ```bash
    # Mac / Linux
    cp .env.example .env

    # Windows
    copy .env.example .env
    ```
2.  Open `.env` and ensure these **3 lines** are set:
    *   `TMDB_API_KEY=...` (Paste your API Key here)
    *   `NEXTAUTH_SECRET=changeme123` (Required for security, can be any random string for local)
    *   `NEXTAUTH_URL=http://localhost:3000` (Required for redirecting)

3.  *(Optional)* Leave Google/GitHub fields empty to use the **Guest Login**.

### 4. Setup the Database
We use **Prisma** with a local **SQLite** database (no server installation needed). Run these commands one by one:
```bash
# Create the database tables
npx prisma db push

# (Optional) Generate the client if prompted
npx prisma generate

# Populate the database with test data (Users, Reviews, Comments)
npm run seed
```

### 6. Start the App!
Launch the development server:
```bash
npm run dev
```

Open your browser and visit: **[http://localhost:3000](http://localhost:3000)** 🎉

---

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** SQLite & Prisma ORM
- **Auth:** NextAuth.js
- **API:** TMDB API
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React / React Icons

---

## ⚠️ Important Notes
- This project is for educational and personal use.
- **Security:** Never share your `.env` file publicly. It is excluded from version control via `.gitignore`.
- **AI Assistance:** AI tools were used in this project.
