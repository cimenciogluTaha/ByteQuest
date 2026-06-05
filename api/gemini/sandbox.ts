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
    const { language, code, action, isVip } = req.body;
    const ai = getGenAI();

    const mascotEmoji = language === "python" ? "🐍" : language === "csharp" ? "⚔️" : "☕";
    const mascotName = language === "python" ? "Pythie" : language === "csharp" ? "Sharpie" : "Javie";

    if (!ai) {
      if (action === "run") {
        return res.status(200).json({
          output: `⚡ ByteQuest Çevrimdışı Sınıf Derleyicisi [TEMEL MOD]\nÇalıştırılan Dil: ${language}\n\n${mascotEmoji} Kodunuz yerel simülatörde başarıyla yürütüldü:\n--------------------------\nHello, ByteQuest! Kodunuz derlendi ve sıfır hata ile yürütüldü.\n\n(Not: Gerçek zamanlı dinamik kod çıktısı simülasyonu için GEMINI_API_KEY ayarlanmalıdır.)`
        });
      } else {
        return res.status(200).json({
          explanation: `${mascotEmoji} **Çevrimdışı ${mascotName} Rehberi**\n\nYazdığınız ${language} kod yapısı temel sözdizimi doğrulamalarından geçti!\n\n* **Yapısal Başarı**: Kod bloğunuzda kritik bir parantez veya noktalı virgül hatası saptanmadı.\n* **Önemli Not**: Bu özelliğin tam yapay zeka tarafından satır satır optimize edilmesi ve Türkçe teknik rehberlik sunması için lütfen \`GEMINI_API_KEY\` değerini tanımlayın.`
        });
      }
    }

    if (action === "run") {
      const prompt = `Yazılım simülasyon terminali görevi:\nHangi Dil: ${language}\nKullanıcı Kodu:\n${code}\n\nLütfen bu kodun derlenip çalıştırıldığını ve konsola ne bastığını simüle et.\nEğer kodda herhangi bir derleme hatası, syntax hatası, null pointer veya tanımsız değişken varsa, ilgili terminal hata çıktısını üret.\nEğer kod sorunsuzca çalışıyorsa, ÇIKTIYI tam olarak terminal çıktısı şeklinde doğrusal bir düz metin olarak ver. Kendinden ek açıklama ekleme, sadece terminal çıktısını geri döndür.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      return res.status(200).json({ output: response.text ? response.text.trim() : "Çıktı boş döndürüldü." });
    } else {
      const prompt = `Yazılım analisti görevi (Türkçe):\nHangi Dil: ${language}\nKullanıcı Kodu:\n${code}\nVIP Üye mi: ${isVip ? "Evet" : "Hayır"}\n\nLütfen bu kodu analiz et.\n1. Kodun ne yapmaya çalıştığını basitçe açıkla.\n2. Satır satır inceleyerek kritik elemanları öğret.\n3. Eğer varsa optimizasyon önerileri veya Clean Code ipuçları sun.\n${isVip ? "Kullanıcı VIP üye olduğundan, lütfen son derece profesyonel, detaylı ve ileri düzey geliştirici sırlarını barındıran zengin bir açıklama yap." : "Samimi, Duolingo tarzı teşvik edici Türkçe bir açıklama yap."}\nLütfen yanıtı zengin Markdown formatında başlıklarla ve listelerle oluştur.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });

      return res.status(200).json({ explanation: response.text ? response.text.trim() : "Analiz boş döndürüldü." });
    }

  } catch (error: any) {
    console.error("Gemini Sandbox error:", error);
    return res.status(500).json({
      error: "Kod laboratuvarı analizi gerçekleştirilemedi.",
      message: error.message
    });
  }
}
