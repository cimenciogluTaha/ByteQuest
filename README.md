# ByteQuest 🐍⚔️

ByteQuest is a gamified, interactive coding platform built with React, Vite, and Tailwind CSS. It empowers users to learn programming languages like Python, C#, and Java through fun, bite-sized lessons, interactive challenges, and a rich progression system.

## 🌟 Features

- **Gamified Learning Experience**: Learn programming fundamentals through interactive, fill-in-the-blank, and match-pair quizzes.
- **Progression System**: Earn XP, collect Gems 💎, maintain your daily streak 🔥, and level up to unlock new titles.
- **Global Leaderboard**: Compete with other learners in real-time. (Powered by Firebase Firestore).
- **Lingo AI Tutor**: Stuck on a problem? Ask the Lingo AI assistant for guidance and explanations (Powered by Google Gemini API).
- **Store & Economy**: Spend your hard-earned gems on health refills, energy potions, and VIP ranks.
- **Cloud Synchronization**: Securely save your progression to the cloud using Firebase Auth & Firestore. Support for Email/Password, Google, and GitHub logins.
- **Dynamic Themes**: Supports both beautiful Dark and Light modes.
- **Responsive Design**: Mobile-first architecture ensures a seamless experience across all devices.

## 🚀 Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (`motion/react`)
- **Icons**: Lucide React
- **Backend / BaaS**: Firebase (Authentication, Firestore)
- **AI Integration**: Google Gemini API (via Express/Custom Backend routing)

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/cimenciogluTaha/ByteQuest.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Firebase configuration and Gemini API Key (if running the backend locally).

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🎮 How to Play

1. **Choose a Language**: Start with Python, C#, or Java.
2. **Complete Lessons**: Answer questions correctly to earn XP and Gems.
3. **Manage Energy & Hearts**: Incorrect answers cost hearts. Lessons cost energy. Wait for them to refill or buy them from the Store!
4. **Climb the Leaderboard**: Push your stats to the cloud and see how you rank globally.

## 📝 License

This project is open-source and available for educational purposes.
