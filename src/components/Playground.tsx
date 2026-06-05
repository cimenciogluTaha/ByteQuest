import React, { useState } from "react";
import { UserStats, Language, getLanguageMascot } from "../types";
import { Terminal, Cpu, Play, Sparkles, RefreshCw, FileCode, Trash2, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface PlaygroundProps {
  stats: UserStats;
  theme?: string;
}

const TEMPLATES: Record<Language, { title: string; filename: string; code: string; desc: string }> = {
  python: {
    title: "Python Değişkenleri ve Döngüler",
    filename: "main.py",
    code: `# Bir liste oluşturup döngü ile ekrana yazdıralım
diller = ["Python", "C#", "Java", "Lingo"]

print("⚡ ByteQuest Kodlama Kulübü!")
for dil in diller:
    print(f"🐍 Öğreniyorum: {dil}")
`,
    desc: "Python'da temel dizi tanımlama ve 'for' döngüsü kullanımı.",
  },
  csharp: {
    title: "C# Nesne Yönelimli Giriş",
    filename: "Program.cs",
    code: `using System;

class Program {
    static void Main() {
        Console.WriteLine("⚡ ByteQuest Kodlama Kulübü!");
        string[] diller = { "Python", "C#", "Java", "Lingo" };
        
        foreach(var dil in diller) {
            Console.WriteLine("⚔️ Öğreniyorum: " + dil);
        }
    }
}
`,
    desc: "C# konsol sınıf yapısı ve strongly-typed döngüler.",
  },
  java: {
    title: "Java Ana Sınıf ve Metotlar",
    filename: "Main.java",
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("⚡ ByteQuest Kodlama Kulübü!");
        String[] diller = {"Python", "C#", "Java", "Lingo"};
        
        for (String dil : diller) {
            System.out.println("☕ Öğreniyorum: " + dil);
        }
    }
}
`,
    desc: "Java'da JVM uyumlu statik giriş noktası ve foreach yapısı.",
  }
};

export default function Playground({ stats, theme = "dark" }: PlaygroundProps) {
  const isLight = theme === "light";
  const [activeLang, setActiveLang] = useState<Language>(stats.activeLanguage);
  const mascot = getLanguageMascot(activeLang);
  const [code, setCode] = useState<string>(TEMPLATES[stats.activeLanguage].code);
  const [output, setOutput] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  // Sync template if language changed
  const handleLangChange = (lang: Language) => {
    setActiveLang(lang);
    setCode(TEMPLATES[lang].code);
    setOutput("");
    setExplanation("");
  };

  const handleReset = () => {
    setCode(TEMPLATES[activeLang].code);
    setOutput("");
    setExplanation("");
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Kod derleniyor...\nGerekli sanal ortam hazırlanıyor...\nÇalıştırılıyor...\n\n");
    
    try {
      const response = await fetch("/api/gemini/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: activeLang,
          code: code,
          action: "run",
          isVip: stats.isVip
        })
      });

      if (response.ok) {
        const data = await response.json();
        setOutput(data.output || "Program başarıyla çalıştı, çıktı üretilmedi.");
      } else {
        const errorText = await response.text();
        setOutput(`Derleme Hatası: Sunucu ile bağlantı kurulamadı. Hata Kodu: ${response.status}. Detay: ${errorText} (API_KEY yapılandırmasını kontrol edin veya uygulamayı yeniden yükleyin.)`);
      }
    } catch {
      setOutput("Hata: Ağ hatası oluştu. Çevrimiçi sandbox simülatörü çalıştırılamadı.");
    } finally {
      setIsRunning(false);
    }
  };

  const explainCode = async () => {
    setIsExplaining(true);
    setExplanation("");
    try {
      const response = await fetch("/api/gemini/sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: activeLang,
          code: code,
          action: "explain",
          isVip: stats.isVip
        })
      });

      if (response.ok) {
        const data = await response.json();
        setExplanation(data.explanation || "Kod yapısı teknik olarak geçerli görünüyor.");
      } else {
        setExplanation("Kod analizi yapılamadı. Çevrimdışı moda geçildi.");
      }
    } catch {
      setExplanation("Ağ hatası: Kod analiz asistanı devre dışı.");
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header and Info */}
      <div className="text-center mb-8">
        <div className={`inline-block p-4 rounded-full mb-3 ${
          isLight 
            ? "bg-emerald-100 border border-emerald-200 text-emerald-600" 
            : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
        }`}>
          <Terminal className="w-12 h-12 stroke-[2]" />
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">INTERAKTIF DENEY LABORATUVARI</div>
        <h2 className={`text-2xl font-black uppercase tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
          KOD OYUN ALANI (SANDBOX)
        </h2>
        <p className={`text-xs font-bold mt-1 ${isLight ? "text-slate-650" : "text-slate-400"}`}>
          Derslerden bağımsız olarak dilediğin kodu yaz, çalıştır ve Lingo AI yardımıyla anında optimize et!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editor Area (Left 2-columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl shadow-xl overflow-hidden border border-slate-800 bg-slate-950">
            {/* Tab header */}
            <div className="bg-slate-900 px-4 md:px-6 py-3 flex items-center justify-between border-b border-slate-850">
              <div className="flex items-center gap-3">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {TEMPLATES[activeLang].filename}
                </span>
                {stats.isVip && (
                  <span className="text-[9px] font-black bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">
                    VIP Elite Compiler
                  </span>
                )}
              </div>

              {/* Language selection tab list */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(["python", "csharp", "java"] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLangChange(lang)}
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                      activeLang === lang
                        ? "bg-emerald-500 text-slate-950"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lang === "csharp" ? "C#" : lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated Monospaced Editor */}
            <div className="flex bg-slate-950 font-mono text-xs md:text-sm p-4 md:p-6 gap-4 min-h-[250px] relative">
              <div className="text-slate-650 text-right select-none pr-3 border-r border-slate-900 hidden sm:block leading-relaxed">
                {Array.from({ length: Math.max(10, code.split("\n").length + 2) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Buraya istediğin kodu yaz..."
                className="flex-1 bg-transparent border-0 outline-none p-0 text-slate-150 font-semibold focus:ring-0 resize-y min-h-[250px] placeholder-slate-700 font-mono leading-relaxed focus:outline-none"
              />
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-900 px-4 md:px-6 py-4 flex flex-wrap gap-3 justify-between items-center border-t border-slate-850">
              <button
                onClick={handleReset}
                title="Şablonu Temizle"
                className="text-xs font-black text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 transition-all hover:border-slate-700 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ŞABLONA SIFIRLA
              </button>

              <div className="flex gap-2.5">
                <button
                  disabled={isExplaining || isRunning}
                  onClick={explainCode}
                  className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                    isLight 
                      ? "bg-white border-slate-200 text-slate-800 hover:bg-slate-50" 
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  {isExplaining ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ANALİZ EDİLİYOR...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
                      YAPAY ZEKA AÇIKLASIN
                    </>
                  )}
                </button>

                <button
                  onClick={runCode}
                  disabled={isRunning || isExplaining}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs uppercase tracking-widest py-2.5 px-5 rounded-xl shadow-lg shadow-emerald-500/10 transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      YÜRÜTÜLÜYOR...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 stroke-[3] fill-slate-950" />
                      KODU ÇALIŞTIR
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* stdout terminal */}
          <div className="rounded-2xl border border-slate-850 bg-black overflow-hidden shadow-xl">
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-900 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">PROGRAM ÇIKTISI (STDOUT)</span>
            </div>
            <div className="p-4 font-mono text-xs text-green-400 min-h-[100px] leading-relaxed whitespace-pre-wrap select-text">
              {output || (
                <span className="text-slate-650 italic">Kodu yukarıdan çalıştırdıktan sonra üretilen konsol çıktıları burada belirecektir...</span>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar help / explain details */}
        <div className="space-y-4">
          {/* AI explainer panel */}
          <div className={`p-6 rounded-3xl border shadow-xl flex flex-col h-full min-h-[300px] ${
            isLight ? "bg-white border-slate-200" : "bg-slate-900/50 border-slate-800"
          }`}>
            <span className="text-[9px] font-black tracking-widest text-emerald-500 uppercase block mb-1">AI YARDIMCISI DESTEĞİ</span>
            <h4 className={`text-sm font-black uppercase tracking-tight flex items-center gap-2 mb-3 ${
              isLight ? "text-slate-900" : "text-slate-100"
            }`}>
              <Sparkles className="w-4 h-4 text-indigo-400" />
              LİNGO REHBERLİK SERVİSİ
            </h4>

            <div className="flex-1 overflow-y-auto max-h-[400px] pr-1 scrollbar-thin">
              {isExplaining ? (
                <div className="text-center py-12 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-450 uppercase tracking-wider animate-pulse">{mascot.name} Kodu Satır Satır İnceliyor...</p>
                </div>
              ) : explanation ? (
                <div className="text-xs leading-relaxed space-y-3 text-slate-300 select-text">
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl mb-4 text-[11px] font-bold text-indigo-400 tracking-wide uppercase">{mascot.name.toUpperCase()}-CODE ANALİZİ TAMAMLANDI:</div>
                  <div className="whitespace-pre-wrap font-sans text-slate-300 prose prose-invert font-semibold leading-relaxed">
                    {explanation}
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-4 text-center">
                  <span className="text-5xl select-none block animate-bounce">{mascot.emoji}</span>
                  <div className={`text-xs font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    "Yazmış olduğun kodlarda anlamadığın bir yer mi var? Veya daha temiz nasıl yazılır merak mı ediyorsun?
                    <b className="text-emerald-500 block mt-2">Kodu düzelttikten sonra 'YAPAY ZEKA AÇIKLASIN' butonuna bas, hemen analiz edeyim!"</b>
                  </div>
                </div>
              )}
            </div>

            {explanation && !isExplaining && (
              <div className="pt-4 mt-4 border-t border-slate-800/80 text-center">
                <button
                  onClick={() => setExplanation("")}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-350"
                >
                  Analizi Temizle
                </button>
              </div>
            )}
          </div>

          {/* Quick Info card */}
          <div className={`p-4 rounded-2xl border text-center ${
            isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-870 opacity-80"
          }`}>
            <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-center gap-1">
              <HelpCircle className="w-3 h-3 text-emerald-400" />
              BİR İPUCU
            </h5>
            <p className={`text-[10px] leading-relaxed font-semibold ${isLight ? "text-slate-500" : "text-slate-450"}`}>
              {TEMPLATES[activeLang].desc} Kod yapısını dilediğin gibi bozup "Çalıştır" diyerek derleyici mesajlarını yakalayabilirsin!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
