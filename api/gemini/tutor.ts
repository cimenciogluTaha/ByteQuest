import { GoogleGenAI } from "@google/genai";

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
    const { language, question, chatHistory, message, isVip } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(200).json({
        reply: `Harika bir soru! ${language} dili hakkında bilgi almak istiyorsun. (Not: Aktif bir yapay zeka yanıtı almak için üst menüden GEMINI_API_KEY ayarlanmalıdır.)`
      });
    }

    const systemPrompt = isVip 
      ? `Sen Duolingo uygulamasındaki elit, uzman ve VIP kullanıcılara hizmet veren bir kodlama rehberisin (Lingo VIP).\nKullanıcılara ${language} programlama dilini öğretiyorsun.\nVIP kodlama asistanı olarak yanıtların derinlemesine teorik bilgiler, modern best-practice kod örnekleri ve daha detaylı çözümlemeler içermelidir.\nTürkçe konuş ve Markdown formatını mükemmel bir şekilde kullanarak sektör standartlarında kodlar ver.`
      : `Sen Duolingo uygulamasındaki sevimli ve bilge bir baykuşsun (Lingo). \nKullanıcılara ${language} programlama dilini öğretiyorsun. \nYanıtların kısa, eğlenceli, bol örnekli, cesaretlendirici ve Türkçe olmalı. \nMarkdown formatını kullanarak temiz kod blokları sağla.`;

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

    return res.status(200).json({
      reply: response.text || "Anlayamadım, tekrar eder misin?"
    });

  } catch (error: any) {
    console.error("Gemini Tutor error:", error);
    return res.status(500).json({
      error: "Yapay zeka ders asistanı yanıt veremedi.",
      message: error.message
    });
  }
}
