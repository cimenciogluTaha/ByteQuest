import React, { useState } from "react";
import { LessonUnit, Language, UserStats, getLanguageMascot } from "../types";
import { Lock, Check, Play, BookOpen, Clock, Zap, Crown, Heart } from "lucide-react";
import { motion } from "motion/react";

interface LessonTreeProps {
  lessons: LessonUnit[];
  stats: UserStats;
  onStartLesson: (lessonId: string) => void;
  onRefillHearts: () => void;
  onRefillEnergy: () => void;
  onToggleVip: () => void;
  onClaimDailyReward?: (gems: number, xp: number) => void;
}

export default function LessonTree({ 
  lessons, 
  stats, 
  onStartLesson, 
  onRefillHearts,
  onRefillEnergy,
  onToggleVip,
  onClaimDailyReward
}: LessonTreeProps) {
  const [showHeartSuccess, setShowHeartSuccess] = useState(false);
  const [showEnergySuccess, setShowEnergySuccess] = useState(false);
  const [showVipSuccess, setShowVipSuccess] = useState(false);

  const [dailyClaimed, setDailyClaimed] = useState<boolean>(() => {
    const lastClaim = localStorage.getItem("codelingo_last_daily_claim");
    if (!lastClaim) return false;
    const todayStr = new Date().toDateString();
    return lastClaim === todayStr;
  });
  const [claimedReward, setClaimedReward] = useState<{ gems: number; xp: number } | null>(null);

  const isLight = stats.theme === "light";
  const mascot = getLanguageMascot(stats.activeLanguage);

  const handleClaimDaily = () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem("codelingo_last_daily_claim", todayStr);
    
    // Rewards scale with daily streak!
    const baseGems = 15;
    const baseXp = 25;
    
    const streakBonusGems = Math.floor((stats.streak || 1) * 2);
    const streakBonusXp = Math.floor((stats.streak || 1) * 5);
    
    const totalGems = baseGems + streakBonusGems;
    const totalXp = baseXp + streakBonusXp;
    
    if (onClaimDailyReward) {
      onClaimDailyReward(totalGems, totalXp);
    }
    
    setClaimedReward({ gems: totalGems, xp: totalXp });
    setDailyClaimed(true);
  };

  // Dynamic mascot feedback phrases based on different languages
  const getMascotSpeech = () => {
    switch (stats.activeLanguage) {
      case "python":
        return "Python her geçen gün devleşiyor! Yapay zeka, veri analitiği ve otomasyon için harika bir seçim. Ders ağacından ilk adımı at ve yıldızları topla!";
      case "csharp":
        return "C# ile muazzam oyunlar (Unity) ve kurumsal uygulamalar yazabilirsin! C#'ın güçlü tip güvenliğini öğrenerek süper geliştirici ol.";
      case "java":
        return "Java bir kere yazılır, her yerde çalışır! Android dünyasından kurumsal devlere kadar zirvededir. Sınıfları ve nesneleri fethetmeye hazır mısın?";
      default:
        return "Öğrenmek bir maceradır! Bugün harika bir gün, biraz pratik yapalım!";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: Lesson Tree Node Path */}
      <div className="lg:col-span-2 flex flex-col items-center">
        
        {/* Course Header Banner */}
        <div className="w-full bg-emerald-500 rounded-3xl p-6 text-slate-950 text-center shadow-2xl shadow-emerald-500/20 mb-10 relative overflow-hidden">
          <div className="absolute right-0 top-0 text-7xl opacity-15 transform translate-x-4 -translate-y-2 select-none">
            {stats.activeLanguage === "python" ? "🐍" : stats.activeLanguage === "csharp" ? "⚔️" : "☕"}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">MÜFREDAT DERS AĞACI (10 SEVİYE)</div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
            {stats.activeLanguage} EĞİTİMİ
          </h2>
          <p className="text-xs opacity-95 max-w-sm mx-auto font-bold leading-relaxed">
            Günde sadece 5 dakika pratik yaparak kodlamada zirveye ulaşın! Yıldızları kazanıp sıralamada yükselin.
          </p>
        </div>
 
        {/* Tree Path Nodes */}
        <div className="relative flex flex-col items-center w-full gap-16 min-h-[500px]">
          
          {/* Vertical Connecting line (underlaid) */}
          <div className={`absolute w-2 top-12 bottom-12 rounded-full left-1/2 transform -translate-x-1/2 -z-10 ${
            isLight ? "bg-slate-350" : "bg-slate-800"
          }`} />

          {lessons.map((lesson, idx) => {
            // Determine status based on current XP and previous completions
            const isCompleted = stats.completedLessons.includes(lesson.id);
            const isFirst = idx === 0;
            const requiredLessonsCompleted = idx === 0 || stats.completedLessons.includes(lessons[idx - 1].id);
            const canUnlock = stats.xp >= lesson.requiredXp && requiredLessonsCompleted;
            
            const currentStatus = isCompleted 
              ? "completed" 
              : canUnlock 
                ? "available" 
                : "locked";

            // Offset alignment to make traditional Duolingo serpentine path!
            const rotationOffset = idx % 3 === 0 ? "translate-x-0" : idx % 3 === 1 ? "translate-x-8 md:translate-x-12" : "-translate-x-8 md:-translate-x-12";

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative flex flex-col items-center ${rotationOffset}`}
              >
                
                {/* Node Level Label */}
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xs mb-3 tracking-widest ${
                  isLight 
                    ? "text-slate-600 bg-slate-200 border border-slate-300"
                    : "text-slate-400 bg-slate-900 border border-slate-800"
                }`}>
                  SEVİYE {idx + 1}
                </span>

                {/* Duolingo Circular Stepping Node Button */}
                <button
                  onClick={() => currentStatus !== "locked" && onStartLesson(lesson.id)}
                  className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-black text-lg relative outline-none focus:ring-4 focus:ring-emerald-500/20 shadow-xl transform active:scale-95 transition-all duration-300 cursor-pointer ${
                    currentStatus === "completed"
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-b-[8px] border-emerald-700 hover:border-b-4 hover:translate-y-[2px]"
                      : currentStatus === "available"
                        ? "bg-amber-400 hover:bg-amber-500 text-amber-950 border-b-[8px] border-amber-600 hover:border-b-4 hover:translate-y-[2px]"
                        : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed border-b-[8px] border-slate-400 dark:border-slate-900 pointer-events-none grayscale"
                  }`}
                  disabled={currentStatus === "locked"}
                >
                  {currentStatus === "completed" ? (
                    <Check className="w-8 h-8 stroke-[3]" />
                  ) : currentStatus === "available" ? (
                    <Play className="w-8 h-8 stroke-[3] fill-amber-950" />
                  ) : (
                    <Lock className="w-7 h-7" />
                  )}

                  {/* Little Floating Star Badge */}
                  {currentStatus === "completed" && (
                    <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-slate-950 p-1 rounded-full text-xs animate-bounce shadow-md font-black">
                      ⭐
                    </div>
                  )}
                </button>

                {/* Lesson title and info */}
                <div className="text-center mt-3 max-w-[180px]">
                  <h3 className={`text-sm font-black uppercase tracking-tight leading-snug ${
                    isLight ? "text-slate-800" : "text-slate-100"
                  }`}>
                    {lesson.title}
                  </h3>
                  {currentStatus === "locked" ? (
                    <p className="text-[10px] text-red-500 font-extrabold mt-1 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded">
                      🔒 {lesson.requiredXp} XP GEREKLİ
                    </p>
                  ) : currentStatus === "completed" ? (
                    <p className="text-[10px] text-emerald-500 font-extrabold mt-1 uppercase tracking-widest">
                      TAMAMLANDI
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-500 font-extrabold mt-1 uppercase tracking-widest animate-pulse">
                      HAZIR GÖREV (25⚡)
                    </p>
                  )}
                </div>

              </motion.div>
            );
          })}

        </div>
      </div>

      {/* RIGHT COLUMN: Mascot and Shop */}
      <div className="flex flex-col gap-6">

        {/* Daily Reward Chest Card */}
        <div className={`rounded-3xl p-6 border shadow-xl relative overflow-hidden backdrop-blur-md transition-all ${
          isLight
            ? "bg-white border-slate-200 text-slate-800"
            : "bg-slate-900/50 border-slate-800 text-slate-150"
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full transform translate-x-4 -translate-y-4 pointer-events-none" />
          
          <div className="text-[9px] font-black tracking-widest text-[#f59e0b] uppercase block mb-1">GÜNLÜK BONUS KARTI</div>
          <h4 className={`text-sm font-black uppercase tracking-tight flex items-center gap-2 mb-3 ${
            isLight ? "text-slate-900" : "text-slate-100"
          }`}>
            <span>🎁</span> GÜNLÜK ÖDÜL SANDIĞI
          </h4>

          {!dailyClaimed ? (
            <div className="space-y-3 text-center py-2">
              <span className="text-5xl block animate-bounce my-2">📦</span>
              <p className={`text-[11px] font-bold leading-relaxed max-w-xs mx-auto ${isLight ? "text-slate-600" : "text-slate-350"}`}>
                Bugünkü hediye paketinde senin için bekleyen gizemli kodlama ödülleri var!
              </p>
              <button
                onClick={handleClaimDaily}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer mt-1"
              >
                HEDİYEMİ AL 🔓
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-center py-2">
              <span className="text-5xl block my-2">🎉</span>
              <p className="text-[11px] text-emerald-500 font-extrabold uppercase tracking-wider">
                ÖDÜLÜNÜ BAŞARIYLA KAPTIN!
              </p>
              {claimedReward && (
                <div className="flex justify-center gap-4 py-1.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 max-w-xs mx-auto">
                  <div className="text-xs font-black text-emerald-400">⭐ +{claimedReward.xp} XP</div>
                  <div className="text-xs font-black text-cyan-400">💎 +{claimedReward.gems} GEMS</div>
                </div>
              )}
              <p className="text-[10px] text-slate-500 font-bold block">
                Yarın yeni bir ödül paketiyle Lingo seni bekliyor olacak! Seri korumaya devam et 🔥
              </p>
            </div>
          )}
        </div>
        
        {/* Mascot Speech Container */}
        <div className={`rounded-3xl p-6 border shadow-xl relative overflow-hidden backdrop-blur-md ${
          isLight
            ? "bg-white border-slate-200 text-slate-800"
            : "bg-slate-900/50 border-slate-800 text-slate-150"
        }`}>
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl animate-bounce select-none">{mascot.emoji}</span>
            <div className={`relative border rounded-2xl p-4 text-xs font-semibold leading-relaxed ${
              isLight 
                ? "bg-slate-100 border-slate-200 text-slate-700" 
                : "bg-slate-950 border-slate-850 text-slate-300"
            }`}>
              <span className={`font-black ${mascot.accentColor} text-xs tracking-wider block mb-1 uppercase`}>{mascot.name} Diyor ki:</span>
              {getMascotSpeech()}
              
              {/* Triangular balloon arrow styling */}
              <div className={`absolute w-3 h-3 border-l border-b transform rotate-45 -left-[7px] top-4 ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-850"
              }`} />
            </div>
          </div>
          <div className={`h-px my-4 ${isLight ? "bg-slate-200" : "bg-slate-800"}`} />
          
          <div className="space-y-3">
            <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}>
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Bugün {stats.completedLessons.length} ders tamamladın.</span>
            </div>

            {/* General Energy Requirement Warning */}
            <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}>
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Her yeni ders maliyeti: <b className="text-amber-500 font-extrabold">25⚡ Enerji</b></span>
            </div>
          </div>
        </div>

        {/* Shop/Market Panel */}
        <div className={`rounded-3xl p-6 border shadow-xl backdrop-blur-md ${
          isLight
            ? "bg-white border-slate-200 text-slate-800"
            : "bg-slate-900/50 border-slate-800 text-slate-150"
        }`}>
          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">MÜCEVHERLERİNİ DEĞERLENDİR</div>
          <h4 className={`text-base font-black uppercase tracking-tight mb-2 flex items-center gap-2 ${
            isLight ? "text-slate-900" : "text-slate-100"
          }`}>
            🛒 MARKET VE AKADEMİ RAFI
          </h4>
          <p className={`text-xs font-bold mb-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            Kodlama maratonunda kazandığın 💎 mücevherlerle özel can kalkanları, enerji dolumları veya VIP sınırsızlık satın al!
          </p>

          <div className="space-y-3.5">
            
            {/* Item 1: Hearts Refill */}
            <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50 border-slate-200 hover:bg-slate-100" : "bg-slate-950 border-slate-850 hover:bg-slate-900"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-red-500 text-slate-950 rounded-xl flex items-center justify-center text-lg shadow-md font-bold">
                  ❤️
                </div>
                <div>
                  <span className={`font-black uppercase text-xs block tracking-tight ${isLight ? "text-slate-800" : "text-slate-100"}`}>CAN SİPERİ</span>
                  <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider block">5 CAN FULL TAZELENİR</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (stats.gems >= 50) {
                    onRefillHearts();
                    setShowHeartSuccess(true);
                    setTimeout(() => setShowHeartSuccess(false), 3000);
                  } else {
                    alert("Yetersiz mücevher! 50 💎 gerekiyor.");
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                50 💎
              </button>
            </div>

            {/* Item 2: Energy Refill */}
            <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
              isLight ? "bg-slate-50 border-slate-200 hover:bg-slate-100" : "bg-slate-950 border-slate-850 hover:bg-slate-900"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center text-lg shadow-md font-bold">
                  ⚡
                </div>
                <div>
                  <span className={`font-black uppercase text-xs block tracking-tight ${isLight ? "text-slate-800" : "text-slate-100"}`}>ENERJİ DEPOSU</span>
                  <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider block">ENERJİ %100 DOLAR</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (stats.gems >= 30) {
                    onRefillEnergy();
                    setShowEnergySuccess(true);
                    setTimeout(() => setShowEnergySuccess(false), 3000);
                  } else {
                    alert("Yetersiz mücevher! 30 💎 gerekiyor.");
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest py-1.5 px-3 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                30 💎
              </button>
            </div>

            {/* Item 3 VIP Membership */}
            <div className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${
              stats.isVip 
                ? "bg-amber-400/10 border-amber-400/30" 
                : isLight ? "bg-slate-50 border-slate-200 hover:bg-slate-100" : "bg-slate-950 border-slate-850 hover:bg-slate-900"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-yellow-400 text-slate-950 rounded-xl flex items-center justify-center text-lg shadow-md font-bold animate-pulse">
                    👑
                  </div>
                  <div>
                    <span className={`font-black uppercase text-xs block tracking-tight ${isLight ? "text-slate-800" : "text-slate-100"}`}>VIP ÜYELİK</span>
                    <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider block">SINIRSIZ ENERJİ AKTİFLEŞİR</span>
                  </div>
                </div>

                {!stats.isVip ? (
                  <button
                    onClick={() => {
                      if (stats.gems >= 100) {
                        onToggleVip();
                        setShowVipSuccess(true);
                        setTimeout(() => setShowVipSuccess(false), 3000);
                      } else {
                        alert("Yetersiz mücevher! VIP Olmak için 100 💎 gerekiyor.");
                      }
                    }}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest py-1.5 px-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    100 💎
                  </button>
                ) : (
                  <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-2 py-1 rounded-md animate-pulse">
                    VIP AKTİF
                  </span>
                )}
              </div>

              {/* Toggle switch for testing convenience */}
              <div className={`flex items-center justify-between mt-1 pt-2 border-t ${
                isLight ? "border-slate-200" : "border-slate-800"
              }`}>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Üyelik Modunu Değiştir</span>
                <button
                  type="button"
                  onClick={onToggleVip}
                  className={`text-[9px] font-black uppercase tracking-widest py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
                    stats.isVip
                      ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {stats.isVip ? "İPTAL ET" : "DOĞRUDAN VIP OL"}
                </button>
              </div>
            </div>

          </div>

          <div className="mt-4 space-y-2">
            {showHeartSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-wider"
              >
                ❤️ Canların başarıyla tazelendi! (5 can)
              </motion.div>
            )}

            {showEnergySuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-black uppercase tracking-wider"
              >
                ⚡ Kodlama enerjin %100 seviyeye tırmandı!
              </motion.div>
            )}

            {showVipSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-500 rounded-xl text-xs font-black uppercase tracking-wider animate-pulse"
              >
                👑 Tebrikler! ByteQuest VIP üyesi oldunuz. Sınırsız Enerji aktif!
              </motion.div>
            )}
          </div>
        </div>

        {/* Dynamic Coding Quote */}
        <div className={`rounded-2xl p-5 border text-center ${
          isLight
            ? "bg-slate-100 border-slate-200"
            : "bg-slate-950 border-slate-800 opacity-85"
        }`}>
          <p className={`text-xs italic font-semibold ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            "Hata yapmaktan korkmayın. Her hata, derleyicinin size sunduğu muhteşem bir koddur."
          </p>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2.5 block">— LİNGO, BAŞ BAYKUŞ</span>
        </div>

      </div>

    </div>
  );
}
