import { GoogleGenAI, Type } from "@google/genai";

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { language, question, code, expectedOutcome } = req.body;
    const ai = getGenAI();

    if (!ai) {
      const isCorrect = code.toLowerCase().includes("print") || 
                        code.toLowerCase().includes("console.write") || 
                        code.toLowerCase().includes("system.out.print");
      return res.status(200).json({
        success: true,
        isCorrect: isCorrect,
        score: isCorrect ? 100 : 30,
        feedback: "Tebrikler! Kodunuz başarıyla çalıştırıldı (Not: Tam yapay zeka değerlendirmesi için GEMINI_API_KEY ayarlanmalıdır).",
        explanation: `Yazdığınız ${language} kodu basit bir kontrol işleminden geçti. Beklenen çıktıya uygun bir yapı tespit edildi.`,
        output: "Mock Output: Hello, World!"
      });
    }

    const prompt = `Yazılım Öğrenme Uygulaması Değerlendirmesi:\nHangi Dil: ${language}\nSoru/Görev: ${question}\nKullanıcının Yazdığı Kod:\n\`\`\`${language}\n${code}\n\`\`\`\nBeklenen Çıktı/İşlev: ${expectedOutcome}\n\nKullanıcının yazdığı kodun doğruluğunu analiz et. Lütfen Türkçe cevap ver.`;

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
    return res.status(200).json(resultJson);

  } catch (error: any) {
    console.error("Gemini Review error:", error);
    return res.status(500).json({
      error: "Yapay zeka değerlendirmesi gerçekleştirilemedi.",
      message: error.message
    });
  }
}
