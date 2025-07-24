# 🎵 Spotify Artist Grabber

Create a playlist on Spotify with **all available tracks from your favorite artist** — albums, singles, and compilations included!

Built with **Next.js App Router**, **TypeScript**, and the **Spotify Web API**.

[Live Demo](https://sg.jxcs.space/)

![](https://raw.githubusercontent.com/xRiddiK/SpotiGrabber/refs/heads/main/frontend/screenshots/Screenshot_4.png)
![](https://raw.githubusercontent.com/xRiddiK/SpotiGrabber/refs/heads/main/frontend/screenshots/Screenshot_5.png)
![](https://raw.githubusercontent.com/xRiddiK/SpotiGrabber/refs/heads/main/frontend/screenshots/Screenshot_6.png)
![](https://raw.githubusercontent.com/xRiddiK/SpotiGrabber/refs/heads/main/frontend/screenshots/Screenshot_7.png)

---

## 🚀 Features

- 🔐 OAuth login with Spotify
- 🔍 Search for any artist by name
- 🎧 Automatically creates a playlist with **every track** from the artist’s discography
- 🚫 Duplicate remover tool *(currently disabled due to bug — fix planned)*
- ⚡ Clean UI inspired by **Spotify’s design aesthetic**

---

## 📦 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth/API**: Spotify OAuth + Web API
- **Hosting**: Local Dev (fully front-end driven — no backend server needed)

---

## 📋 Requirements

- [Node.js](https://nodejs.org/) (v22+ recommended)
- [pnpm](https://pnpm.io/) *(optional but recommended for faster installs)*
- Basic knowledge of JavaScript/TypeScript and the terminal

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/xRiddiK/SpotiGrabber.git
cd SpotiGrabber/frontend
```

### 2. Install Dependencies

```
npm install
```

### 3. Create a Spotify App

- Go to [Spotify Dev Dashboard](https://developer.spotify.com/)
- Create a new app
- Add this to your Redirect URIs:
```
http://127.0.0.1:3000/api/callback
```
![](https://raw.githubusercontent.com/xRiddiK/SpotiGrabber/refs/heads/main/frontend/screenshots/Screenshot_8.png)
![](https://raw.githubusercontent.com/xRiddiK/SpotiGrabber/refs/heads/main/frontend/screenshots/Screenshot_9.png)

### 4. Add Environment Variables
- Create a .env file in /frontend
```
CLIENT_ID=your_spotify_client_id
CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=http://127.0.0.1:3000/api/callback
NEXT_PUBLIC_API_URL=http://127.0.0.1:3000
```

### Run the App Locally

```
npm run dev
```

Then open 
```
http://127.0.0.1:3000
```
Log in with Spotify
Enter an artist's name
Get a full playlist automatically created in your account!
Success!


### Known Issues
- Duplicate Remover is currently disabled — was deleting both copies instead of one.

- Tokens are passed via URL temporarily (should be stored in cookies or session for better UX).

- Edge cases (e.g. artists with duplicate names or massive catalogs) may need refinements.



## Authors

- [@JXCS](https://github.com/xRiddiK)
