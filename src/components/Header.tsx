import React from "react";
import { Language, UserStats, getLanguageMascot } from "../types";
import { Heart, Trophy, Zap, Compass, UserCheck, Sun, Moon, Terminal, Gamepad2, Store } from "lucide-react";

interface HeaderProps {
  stats: UserStats;
  onLanguageChange: (lang: Language) => void;
  onTabChange: (tab: string) => void;
  activeTab: string;
  onToggleTheme: () => void;
  onToggleVip: () => void;
}

export default function Header({ 
  stats, 
  onLanguageChange, 
  onTabChange, 
  activeTab,
  onToggleTheme,
  onToggleVip
}: HeaderProps) {
  const isLight = stats.theme === "light";

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-xl transition-all duration-300 ${
      isLight 
        ? "bg-white/90 border-slate-200 text-slate-900" 
        : "bg-slate-900/90 border-slate-800 text-slate-100"
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo and Language Selector */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onTabChange("learn")}>
            <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20 transform group-hover:rotate-6 transition-all duration-300">
              {getLanguageMascot(stats.activeLanguage).emoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black text-emerald-500 tracking-tighter uppercase">ByteQuest</h1>
                {stats.isVip && (
                  <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-md animate-pulse whitespace-nowrap shadow-sm">
                    👑 VIP
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest block -mt-1 ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}>
                YAZILIM AKADEMİSİ
              </span>
            </div>
          </div>

          <div className="relative">
            <select
              value={stats.activeLanguage}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className={`appearance-none border py-1.5 px-4 pr-8 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer hover:border-emerald-400 focus:outline-none transition-all ${
                isLight 
                  ? "bg-slate-100 border-slate-200 text-slate-800" 
                  : "bg-slate-800 border-slate-700 text-slate-100"
              }`}
            >
              <option value="python">🐍 PYTHON</option>
              <option value="csharp">⚔️ C-SHARP</option>
              <option value="java">☕ JAVA</option>
            </select>
            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-xs ${
              isLight ? "text-slate-500" : "text-slate-400"
            }`}>
              ▼
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={`flex items-center gap-1.5 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto border ${
          isLight 
            ? "bg-slate-100 border-slate-200" 
            : "bg-slate-950 border-slate-800"
        }`}>
          <button
            onClick={() => onTabChange("learn")}
            className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "learn"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15"
                : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            <Compass className="w-4 h-4 stroke-[2.5]" />
            ÖĞREN
          </button>

          <button
            onClick={() => onTabChange("playground")}
            className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "playground"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15"
                : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            <Terminal className="w-4 h-4 stroke-[2.5]" />
            KOD ALANI
          </button>

          <button
            onClick={() => onTabChange("battle")}
            className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "battle"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15"
                : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            <Gamepad2 className="w-4 h-4 stroke-[2.5]" />
            DÜELLO
          </button>
          
          <button
            onClick={() => onTabChange("leaderboard")}
            className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "leaderboard"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15"
                : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            <Trophy className="w-4 h-4 stroke-[2.5]" />
            LİDERLİK
          </button>

          <button
            onClick={() => onTabChange("quests")}
            className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "quests"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15"
                : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            <Zap className="w-4 h-4 stroke-[2.5]" />
            GÖREVLER
          </button>

          <button
            onClick={() => onTabChange("store")}
            className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "store"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15"
                : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            <Store className="w-4 h-4 stroke-[2.5]" />
            MAĞAZA
          </button>

          <button
            onClick={() => onTabChange("profile")}
            className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "profile"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/15"
                : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4 stroke-[2.5]" />
            PROFİL
          </button>
        </nav>

        {/* Score metrics, Theme Toggle, & Hearts */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
          
          <div className={`flex flex-wrap items-center gap-3 px-4 py-2 rounded-2xl border ${
            isLight
              ? "bg-slate-100 border-slate-200"
              : "bg-slate-950 border-slate-800"
          }`}>
            {/* Streak */}
            <div className="flex items-center gap-1 cursor-help" title="Günlük Seri">
              <span className="text-base">🔥</span>
              <span className="font-extrabold text-orange-500 text-xs">{stats.streak} GÜN</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1 cursor-help" title="Kazanılan toplam Deneyim Puanı">
              <span className="text-base">⭐</span>
              <span className="font-extrabold text-emerald-500 text-xs">{stats.xp} XP</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1 cursor-help" title="Mücevherler">
              <span className="text-base">💎</span>
              <span className="font-extrabold text-cyan-500 text-xs">{stats.gems}</span>
            </div>

            {/* NEW Energy bar indicator */}
            <div className="flex items-center gap-1 cursor-help border-l border-slate-300 dark:border-slate-800 pl-2" title="Yazılım Enerjisi">
              <span className="text-base text-amber-500">⚡</span>
              <span className={`font-black text-xs ${stats.isVip ? "text-amber-500 uppercase tracking-widest" : isLight ? "text-slate-700" : "text-amber-400"}`}>
                {stats.isVip ? "SINIRSIZ" : `${stats.energy ?? 100}%`}
              </span>
            </div>

            {/* Lives (Hearts) */}
            <div className="flex items-center gap-0.5 min-w-[60px] justify-end border-l border-slate-300 dark:border-slate-800 pl-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-transform duration-300 ${
                    i < stats.hearts
                      ? "fill-red-500 text-red-500 scale-100 hover:scale-110"
                      : "text-slate-400 dark:text-slate-700 scale-95"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick theme toggler */}
          <button
            onClick={onToggleTheme}
            title={isLight ? "Koyu Temaya Geç" : "Açık Temaya Geç"}
            className={`p-2 rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer ${
              isLight
                ? "bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200"
                : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
            }`}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700 stroke-[2.5]" /> : <Sun className="w-4 h-4 text-yellow-400 stroke-[2.5]" />}
          </button>

        </div>

      </div>
    </header>
  );
}
