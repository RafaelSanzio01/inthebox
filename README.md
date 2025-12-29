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

### 🚀 Quick Setup (Windows)
Open your terminal in the project directory and run:
```bash
setup-local.bat
```
*This script automates `.env` creation, dependency installation, and database configuration.*

### 🛠️ Manual Setup
If you prefer to set up manually:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/RafaelSanzio01/inthebox
    cd inthebox
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Variables:**
    Copy `.env.example` to `.env` and paste your `TMDB_API_KEY`.
4.  **Prepare Database:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

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
