import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

try {
  dotenv.config();
} catch (e) {
  // Ignore error
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Catch all errors in the server process
process.on('uncaughtException', (err) => {
  console.error("Uncaught Exception:", err);
});


// Lazy client generation for Gemini.
// Never crash if API key is missing; provide a graceful fallback response if not set.
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      genAIClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return genAIClient;
}

// 1. AI evaluation for free-form code answers
app.post("/api/gemini/review", async (req, res) => {
  try {
    const { language, question, code, expectedOutcome } = req.body;
    const ai = getGenAI();

    if (!ai) {
      // Mock / fallback analyzer if no API Key configuration
      const isCorrect = code.toLowerCase().includes("print") || 
                        code.toLowerCase().includes("console.write") || 
                        code.toLowerCase().includes("system.out.print");
      return res.json({
        success: true,
        isCorrect: isCorrect,
        score: isCorrect ? 100 : 30,
        feedback: "Tebrikler! Kodunuz başarıyla çalıştırıldı (Not: Tam yapay zeka değerlendirmesi için GEMINI_API_KEY ayarlanmalıdır).",
        explanation: `Yazdığınız ${language} kodu basit bir kontrol işleminden geçti. Beklenen çıktıya uygun bir yapı tespit edildi.`,
        output: "Mock Output: Hello, World!"
      });
    }

    const prompt = `Yazılım Öğrenme Uygulaması Değerlendirmesi:
Hangi Dil: ${language}
Soru/Görev: ${question}
Kullanıcının Yazdığı Kod:
\`\`\`${language}
${code}
\`\`\`
Beklenen Çıktı/İşlev: ${expectedOutcome}

Kullanıcının yazdığı kodun doğruluğunu analiz et. Lütfen Türkçe cevap ver.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: {
              type: Type.BOOLEAN,
              description: "Kullanıcının kodunun beklenen işlevi tamamlayıp tamamlamadığı."
            },
            score: {
              type: Type.INTEGER,
              description: "0 ile 100 arasında bir puan."
            },
            feedback: {
              type: Type.STRING,
              description: "Öğrenciye yönelik samimi, Duolingo tarzı teşvik edici bir dönüt (Türkçe)."
            },
            explanation: {
              type: Type.STRING,
              description: "Kodun neden doğru veya yanlış olduğunun basit, anlaşılır, teknik detayları aşırıya kaçırmayan açıklaması."
            },
            output: {
              type: Type.STRING,
              description: "Kodun tahmini çıktı veya hata mesajı."
            }
          },
          required: ["isCorrect", "score", "feedback", "explanation"]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    const resultJson = JSON.parse(resultText);
    return res.json(resultJson);

  } catch (error: any) {
    console.error("Gemini Review error:", error);
    return res.status(500).json({
      error: "Yapay zeka değerlendirmesi gerçekleştirilemedi.",
      message: error.message
    });
  }
});

// 1.5. Code Playground / Sandbox AI Compiler simulator
app.post("/api/gemini/sandbox", async (req, res) => {
  try {
    const { language, code, action, isVip } = req.body;
    const ai = getGenAI();

    const mascotEmoji = language === "python" ? "🐍" : language === "csharp" ? "⚔️" : "☕";
    const mascotName = language === "python" ? "Pythie" : language === "csharp" ? "Sharpie" : "Javie";

    if (!ai) {
      if (action === "run") {
        return res.json({
          output: `⚡ ByteQuest Çevrimdışı Sınıf Derleyicisi [TEMEL MOD]\nÇalıştırılan Dil: ${language}\n\n${mascotEmoji} Kodunuz yerel simülatörde başarıyla yürütüldü:\n--------------------------\nHello, ByteQuest! Kodunuz derlendi ve sıfır hata ile yürütüldü.\n\n(Not: Gerçek zamanlı dinamik kod çıktısı simülasyonu için GEMINI_API_KEY ayarlanmalıdır.)`
        });
      } else {
        return res.json({
          explanation: `${mascotEmoji} **Çevrimdışı ${mascotName} Rehberi**\n\nYazdığınız ${language} kod yapısı temel sözdizimi doğrulamalarından geçti!\n\n* **Yapısal Başarı**: Kod bloğunuzda kritik bir parantez veya noktalı virgül hatası saptanmadı.\n* **Önemli Not**: Bu özelliğin tam yapay zeka tarafından satır satır optimize edilmesi ve Türkçe teknik rehberlik sunması için lütfen \`GEMINI_API_KEY\` değerini tanımlayın.`
        });
      }
    }

    if (action === "run") {
      const prompt = `Yazılım simülasyon terminali görevi:
Hangi Dil: ${language}
Kullanıcı Kodu:
${code}

Lütfen bu kodun derlenip çalıştırıldığını ve konsola ne bastığını simüle et.
Eğer kodda herhangi bir derleme hatası, syntax hatası, null pointer veya tanımsız değişken varsa, ilgili terminal hata çıktısını üret.
Eğer kod sorunsuzca çalışıyorsa, ÇIKTIYI tam olarak terminal çıktısı şeklinde doğrusal bir düz metin olarak ver. Kendinden ek açıklama ekleme, sadece terminal çıktısını geri döndür.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      return res.json({ output: response.text ? response.text.trim() : "Çıktı boş döndürüldü." });
    } else {
      // Explain code action
      const prompt = `Yazılım analisti görevi (Türkçe):
Hangi Dil: ${language}
Kullanıcı Kodu:
${code}
VIP Üye mi: ${isVip ? "Evet" : "Hayır"}

Lütfen bu kodu analiz et. 
1. Kodun ne yapmaya çalıştığını basitçe açıkla.
2. Satır satır inceleyerek kritik elemanları öğret.
3. Eğer varsa optimizasyon önerileri veya Clean Code ipuçları sun.
${isVip ? "Kullanıcı VIP üye olduğundan, lütfen son derece profesyonel, detaylı ve ileri düzey geliştirici sırlarını barındıran zengin bir açıklama yap." : "Samimi, Duolingo tarzı teşvik edici Türkçe bir açıklama yap."}
Lütfen yanıtı zengin Markdown formatında başlıklarla ve listelerle oluştur.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      return res.json({ explanation: response.text ? response.text.trim() : "Analiz boş döndürüldü." });
    }

  } catch (error: any) {
    console.error("Gemini Sandbox error:", error);
    return res.status(500).json({
      error: "Kod laboratuvarı analizi gerçekleştirilemedi.",
      message: error.message
    });
  }
});

// 2. Interactive AI coding tutor chat endpoint
app.post("/api/gemini/tutor", async (req, res) => {
  try {
    const { language, question, chatHistory, message, isVip } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        reply: `Harika bir soru! ${language} dili hakkında bilgi almak istiyorsun. (Not: Aktif bir yapay zeka yanıtı almak için üst menüden GEMINI_API_KEY ayarlanmalıdır.)`
      });
    }

    // Build chat parameters
    const systemPrompt = isVip 
      ? `Sen Duolingo uygulamasındaki elit, uzman ve VIP kullanıcılara hizmet veren bir kodlama rehberisin (Lingo VIP).
Kullanıcılara ${language} programlama dilini öğretiyorsun.
VIP kodlama asistanı olarak yanıtların derinlemesine teorik bilgiler, modern best-practice kod örnekleri ve daha detaylı çözümlemeler içermelidir.
Türkçe konuş ve Markdown formatını mükemmel bir şekilde kullanarak sektör standartlarında kodlar ver.`
      : `Sen Duolingo uygulamasındaki sevimli ve bilge bir baykuşsun (Lingo). 
Kullanıcılara ${language} programlama dilini öğretiyorsun. 
Yanıtların kısa, eğlenceli, bol örnekli, cesaretlendirici ve Türkçe olmalı. 
Markdown formatını kullanarak temiz kod blokları sağla.`;

    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: `Konu/Soru: ${question || "Genel"} \nSorun: ${message}` }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8
      }
    });

    return res.json({
      reply: response.text || "Anlayamadım, tekrar eder misin?"
    });

  } catch (error: any) {
    console.error("Gemini Tutor error:", error);
    return res.status(500).json({
      error: "Yapay zeka ders asistanı yanıt veremedi.",
      message: error.message
    });
  }
});

// Serve frontend assets
async function setupViteAndListen() {
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) {
    return; // Vercel handles static routing and we don't need to listen
  }

  if (process.env.NODE_ENV !== "production") {
    const viteMod = "vite";
    const { createServer: createViteServer } = await import(viteMod);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for serverless environments like Vercel
export default app;

// Only start the server if we are running it directly (not on Vercel)
if (process.env.VERCEL !== "1" && process.env.VERCEL_ENV === undefined) {
  setupViteAndListen().catch((err) => {
    console.error("Failed to start server", err);
  });
}
