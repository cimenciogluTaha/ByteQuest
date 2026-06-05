import React, { useState, useEffect } from "react";
import { UserStats, Language } from "../types";
import { Zap, RefreshCw, Trophy, Heart, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TriviaArenaProps {
  stats: UserStats;
  onReward: (gems: number, xp: number) => void;
  theme?: string;
}

interface TriviaQuestion {
  prompt: string;
  options: string[];
  correct: string;
}

const TRIVIA_QUESTIONS: Record<Language, TriviaQuestion[]> = {
  python: [
    {
      prompt: "Python'da bir elemanı listenin sonuna eklemek için hangi metot kullanılır?",
      options: ["add()", "push()", "append()", "insert()"],
      correct: "append()"
    },
    {
      prompt: "Python'da liste uzunluğunu bulmak için kullanılan gömülü fonksiyon hangisidir?",
      options: ["size()", "len()", "length()", "count()"],
      correct: "len()"
    },
    {
      prompt: "Hangisi Python sözlükleri (dictionary) için geçerli bir anahtar değer çifti tanımlama biçimidir?",
      options: ["{key = value}", "{key: value}", "[key: value]", "(key => value)"],
      correct: "{key: value}"
    },
    {
      prompt: "Python'da 'a = [1, 2, 3]' listesinde 'a[-1]' ifadesi hangi çıktıyı verir?",
      options: ["1", "-1", "3", "Hata verir"],
      correct: "3"
    },
    {
      prompt: "Python'da bir fonksiyon tanımlamak için hangi kelime kullanılır?",
      options: ["func", "def", "function", "lambda"],
      correct: "def"
    },
    {
      prompt: "Python'da bir dosya açıp, işlem bittikten sonra otomatik kapanmasını sağlayan blok hangisidir?",
      options: ["try-finally", "with open() as", "using", "open()"],
      correct: "with open() as"
    },
    {
      prompt: "Python'da 'immutable' (değiştirilemez) olan dizi yapısı hangisidir?",
      options: ["List", "Dictionary", "Tuple", "Set"],
      correct: "Tuple"
    },
    {
      prompt: "Python dilinde tamsayı bölme (floor division) yapan operatör hangisidir?",
      options: ["/", "//", "%", "div"],
      correct: "//"
    }
  ],
  csharp: [
    {
      prompt: "C# dilinde bir değişkenin değerinin sonradan değiştirilememesi için hangi anahtar kelime kullanılır?",
      options: ["final", "readonly", "const", "static"],
      correct: "const"
    },
    {
      prompt: "C#'ta bir nesneyi bellekten atmadan önce otomatik kaynak temizliği için hangi blok kullanılır?",
      options: ["with", "using", "try", "dispose"],
      correct: "using"
    },
    {
      prompt: "C# .NET ortamında garbage collector hangi yapıyı doğrudan temizler?",
      options: ["Stack", "Heap", "CPU Registers", "Harddisk"],
      correct: "Heap"
    },
    {
      prompt: "C# programlarında 'int?' ifadesi ne anlama gelir?",
      options: ["Koşullu tamsayı", "Tamsayı döndüren metot", "Nullable (boş olabilir) tamsayı", "Pointer türünde tamsayı"],
      correct: "Nullable (boş olabilir) tamsayı"
    },
    {
      prompt: "C#'ta sınıflar (classes) varsayılan olarak hangi erişim belirtecine (accessibility) sahiptir?",
      options: ["public", "private", "internal", "protected"],
      correct: "internal"
    },
    {
      prompt: "C# console uygulamasında tuşa basılmasını bekleyen metot hangisidir?",
      options: ["Console.ReadLine()", "Console.ReadKey()", "Console.Read()", "Console.Wait()"],
      correct: "Console.ReadKey()"
    },
    {
      prompt: "C#'ta bir sınıfın birden fazla sınıftan miras almasını sağlayan yapı hangisidir?",
      options: ["Abstract class", "Multiple inheritance class", "Interface", "Struct"],
      correct: "Interface"
    },
    {
      prompt: "C#'ta 'string' tipi hangi referans modeline aittir?",
      options: ["Value type", "Reference type", "Pointer", "Struct type"],
      correct: "Reference type"
    }
  ],
  java: [
    {
      prompt: "Java'da bir değişkeni tekrar atanamaz (sabit) hale getirmek için hangi kelime kullanılır?",
      options: ["const", "final", "static", "readonly"],
      correct: "final"
    },
    {
      prompt: "Java'da bir dizinin (array) eleman sayısını bulmak için hangi özellik (property) okunur?",
      options: ["length()", "size()", "length", "getSize()"],
      correct: "length"
    },
    {
      prompt: "Java'da tüm nesnelerin (objects) otomatik olarak miras aldığı ata sınıf hangisidir?",
      options: ["Class", "Object", "Super", "Base"],
      correct: "Object"
    },
    {
      prompt: "Java'da hafıza optimizasyonu sağlayan, değiştirilebilir karakter katarı nesnesi hangisidir?",
      options: ["String", "StringBuilder", "StringBuffer", "CharList"],
      correct: "StringBuilder"
    },
    {
      prompt: "Java'da 'double' ve 'float' aralarındaki fark nedir?",
      options: ["Double daha az hassastır", "Float 64-bit, Double 32-bittir", "Double 64-bit, Float 32-bittir", "Hiçbir fark yoktur"],
      correct: "Double 64-bit, Float 32-bittir"
    },
    {
      prompt: "Java'da hangi metot türü, bir nesne oluşturulmadan doğrudan sınıf adı üzerinden çağrılabilir?",
      options: ["abstract", "static", "final", "public"],
      correct: "static"
    },
    {
      prompt: "Java'da 'NullPointerException' hangi durumda fırlatılır?",
      options: ["Referans atanmamış bir nesneye erişildiğinde", "Geçersiz bir dizi indeksi girildiğinde", "Tamsayı sıfıra bölündüğünde", "Format hatası yapıldığında"],
      correct: "Referans atanmamış bir nesneye erişildiğinde"
    },
    {
      prompt: "Java platformunda bytecode dosyalarını (.class) çalıştıran sanal makineye ne denir?",
      options: ["JDK", "JRE", "JVM", "JAR"],
      correct: "JVM"
    }
  ]
};

export default function TriviaArena({ stats, onReward, theme = "dark" }: TriviaArenaProps) {
  const isLight = theme === "light";
  const activeLang = stats.activeLanguage;

  // Game lifecycle states
  const [gameState, setGameState] = useState<"lobby" | "playing" | "finished">("lobby");
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [selectedOpt, setSelectedOpt] = useState<string>("");
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | "">("");

  // Start the arena simulation
  const startChallenge = () => {
    // Shuffle the questions list
    const shuffled = [...TRIVIA_QUESTIONS[activeLang]].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setTimeLeft(45);
    setSelectedOpt("");
    setAnswerResult("");
    setGameState("playing");
  };

  // Timer Countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    if (timeLeft <= 0) {
      setGameState("finished");
      // Check for rewards
      if (score >= 4) {
        onReward(10, 20); // 10 Gems, 20 XP
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const handleSelectOption = (option: string) => {
    if (answerResult) return; // Prevent double taps

    setSelectedOpt(option);
    const correct = questions[currentIdx].correct;
    const isCorrect = option === correct;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setAnswerResult("correct");
    } else {
      setAnswerResult("wrong");
    }

    // Advance after short timeout
    setTimeout(() => {
      setSelectedOpt("");
      setAnswerResult("");
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setGameState("finished");
        // Final reward checker
        const finalScore = score + (isCorrect ? 1 : 0);
        if (finalScore >= 4) {
          onReward(10, 20);
        }
      }
    }, 1200);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      
      {/* 1. LOBBY STATE */}
      {gameState === "lobby" && (
        <div className={`text-center p-8 rounded-3xl border shadow-xl backdrop-blur-md ${
          isLight ? "bg-white border-slate-200" : "bg-slate-900/50 border-slate-800"
        }`}>
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-block p-4 bg-orange-500/10 border border-orange-500/25 rounded-full text-orange-400 mb-4"
          >
            <Zap className="w-14 h-14 stroke-[2]" />
          </motion.div>
          
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">REKABETÇİ HIZ TESTİ</div>
          <h2 className={`text-2xl font-black uppercase tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {activeLang.toUpperCase()} TRİVİA ARENASI
          </h2>
          <p className={`text-xs font-bold mt-2 mb-6 max-w-sm mx-auto leading-relaxed ${isLight ? "text-slate-650" : "text-slate-400"}`}>
            Tam 45 saniyen var! Karşına çıkan {activeLang} kodlama sorularını en hızlı şekilde doğru eşleştir. En az 4 doğru yaparak ekstra <b className="text-cyan-400 font-extrabold">10 💎 Mücevher</b> ve <b className="text-emerald-400 font-extrabold">20 XP</b> kazan!
          </p>

          <button
            onClick={startChallenge}
            className="w-full bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl shadow-xl shadow-orange-500/10 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            MÜCADELEYE BAŞLA ⚡
          </button>
        </div>
      )}

      {/* 2. PLAYING STATE */}
      {gameState === "playing" && questions[currentIdx] && (
        <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
          isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-slate-100"
        }`}>
          {/* Header Progress Indicators */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-500">
              <Clock className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>SÜRE: <b className="text-orange-500 font-mono font-black">{timeLeft}s</b></span>
            </div>

            <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
              SKOR: <b className="text-emerald-400 text-sm font-mono font-black">{score}</b> / {questions.length}
            </div>
          </div>

          {/* Soru index progress bar */}
          <div className={`h-2 rounded-full mb-6 overflow-hidden border ${
            isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-850"
          }`}>
            <div
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
            />
          </div>

          <div className="mb-6 min-h-[70px]">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-400">ARENA SORUSU</span>
            <h3 className={`text-base font-black tracking-tight leading-snug mt-1 ${isLight ? "text-slate-900" : "text-slate-150"}`}>
              {questions[currentIdx].prompt}
            </h3>
          </div>

          {/* Choice Option buttons */}
          <div className="grid grid-cols-1 gap-3.5 mb-6">
            {questions[currentIdx].options.map((opt) => {
              const isSelected = selectedOpt === opt;
              const isCorrectOpt = opt === questions[currentIdx].correct;
              
              let btnClass = isLight
                ? "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900";

              if (answerResult && isSelected) {
                btnClass = answerResult === "correct" 
                  ? "bg-emerald-500 text-slate-950 border-emerald-400" 
                  : "bg-red-500 text-slate-100 border-red-400";
              } else if (answerResult && isCorrectOpt) {
                btnClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
              }

              return (
                <button
                  key={opt}
                  disabled={!!answerResult}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-4 rounded-xl border text-left font-black text-xs sm:text-sm uppercase tracking-wide transition-all duration-200 cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Quick inline audio feedback icons */}
          <AnimatePresence>
            {answerResult && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 justify-center py-2"
              >
                {answerResult === "correct" ? (
                  <span className="text-emerald-500 font-extrabold text-xs uppercase tracking-tight flex items-center gap-1.5 animate-bounce">
                    <CheckCircle className="w-4 h-4 stroke-[3]" /> MÜKEMMEL! (+1 PUAN)
                  </span>
                ) : (
                  <span className="text-red-500 font-extrabold text-xs uppercase tracking-tight flex items-center gap-1.5 animate-shake">
                    <XCircle className="w-4 h-4 stroke-[3]" /> YANLIŞ SEÇENEK!
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

      {/* 3. FINISHED STATE */}
      {gameState === "finished" && (
        <div className={`text-center p-8 rounded-3xl border shadow-xl backdrop-blur-md ${
          isLight ? "bg-white border-slate-200" : "bg-slate-900/50 border-slate-800"
        }`}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`inline-block p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 mb-4`}
          >
            <Trophy className="w-14 h-14 stroke-[2]" />
          </motion.div>

          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">MÜCADELE SONA ERDİ</div>
          <h2 className={`text-2xl font-black uppercase tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {score >= 4 ? "👑 ZAFER SENİNDİR!" : "💔 TEKRAR DENE!"}
          </h2>
          
          <div className="my-6">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">TOPLAM SKORUN</span>
            <div className="text-4xl font-mono font-black text-emerald-500 mt-1">{score} / {questions.length} DOĞRU</div>
          </div>

          <p className={`text-xs font-semibold leading-relaxed mb-6 max-w-sm mx-auto ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            {score >= 4 
              ? "Harika iş çıkardın! En az 4 soruyu bilerek 10💎 ve 20 XP ödülü hanene yazdırdın. Lingo seninle gurur duyuyor!"
              : "Ah, şanssızlık! Ödülü kazanabilmek için en az 4 doğru yanıtlaman gerekir. Kendini geliştirip tekrar dene!"}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setGameState("lobby")}
              className={`flex-1 font-black text-xs uppercase tracking-widest py-3 px-4 rounded-xl border transition-all cursor-pointer ${
                isLight 
                  ? "bg-slate-150 border-slate-300 text-slate-700 hover:bg-slate-200" 
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Çıkış Yap
            </button>
            <button
              onClick={startChallenge}
              className="flex-1 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs uppercase tracking-widest py-3 px-4 rounded-xl shadow-lg shadow-orange-500/10 transition-all transform active:scale-95 cursor-pointer"
            >
              YENİDEN BAŞLA ⚡
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
