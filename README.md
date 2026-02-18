# 🛡️ TRUST ME — Teen‑Focused AI Safety Agent 💙

Short, clear, and focused description of the project and how to run it.

## 🎯 Overview
Teen‑focused AI chat agent that provides safe, non‑judgmental guidance. It adapts responses by age/profile and enforces clear boundaries to help prevent bullying and exposure to harmful content.

## ✨ Features
- 🖼️ Picture Safety: flags risky/AI‑generated images.
- 📺 YouTube Check: analyzes videos for age‑appropriateness and harmful content.
- 🧒 Age‑Aware Replies: adjusts tone and guidance to the user’s profile.
- 🧭 Guided Topics: safe conversation starters for tough moments.
- 🔒 Privacy Controls: users can clear chat history.

## 🛠️ Tech Stack
- 🧩 React 19, Vite, React Router, Axios
- ⚙️ Node.js 20, Express 5, MongoDB (Mongoose)
- 🔐 Google OAuth, ☁️ Cloudinary, 🤖 OpenAI SDK

## ⚡ Quick Start
1) 🔧 Server env (create server/.env):
```
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=YOUR_MONGODB_URI
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
```

2) 🧩 Client env (create client/.env):
```
VITE_SERVER_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

3) ▶️ Install & run:
```
# terminal 1
cd server && npm i && npm run dev

# terminal 2
cd client && npm i && npm run dev
```

Demo video : https://m.youtube.com/watch?v=7-ARs6UO6Vg

That’s it: client on http://localhost:3000, server on http://localhost:5000.

## 🙏 Thanks
Mentor: Maya Gershovitz Bar. Team: Or Ishlach, Ori Katz, Miryam Mazor, Tamar.


