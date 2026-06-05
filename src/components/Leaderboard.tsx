import React from "react";
import { LeaderboardUser, Language, getLanguageMascot } from "../types";
import { Award, ArrowUp, ArrowDown, Minus, Crown, Flame } from "lucide-react";
import { motion } from "motion/react";

interface LeaderboardProps {
  users: LeaderboardUser[];
  theme?: string;
  activeLanguage?: Language;
}

export default function Leaderboard({ users, theme = "dark", activeLanguage = "python" }: LeaderboardProps) {
  const isLight = theme === "light";
  const mascot = getLanguageMascot(activeLanguage);
  
  // Sorting users list by XP so ranks shift automatically and mapping owl avatar to active language mascot
  const sortedUsers = [...users]
    .map(user => {
      if (user.isCurrentUser || user.avatar === "🦉") {
        return { ...user, avatar: mascot.emoji };
      }
      return user;
    })
    .sort((a, b) => b.xp - a.xp);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      
      {/* Header Info */}
      <div className="text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className={`inline-block p-4 rounded-full mb-3 ${
            isLight
              ? "bg-emerald-100 border border-emerald-200 text-emerald-600"
              : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          }`}
        >
          <Crown className="w-12 h-12 stroke-[2.5]" />
        </motion.div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">KÜRESEL REKABET</div>
        <h2 className={`text-2xl font-black uppercase tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
          Haftalık Zümrüt Ligi
        </h2>
        <p className={`text-xs font-bold mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
          Dersleri bitirip XP kazandıkça yukarı tırman! Lig sona ermeden önce sıralamanı koru.
        </p>
      </div>

      {/* Podium Top 3 (Duolingo Style in Dark/Light Mode) */}
      <div className="grid grid-cols-3 gap-4 items-end mb-10 pt-4 max-w-sm mx-auto">
        
        {/* Number 2 */}
        {sortedUsers[1] && (
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1 filter drop-shadow">{sortedUsers[1].avatar}</span>
            <div className={`w-full rounded-t-2xl p-3 text-center border-t border-x shadow-xl ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}>
              <span className={`text-[10px] font-black block truncate uppercase tracking-tight ${
                isLight ? "text-slate-800" : "text-slate-350"
              }`}>{sortedUsers[1].name}</span>
              <span className={`text-xs font-black block mt-0.5 ${
                isLight ? "text-slate-600 block" : "text-slate-550 block"
              }`}>{sortedUsers[1].xp} XP</span>
              <div className={`mt-2.5 font-black text-xs py-1 rounded-lg border ${
                isLight 
                  ? "bg-slate-100 border-slate-200 text-slate-700" 
                  : "bg-slate-800 border-slate-700 text-slate-300"
              }`}>
                2
              </div>
            </div>
          </div>
        )}

        {/* Number 1 */}
        {sortedUsers[0] && (
          <div className="flex flex-col items-center transform scale-105 z-10">
            <span className="text-4xl mb-1 filter drop-shadow-lg animate-bounce">{sortedUsers[0].avatar}</span>
            <div className="w-full bg-emerald-500 text-slate-950 rounded-t-2xl p-4 text-center border-t border-x border-emerald-400 shadow-2xl shadow-emerald-500/20">
              <span className="text-xs font-black block truncate uppercase tracking-tight">{sortedUsers[0].name}</span>
              <span className="text-xs font-black block mt-0.5">{sortedUsers[0].xp} XP</span>
              <div className="mt-2.5 bg-slate-950 text-emerald-400 font-neutral text-sm py-1.5 rounded-lg font-black shadow-sm">
                1
              </div>
            </div>
          </div>
        )}

        {/* Number 3 */}
        {sortedUsers[2] && (
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1 filter drop-shadow">{sortedUsers[2].avatar}</span>
            <div className={`w-full rounded-t-2xl p-3 text-center border-t border-x shadow-xl ${
              isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}>
              <span className={`text-[10px] font-black block truncate uppercase tracking-tight ${
                isLight ? "text-slate-800" : "text-slate-350"
              }`}>{sortedUsers[2].name}</span>
              <span className={`text-xs font-black block mt-0.5 ${
                isLight ? "text-slate-600 block" : "text-slate-550 block"
              }`}>{sortedUsers[2].xp} XP</span>
              <div className={`mt-2.5 font-black text-xs py-1 rounded-lg border ${
                isLight 
                  ? "bg-slate-100 border-slate-200 text-amber-700 border-amber-300" 
                  : "bg-slate-800 border-slate-700 text-amber-600"
              }`}>
                3
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Ranks list */}
      <div className={`rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-md ${
        isLight
          ? "bg-white border-slate-200 divide-y divide-slate-100"
          : "bg-slate-900/50 border-slate-800 divide-y divide-slate-800"
      }`}>
        {sortedUsers.map((user, index) => {
          const rank = index + 1;
          const isMe = user.isCurrentUser;

          return (
            <motion.div
              key={user.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-4 ${
                isMe ? (isLight ? "bg-emerald-50 border-l-4 border-emerald-500" : "bg-emerald-500/10 border-l-4 border-emerald-500") : ""
              }`}
            >
              
              <div className="flex items-center gap-4">
                {/* Position Rank */}
                <div className="w-8 flex items-center justify-center font-black text-xs text-slate-400">
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-inner ${
                  isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"
                }`}>
                  {user.avatar}
                </div>

                {/* Name */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-black tracking-tight uppercase ${isMe ? "text-emerald-500" : (isLight ? "text-slate-800" : "text-slate-100")}`}>
                      {user.name}
                    </span>
                    {isMe && (
                      <span className="text-[8px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md font-black tracking-widest uppercase">
                        SEN
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider block mt-0.5 ${
                    isLight ? "text-slate-500" : "text-slate-500"
                  }`}>
                    {user.xp > 300 ? "KOD CANAVARI" : user.xp > 150 ? "PRATİSYEN" : "MÜPTEDİ"}
                  </span>
                </div>
              </div>

              {/* Score and Rank Trend delta */}
              <div className="flex items-center gap-4">
                {/* Score */}
                <div className="text-right">
                  <span className={`font-black text-xs tracking-wider font-mono ${
                    isLight ? "text-slate-800" : "text-slate-100"
                  }`}>{user.xp} XP</span>
                </div>

                {/* Up/Down delta */}
                <div className={`w-6 flex items-center justify-center border-l pl-3 ${
                  isLight ? "border-slate-200" : "border-slate-800"
                }`}>
                  {user.status === "up" ? (
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-500 stroke-[3.5]" />
                  ) : user.status === "down" ? (
                    <ArrowDown className="w-3.5 h-3.5 text-red-500 stroke-[3.5]" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-slate-400 stroke-[3.5]" />
                  )}
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Lig Promotion Footer Alert */}
      <div className={`mt-8 border rounded-3xl p-5 flex items-center gap-4 shadow-xl ${
        isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"
      }`}>
        <div className="text-2xl animate-pulse">🗳️</div>
        <div>
          <span className="font-black text-emerald-500 text-xs tracking-wider uppercase block mb-0.5">TERFİ ANLAŞMASI</span>
          <p className={`text-[10px] font-semibold leading-relaxed ${isLight ? "text-slate-600" : "text-slate-400"}`}>
            Haftalık ligin bitiminde ilk 3 sırada yer alan geliştiriciler bir sonraki üst seviye lig olan <b className="text-indigo-500">Yakut Ligi'ne</b> seçilecektir.
          </p>
        </div>
      </div>

    </div>
  );
}
