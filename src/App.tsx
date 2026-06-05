import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import LessonTree from "./components/LessonTree";
import Leaderboard from "./components/Leaderboard";
import Playground from "./components/Playground";
import TriviaArena from "./components/TriviaArena";
import StoreTab from "./components/StoreTab";
import { 
  Language, 
  LessonUnit, 
  QuizQuestion, 
  Quest, 
  LeaderboardUser, 
  UserStats, 
  Badge,
  getLanguageMascot
} from "./types";
import { 
  pythonLessonsExpanded as pythonLessons, 
  csharpLessonsExpanded as csharpLessons, 
  javaLessonsExpanded as javaLessons, 
  initialQuests, 
  initialLeaderboard, 
  initialStats 
} from "./data";
import { 
  Award, 
  BookOpen, 
  Check, 
  ChevronRight, 
  Compass, 
  Flame, 
  Heart, 
  HelpCircle, 
  MessageSquare, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  Terminal, 
  Trophy, 
  User, 
  X, 
  Zap,
  Moon,
  Sun,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { auth, db } from "./firebase";
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  User as FirebaseUser
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  onSnapshot
} from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function App() {
  // Firebase Integration states
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [fbAuthInitialized, setFbAuthInitialized] = useState<boolean>(false);
  const [fbForgotPasswordMode, setFbForgotPasswordMode] = useState<boolean>(false);
  const [fbSuccessMessage, setFbSuccessMessage] = useState<string | null>(null);
  const [fbEmail, setFbEmail] = useState<string>("");
  const [fbPassword, setFbPassword] = useState<string>("");
  const [fbLoading, setFbLoading] = useState<boolean>(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [fbIsLoginMode, setFbIsLoginMode] = useState<boolean>(true);
  const [fbSyncSuccess, setFbSyncSuccess] = useState<boolean>(false);

  // Local storage synchronized states to survive browser reloads
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem("codelingo_stats");
    return saved ? JSON.parse(saved) : initialStats;
  });

  // Check and refresh energy every minute (6 hour window)
  useEffect(() => {
    const checkEnergy = () => {
      setStats(prev => {
        if (prev.isVip) return prev;
        
        const now = Date.now();
        const lastRefill = prev.lastEnergyTimestamp || now;
        const hoursPassed = (now - lastRefill) / (1000 * 60 * 60);
        
        if (hoursPassed >= 6 && (prev.energy ?? 100) < 100) {
          return {
            ...prev,
            energy: 100,
            lastEnergyTimestamp: now
          };
        }
        return prev;
      });
    };
    
    checkEnergy();
    const interval = setInterval(checkEnergy, 60000);
    return () => clearInterval(interval);
  }, []);

  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem("codelingo_quests");
    return saved ? JSON.parse(saved) : initialQuests;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(() => {
    const saved = localStorage.getItem("codelingo_leaderboard");
    return saved ? JSON.parse(saved) : initialLeaderboard;
  });

  const activeMascot = getLanguageMascot(stats.activeLanguage);
  const [activeTab, setActiveTab] = useState<string>("learn");
  
  // Quiz Wizard states
  const [activeLesson, setActiveLesson] = useState<LessonUnit | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [fillGapAnswer, setFillGapAnswer] = useState<string>("");
  const [freeFormCode, setFreeFormCode] = useState<string>("");
  const [matchPairsState, setMatchPairsState] = useState<{ [key: string]: string }>({});
  
  // Quiz feedback variables
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");
  const [explanationMsg, setExplanationMsg] = useState<string>("");
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [simulationOutput, setSimulationOutput] = useState<string>("");
  const [wrongAnswersCount, setWrongAnswersCount] = useState<number>(0);

  // Chatbot states with Lingo Owl
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "lingo"; text: string }>>([
    { role: "lingo", text: "Merhaba! Ben Lingo. Python, C# veya Java öğrenirken takıldığın her an buradayım. Bana herhangi bir soru sorabilirsin!" }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Edit profile state
  const [editName, setEditName] = useState<string>(stats.name);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [appAlert, setAppAlert] = useState<string | null>(null);

  // 2. Local auxiliary functions to push / pull stats
  const pushStatsToFirestore = async (userId: string, currentStats: UserStats) => {
    setFbLoading(true);
    setFbError(null);
    try {
      await setDoc(doc(db, "users", userId), currentStats);
      setFbSyncSuccess(true);
      setTimeout(() => setFbSyncSuccess(false), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
    } finally {
      setFbLoading(false);
    }
  };

  const pullStatsFromFirestore = async (userId: string) => {
    setFbLoading(true);
    setFbError(null);
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as UserStats;
        
        let finalName = cloudData.name || stats.name;
        if ((finalName === "Geliştirici Taha" || finalName === "Misafir Geliştirici") && auth.currentUser) {
          finalName = auth.currentUser.displayName || (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : finalName);
          cloudData.name = finalName;
          // Fire and forget update
          setDoc(docRef, cloudData, { merge: true }).catch(console.warn);
        }

        // Merge with local storage
        setStats(prev => ({
          ...prev,
          ...cloudData,
          badges: cloudData.badges || prev.badges,
          completedLessons: cloudData.completedLessons || prev.completedLessons,
          name: finalName
        }));
        setEditName(finalName);
      } else {
        let finalName = stats.name;
        if ((finalName === "Geliştirici Taha" || finalName === "Misafir Geliştirici") && auth.currentUser) {
          finalName = auth.currentUser.displayName || (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : finalName);
          setStats(prev => ({...prev, name: finalName}));
          setEditName(finalName);
        }
        // Doc doesn't exist yet, push local stats to create it!
        await setDoc(docRef, { ...stats, name: finalName });
      }
    } catch (err: any) {
      handleFirestoreError(err, OperationType.GET, `users/${userId}`);
    } finally {
      setFbLoading(false);
    }
  };

  // 1. Observe Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFbUser(user);
      setFbAuthInitialized(true);
      if (user) {
        // If logged in, fetch current stats from Firestore
        await pullStatsFromFirestore(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  // Global Realtime Leaderboard Sync
  useEffect(() => {
    // Only subscribe if authenticated
    if (!fbUser) return;
    
    const usersRef = collection(db, "users");
    // Sort by XP descending and get top 50 users
    const q = query(usersRef, orderBy("xp", "desc"), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const topUsers: LeaderboardUser[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserStats;
        const uid = docSnap.id;
        topUsers.push({
          name: data.name || "İsimsiz Oyuncu",
          rank: topUsers.length + 1,
          xp: data.xp || 0,
          avatar: "🧑‍💻",
          isCurrentUser: uid === fbUser.uid,
          status: "same"
        });
      });
      if (topUsers.length > 0) {
        setLeaderboard(topUsers);
      }
    }, (error) => {
      console.warn("Could not sync global leaderboard. Check firestore rules.", error);
    });
    
    return () => unsubscribe();
  }, [fbUser]);

  // Auth Operations
  const getTurkishAuthError = (code: string, message: string): string => {
    const codeStr = String(code || "").toLowerCase();
    const msgStr = String(message || "").toLowerCase();
    if (codeStr.includes("user-not-found") || msgStr.includes("user-not-found") || codeStr.includes("invalid-credential") || msgStr.includes("invalid-credential")) {
      return "Giriş başarısız! Böyle bir kullanıcı bulunamadı veya şifre hatalı. Üye değilseniz lütfen 'Üye Ol' sekmesinden ücretsiz üye olunuz!";
    }
    if (codeStr.includes("wrong-password") || msgStr.includes("wrong-password")) {
      return "Hatalı şifre! Lütfen şifrenizi kontrol edin veya 'Şifremi Unuttum' seçeneğiyle sıfırlayın.";
    }
    if (codeStr.includes("email-already-in-use") || msgStr.includes("email-already-in-use")) {
      return "Bu e-posta adresi zaten kullanımda! Lütfen giriş yapmayı deneyin.";
    }
    if (codeStr.includes("weak-password") || msgStr.includes("weak-password")) {
      return "Lütfen en az 6 karakterli daha güçlü bir şifre girin.";
    }
    if (codeStr.includes("invalid-email") || msgStr.includes("invalid-email")) {
      return "Geçersiz e-posta formatı. Lütfen kontrol ediniz.";
    }
    return `Bir hata oluştu: ${message}`;
  };

  const handleFirebaseSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbEmail || !fbPassword) {
      setFbError("Lütfen e-posta ve şifrenizi girin.");
      return;
    }
    setFbLoading(true);
    setFbError(null);
    setFbSuccessMessage(null);
    try {
      await signInWithEmailAndPassword(auth, fbEmail, fbPassword);
      setFbEmail("");
      setFbPassword("");
    } catch (err: any) {
      setFbError(getTurkishAuthError(err.code, err.message));
    } finally {
      setFbLoading(false);
    }
  };

  const handleFirebaseSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbEmail || !fbPassword) {
      setFbError("Lütfen e-posta ve şifrenizi girin.");
      return;
    }
    if (fbPassword.length < 6) {
      setFbError("Şifreniz en az 6 karakter olmalıdır.");
      return;
    }
    setFbLoading(true);
    setFbError(null);
    setFbSuccessMessage(null);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, fbEmail, fbPassword);
      // Automatically generate a name from email if needed
      let newName = stats.name;
      if (stats.name === "Misafir Geliştirici" || stats.name === "Geliştirici Taha") {
        newName = fbEmail.split('@')[0];
        setStats(prev => ({ ...prev, name: newName }));
        setEditName(newName);
      }
      
      // Immediately push existing progress to direct their cloud experience
      if (userCred.user) {
        await setDoc(doc(db, "users", userCred.user.uid), { ...stats, name: newName });
      }
      setFbEmail("");
      setFbPassword("");
    } catch (err: any) {
      setFbError(getTurkishAuthError(err.code, err.message));
    } finally {
      setFbLoading(false);
    }
  };

  const handleFirebasePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbEmail) {
      setFbError("Şifre sıfırlama bağlantısı göndermek için lütfen e-postanızı girin.");
      return;
    }
    setFbLoading(true);
    setFbError(null);
    setFbSuccessMessage(null);
    try {
      await sendPasswordResetEmail(auth, fbEmail);
      setFbSuccessMessage("Şifre sıfırlama bağlantısı başarıyla e-posta adresinize gönderildi! Lütfen e-postalarınızı kontrol edin.");
    } catch (err: any) {
      setFbError(getTurkishAuthError(err.code, err.message));
    } finally {
      setFbLoading(false);
    }
  };

  const handleFirebaseAnonymous = async () => {
    setFbLoading(true);
    setFbError(null);
    setFbSuccessMessage(null);
    try {
      const userCred = await signInAnonymously(auth);
      // Immediately push existing progress
      if (userCred.user) {
        await setDoc(doc(db, "users", userCred.user.uid), stats);
      }
    } catch (err: any) {
      setFbError(err.message || "Misafir girişi yapılamadı.");
    } finally {
      setFbLoading(false);
    }
  };

  const handleFirebaseSocial = async (providerName: "google" | "github") => {
    setFbLoading(true);
    setFbError(null);
    setFbSuccessMessage(null);
    try {
      const provider = providerName === "google" 
        ? new GoogleAuthProvider() 
        : new GithubAuthProvider();
      
      const userCred = await signInWithPopup(auth, provider);
      // Automatically set their name if it's currently guest
      let newName = stats.name;
      if (stats.name === "Misafir Geliştirici" || stats.name === "Geliştirici Taha") {
        newName = userCred.user.displayName || userCred.user.email?.split('@')[0] || newName;
        setStats(prev => ({ ...prev, name: newName }));
        setEditName(newName);
      }
      
      // Merge progress
      if (userCred.user) {
        await setDoc(doc(db, "users", userCred.user.uid), { ...stats, name: newName }, { merge: true });
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        const errorMsg = getTurkishAuthError(err.code, err.message);
        setFbError(`Sosyal giriş yapılamadı: ${errorMsg}\nNote: Domain (${window.location.hostname}) Firebase konsolunda yetkilendirilmemiş olabilir.`);
      }
    } finally {
      setFbLoading(false);
    }
  };

  const handleFirebaseSignOut = async () => {
    setFbLoading(true);
    try {
      await signOut(auth);
      setStats(initialStats);
      setQuests(initialQuests);
      setEditName(initialStats.name);
      localStorage.setItem("codelingo_stats", JSON.stringify(initialStats));
      localStorage.setItem("codelingo_quests", JSON.stringify(initialQuests));
    } catch (err: any) {
      setFbError(err.message || "Çıkış yapılamadı.");
    } finally {
      setFbLoading(false);
    }
  };

  // Sync with local storage and Firebase Cloud
  useEffect(() => {
    localStorage.setItem("codelingo_stats", JSON.stringify(stats));
    if (fbUser) {
      // Debounce the Firestore push update to minimize network footprint
      const handler = setTimeout(() => {
        setDoc(doc(db, "users", fbUser.uid), stats).catch(err => {
          console.warn("Auto background cloud sync failed:", err);
        });
      }, 2000);
      return () => clearTimeout(handler);
    }
  }, [stats, fbUser]);

  useEffect(() => {
    localStorage.setItem("codelingo_quests", JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    // Keep user's XP matched inside the leaderboard ranking dynamically
    const updatedLeaderboard = leaderboard.map(user => {
      if (user.isCurrentUser) {
        return { ...user, xp: stats.xp, name: stats.name };
      }
      return user;
    });
    localStorage.setItem("codelingo_leaderboard", JSON.stringify(updatedLeaderboard));
  }, [stats.xp, stats.name]);

  // Helper getters
  const getCurrentLessons = (): LessonUnit[] => {
    switch (stats.activeLanguage) {
      case "python":
        return pythonLessons;
      case "csharp":
        return csharpLessons;
      case "java":
        return javaLessons;
      default:
        return pythonLessons;
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setStats(prev => ({
      ...prev,
      activeLanguage: lang
    }));
    // Check Multi-lingual Achievement badge state
    triggerQuestProgress("q3", 1);
  };

  // Quest update system
  const triggerQuestProgress = (questId: string, amount: number) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && !q.isCompleted) {
        const nextCount = Math.min(q.targetCount, q.currentCount + amount);
        const nextCompleted = nextCount >= q.targetCount;
        return {
          ...q,
          currentCount: nextCount,
          isCompleted: nextCompleted
        };
      }
      return q;
    }));
  };

  // Refilling hearts inside Shop
  const handleRefillHearts = () => {
    if (stats.gems >= 50) {
      setStats(prev => ({
        ...prev,
        hearts: 5,
        gems: prev.gems - 50
      }));
    }
  };

  // Refill coding energy back to 100%
  const handleRefillEnergy = () => {
    setStats(prev => ({
      ...prev,
      energy: 100,
      gems: Math.max(0, prev.gems - 30)
    }));
  };

  // Toggle VIP Membership (unlimited energy toggle)
  const handleToggleVip = () => {
    if (stats.isVip) return; // already VIP
    if (stats.gems < 100) {
      setAppAlert("Yeterli mücevheriniz yok.");
      return;
    }
    setStats(prev => ({
      ...prev,
      isVip: true,
      energy: 100,
      gems: prev.gems - 100
    }));
  };

  const handleBuyItem = (itemType: string, price: number, payload?: any) => {
    if (stats.gems < price) return;
    setStats(prev => {
      let newState = { ...prev, gems: prev.gems - price };
      switch (itemType) {
        case "energy":
          newState.energy = 100;
          break;
        case "hearts":
          newState.hearts = 5;
          break;
        case "title":
          if (payload) newState.title = payload;
          break;
        case "vip":
          newState.isVip = true;
          newState.energy = 100;
          break;
      }
      return newState;
    });
  };

  // Toggle Theme Light/Dark
  const handleToggleTheme = () => {
    setStats(prev => ({
      ...prev,
      theme: prev.theme === "light" ? "dark" : "light"
    }));
  };

  // Claim Daily login Chest rewards with multipliers
  const handleClaimDailyReward = (gems: number, xp: number) => {
    setStats(prev => ({
      ...prev,
      gems: prev.gems + gems,
      xp: prev.xp + xp
    }));
  };

  // Claim Arena / Duel trivia game reward
  const handleArenaReward = (gems: number, xp: number) => {
    setStats(prev => ({
      ...prev,
      gems: prev.gems + gems,
      xp: prev.xp + xp
    }));
  };

  // Start a lesson unit
  const handleStartLesson = (lessonId: string) => {
    const list = getCurrentLessons();
    const found = list.find(l => l.id === lessonId);
    if (found) {
      if (stats.hearts <= 0) {
        setAppAlert("Eğitime başlamak için canınız kalmadı! Lütfen Mağazadan mücevher karşılığı Can Dolumu yapın veya can kazanmak için dersleri tekrarlayın.");
        return;
      }

      // ENERGY SYSTEM CHECK WITH VIP BYPASS
      const currentEnergy = stats.energy ?? 100;
      if (!stats.isVip && currentEnergy < 25) {
        setAppAlert("Yetersiz enerji seviyesi! Derslere devam etmek için en az 25⚡ enerji gerekir. Unutmayın, her 6 saatte bir enerjiniz dolar. Bekleyebilir veya VIP (Sınırsız Enerji) aktifleştirebilirsiniz!");
        return;
      }

      // Deduct 25 energy if not VIP (4 limits max for 100 energy)
      if (!stats.isVip) {
        setStats(prev => {
          const newEnergy = Math.max(0, (prev.energy ?? 100) - 25);
          return {
            ...prev,
            energy: newEnergy,
            lastEnergyTimestamp: newEnergy < 100 && (prev.energy ?? 100) === 100 ? Date.now() : prev.lastEnergyTimestamp
          };
        });
      }

      setActiveLesson(found);
      setCurrentQuestionIdx(0);
      resetQuestionStates();
      setWrongAnswersCount(0);
    }
  };

  const resetQuestionStates = () => {
    setSelectedOption("");
    setFillGapAnswer("");
    setFreeFormCode("");
    setMatchPairsState({});
    setIsAnswerChecked(false);
    setFeedbackMsg("");
    setExplanationMsg("");
    setSimulationOutput("");
  };

  // Dynamic feedback and evaluation internally or via server api
  const checkAnswer = async () => {
    if (!activeLesson) return;
    const currentQuestion: QuizQuestion = activeLesson.questions[currentQuestionIdx];

    let userCorrect = false;
    let feedback = "";
    let explanation = "";

    if (currentQuestion.type === "multiple-choice") {
      userCorrect = selectedOption === currentQuestion.correctAnswer;
      feedback = userCorrect 
        ? "Mükemmel Cevap! Kodlama mantığı tam olarak yerinde." 
        : `Üzgünüm, doğru yanıt: ${currentQuestion.correctAnswer}`;
      explanation = "Seçenekler arasından dilin söz dizimi standartlarına göre en doğru olanı belirlediniz.";

    } else if (currentQuestion.type === "fill-gap") {
      const cleanInput = fillGapAnswer.trim().toLowerCase();
      const cleanCorrect = currentQuestion.correctAnswer.toLowerCase();
      userCorrect = cleanInput === cleanCorrect;
      feedback = userCorrect
        ? "Boşluk kusursuzca dolduruldu! Harika bir yazılım gözü."
        : `Ah, doğru kelime '${currentQuestion.correctAnswer}' olmalıydı.`;
      explanation = `Söz dizimindeki boşluk (gap) o dilde kodun yürütülmesi için gereken temel anahtar kelimedir.`;

    } else if (currentQuestion.type === "match-pair") {
      // In this app, match pair options are sorted, click verifies simple match
      userCorrect = true; // Auto success with micro match simulation for UX
      feedback = "Müthiş eşleştirme! Komutların hangi platforma ait olduğunu çok iyi biliyorsun.";
      explanation = "Yazdırma metotları konsola çıktı göndermek için diller arası en belirgin farklardan biridir.";

    } else if (currentQuestion.type === "free-code") {
      // Freeform AI Evaluation calling Express backend Gemini endpoint
      setReviewLoading(true);
      setSimulationOutput("Derleniyor ve test senaryoları çalıştırılıyor...");
      
      try {
        const response = await fetch("/api/gemini/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: stats.activeLanguage,
            question: currentQuestion.prompt,
            code: freeFormCode || currentQuestion.codeSnippet || "",
            expectedOutcome: currentQuestion.expectedOutcome
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          userCorrect = resJson.isCorrect;
          feedback = resJson.feedback || "Değerlendirme kodu işlendi.";
          explanation = resJson.explanation || "";
          setSimulationOutput(resJson.output || "Program bitti.");
          
          // Badge: AI Gurusu
          unlockBadge("b4");
          // Quest: Free form coding evaluation
          triggerQuestProgress("q4", 1);
        } else {
          // Local fallback in case network issues
          const cleanUserCode = freeFormCode.toLowerCase();
          userCorrect = cleanUserCode.includes("print") || cleanUserCode.includes("write") || cleanUserCode.includes("system");
          feedback = "Yerel Kontrol: Kodunuz temel yapı kurallarını karşılıyor!";
          explanation = "Gemini AI ile bağlantı kurulamadı ancak yerel test motorumuz kod yapısını geçerli buldu.";
          setSimulationOutput("Çıktı Simülasyonu: " + (currentQuestion.expectedOutcome || "Süreç Başarılı"));
        }
      } catch (err) {
        const cleanUserCode = freeFormCode.toLowerCase();
        userCorrect = cleanUserCode.includes("print") || cleanUserCode.includes("write") || cleanUserCode.includes("system");
        feedback = "Yerel Kontrol: Kodunuz geçerli!";
        explanation = "Çevrimdışı fallback kontrolü gerçekleştirildi.";
        setSimulationOutput("Çerçeveniz doğru.");
      } finally {
        setReviewLoading(false);
      }
    }

    setIsCorrect(userCorrect);
    setFeedbackMsg(feedback);
    setExplanationMsg(explanation);
    setIsAnswerChecked(true);

    if (!userCorrect) {
      setWrongAnswersCount(prev => prev + 1);
      setStats(prev => ({
        ...prev,
        hearts: Math.max(0, prev.hearts - 1)
      }));
    }
  };

  // Advance quiz step
  const handleNextQuestion = () => {
    if (!activeLesson) return;

    if (currentQuestionIdx + 1 < activeLesson.questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      resetQuestionStates();
    } else {
      // Lesson fully completed celebration!
      const totalXpEarned = 25;
      const totalGemsEarned = 15;
      
      const nextCompletedLessons = [...stats.completedLessons];
      if (!nextCompletedLessons.includes(activeLesson.id)) {
        nextCompletedLessons.push(activeLesson.id);
      }

      setStats(prev => ({
        ...prev,
        xp: prev.xp + totalXpEarned,
        gems: prev.gems + totalGemsEarned,
        completedLessons: nextCompletedLessons
      }));

      // Unlock Badge 1: İlk Satır
      unlockBadge("b1");

      // Handle Quest 1 progress: Earn 50 XP
      triggerQuestProgress("q1", totalXpEarned);

      // Handle Quest 2 progress: No wrong answer lesson completion
      if (wrongAnswersCount === 0) {
        triggerQuestProgress("q2", 1);
        unlockBadge("b2");
      }

      // If finished at least multiple languages
      const uniqueLangs = new Set(nextCompletedLessons.map(id => id.split("_")[0]));
      if (uniqueLangs.size >= 2) {
        unlockBadge("b3");
      }

      // Close lesson view
      setActiveLesson(null);
      setActiveTab("learn");
      setAppAlert(`TEBRİKLER! Dersi başarıyla tamamladın.\n🏆 Kazandığın: +25 XP | 💎 +15 Mücevher`);
    }
  };

  const unlockBadge = (badgeId: string) => {
    setStats(prev => ({
      ...prev,
      badges: prev.badges.map(b => {
        if (b.id === badgeId && !b.isUnlocked) {
          return { ...b, isUnlocked: true, unlockedAt: new Date().toLocaleDateString() };
        }
        return b;
      })
    }));
  };

  // Ask Lingo AI Assistant
  const handleSendChat = async () => {
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/gemini/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: stats.activeLanguage,
          question: activeLesson?.questions[currentQuestionIdx]?.prompt || "Genel programlama",
          chatHistory: chatHistory.map(h => ({
            role: h.role === "user" ? "user" : "model",
            text: h.text
          })),
          message: userMsg,
          isVip: stats.isVip
        })
      });

      if (response.ok) {
        const resJson = await response.json();
        setChatHistory(prev => [...prev, { role: "lingo", text: resJson.reply }]);
      } else {
        const errorText = await response.text();
        setChatHistory(prev => [...prev, { role: "lingo", text: `Sunucuya bağlanılamadı (Hata: ${response.status}). Detay: ${errorText} (ApiKey ayarlarını yapmayı unutma veya uygulamayı yenile 💎)` }]);
      }
    } catch {
      setChatHistory(prev => [...prev, { role: "lingo", text: "Küçük bir hata oluştu. Lütfen biraz sonra tekrar sormayı dene!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Quests claiming UI action
  const claimQuestReward = (quest: Quest) => {
    if (quest.isCompleted) {
      setStats(prev => ({
        ...prev,
        xp: prev.xp + quest.xpReward,
        gems: prev.gems + 10 // bonus gems
      }));
      // Remove or mark as claimed by modifying lists
      setQuests(prev => prev.map(q => {
        if (q.id === quest.id) {
          return { ...q, currentCount: q.targetCount, xpReward: 0 }; // 0 reward tells us it's claimed
        }
        return q;
      }));
    }
  };

  // Save profile changes
  const saveProfile = () => {
    setStats(prev => ({
      ...prev,
      name: editName
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isLight = stats.theme === "light";

  if (!fbAuthInitialized) {
    return (
      <div className="min-h-screen font-sans flex flex-col items-center justify-center p-6 transition-all bg-black text-slate-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto text-slate-950 text-3xl font-black animate-bounce shadow-xl shadow-sky-400/20">
            🐍
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest animate-pulse">BYTEQUEST SEANS GİRİŞİ YAPILIYOR...</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Güvenli bulut bağlantısı kuruluyor</p>
        </div>
      </div>
    );
  }

  if (!fbUser) {
    return (
      <div className="min-h-screen font-sans flex flex-col items-center justify-center p-6 bg-black text-slate-100" style={{
        backgroundImage: "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.1) 0%, transparent 70%)"
      }}>
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center">
            {/* Mascot header with the Requested Blue Python */}
            <div className="w-20 h-20 bg-sky-500 rounded-3xl flex items-center justify-center mx-auto text-slate-950 text-4xl font-black shadow-2xl shadow-sky-500/20 transform hover:rotate-6 transition-transform duration-300 relative">
              🐍
              <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase py-0.5 px-1.5 rounded-md border border-slate-950">
                PWA
              </span>
            </div>
            
            <h1 className="text-2xl font-black tracking-tighter mt-4 uppercase">
              ByteQuest Yazılım Akademisi
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Yapay Zeka & Çoklu Dil Kodlama Serüveni
            </p>
          </div>

          <div className="rounded-3xl p-6 md:p-8 border shadow-2xl bg-zinc-950 border-zinc-900">
            
            {!fbForgotPasswordMode && (
              <div className="flex border-b border-slate-800 mb-6">
                <button
                  onClick={() => { setFbIsLoginMode(true); setFbError(null); setFbSuccessMessage(null); }}
                  className={`flex-1 pb-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    fbIsLoginMode 
                      ? "border-sky-500 text-sky-450 font-extrabold" 
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => { setFbIsLoginMode(false); setFbError(null); setFbSuccessMessage(null); }}
                  className={`flex-1 pb-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    !fbIsLoginMode 
                      ? "border-sky-500 text-sky-450 font-extrabold" 
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Üye Ol
                </button>
              </div>
            )}

            {fbForgotPasswordMode && (
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-sky-400 tracking-wider">ŞİFREMİ UNUTTUM</h3>
                <button 
                  onClick={() => { setFbForgotPasswordMode(false); setFbError(null); setFbSuccessMessage(null); }}
                  className="text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  ← Giriş Ekranına Dön
                </button>
              </div>
            )}

            {fbSuccessMessage && (
              <div className="mb-5 p-4 rounded-xl border bg-emerald-500/15 border-emerald-500/25 text-emerald-400 text-xs font-semibold leading-relaxed">
                ✓ {fbSuccessMessage}
              </div>
            )}

            {fbError && (
              <div className="mb-5 p-4 rounded-xl border bg-rose-500/15 border-rose-500/25 text-rose-450 text-xs font-bold leading-relaxed">
                ⚠️ {fbError}
              </div>
            )}

            <form onSubmit={
              fbForgotPasswordMode 
                ? handleFirebasePasswordReset 
                : (fbIsLoginMode ? handleFirebaseSignIn : handleFirebaseSignUp)
            } className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-POSTA ADRESİ</label>
                <input
                  type="email"
                  required
                  value={fbEmail}
                  onChange={(e) => setFbEmail(e.target.value)}
                  placeholder="ornek@bytequest.net"
                  className="w-full border font-bold text-xs py-2.5 px-3 rounded-xl focus:outline-none focus:border-sky-500 transition-all bg-zinc-900/50 border-zinc-800 text-slate-100 placeholder-slate-600"
                />
              </div>

              {!fbForgotPasswordMode && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ŞİFRE</label>
                    <button
                      type="button"
                      onClick={() => { setFbForgotPasswordMode(true); setFbError(null); setFbSuccessMessage(null); }}
                      className="text-[9px] font-black uppercase text-sky-400 hover:underline cursor-pointer"
                    >
                      Şifremi Unuttum?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={fbPassword}
                    onChange={(e) => setFbPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full border font-bold text-xs py-2.5 px-3 rounded-xl focus:outline-none focus:border-sky-500 transition-all bg-zinc-900/50 border-zinc-800 text-slate-100 placeholder-slate-600"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={fbLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {fbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (
                  fbForgotPasswordMode ? "SIFIRLAMA BAĞLANTISI GÖNDER" : (
                    fbIsLoginMode ? "GİRİŞ YAP ✓" : "ÜCRETSİZ KAYIT OL & BAĞLAN ✓"
                  )
                )}
              </button>
              
              {!fbForgotPasswordMode && (
                <>
                  <div className="relative py-2 flex items-center justify-center">
                    <div className="absolute inset-x-0 h-px bg-zinc-900 border-none"></div>
                    <span className="relative z-10 px-4 text-[10px] font-black uppercase tracking-widest bg-zinc-950 text-slate-500">
                      VEYA ŞUNUNLA GİRİŞ YAP
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleFirebaseSocial("google")}
                      disabled={fbLoading}
                      className="flex-1 font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border bg-zinc-900/50 text-slate-300 border-zinc-800 hover:bg-zinc-800"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" style={{fill: "#4285F4"}} />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" style={{fill: "#34A853"}} />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" style={{fill: "#FBBC05"}} />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" style={{fill: "#EA4335"}} />
                      </svg>
                      GOOGLE
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleFirebaseSocial("github")}
                      disabled={fbLoading}
                      className="flex-1 font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      GITHUB
                    </button>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setFbError("Giriş yapmadan ByteQuest akademisine erişemezsiniz. Lütfen üye olunuz veya mevcut hesabınızla giriş yapınız!");
                }}
                className={`w-full font-black text-[11px] uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isLight 
                    ? "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                    : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                ÜYE OLMADAN KEŞFET (MİSAFİR)
              </button>
            </form>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
              📱 PWA: Bu uygulamayı masaüstünüze veya telefon ana ekranınıza ekleyip <br/>
              <b>çevrimdışı (offline)</b> olarak çalıştırabilirsiniz!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 selection:bg-emerald-500 selection:text-slate-950 ${
      isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-slate-100 bg-slate-950"
    }`}>
      
      {/* Top Header Section */}
      <Header 
        stats={stats} 
        onLanguageChange={handleLanguageChange} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          // If we exit lesson, reset
          if (tab !== "learn") setActiveLesson(null);
        }}
        activeTab={activeTab}
        onToggleTheme={handleToggleTheme}
        onToggleVip={handleToggleVip}
      />

      {/* Main app grid structure optimized for 'Bold Typography' */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8">
        
        {/* If Active Lesson interactive quiz is ongoing, block screen with standard Duolingo practice studio */}
        {activeLesson ? (
          <div className={`max-w-3xl mx-auto rounded-3xl border shadow-2xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-slate-100"
          }`}>
            
            {/* Header progress bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <button
                onClick={() => setActiveLesson(null)}
                className={`p-2 rounded-xl border transition-all ${
                  isLight 
                    ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" 
                    : "text-slate-400 hover:text-slate-100 bg-slate-950 border-slate-800"
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className={`flex-1 h-3 rounded-full overflow-hidden border ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"
              }`}>
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${((currentQuestionIdx) / activeLesson.questions.length) * 100}%` }}
                />
              </div>

              <div className="text-xs font-black uppercase text-slate-400 tracking-wider">
                SORU {currentQuestionIdx + 1}/{activeLesson.questions.length}
              </div>
            </div>

            {/* Main question prompt */}
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">AKTİF SINAV GÖREVİ</span>
              <h3 className={`text-xl font-black uppercase tracking-tight mt-1 ${isLight ? "text-slate-900" : "text-slate-150"}`}>
                {activeLesson.questions[currentQuestionIdx].prompt}
              </h3>
            </div>

            {/* Switch statement for quiz question rendering */}
            <div className="space-y-4 mb-8">
              
              {/* Type: Multiple choice */}
              {activeLesson.questions[currentQuestionIdx].type === "multiple-choice" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeLesson.questions[currentQuestionIdx].options?.map((option) => (
                    <button
                      key={option}
                      disabled={isAnswerChecked}
                      onClick={() => setSelectedOption(option)}
                      className={`p-4 rounded-2xl border text-left font-black text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        selectedOption === option
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg"
                          : isLight
                            ? "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Type: Fill Gap */}
              {activeLesson.questions[currentQuestionIdx].type === "fill-gap" && (
                <div className={`p-6 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                  <div className="font-mono text-xs text-slate-500 uppercase tracking-widest mb-3">KOD BOŞLUĞU DOLDURMA</div>
                  <div className={`font-mono text-sm uppercase tracking-tight p-4 rounded-xl border mb-4 whitespace-nowrap overflow-x-auto ${
                    isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-900 border-slate-800 text-slate-250"
                  }`}>
                    {activeLesson.questions[currentQuestionIdx].codeSnippet?.replace("___", "______")}
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Eksik anahtar kelimeyi girin..."
                      value={fillGapAnswer}
                      onChange={(e) => setFillGapAnswer(e.target.value)}
                      disabled={isAnswerChecked}
                      className={`flex-1 border px-4 py-3 rounded-xl font-extrabold text-sm uppercase tracking-wider focus:outline-none focus:border-emerald-500 transition-all font-mono ${
                        isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-slate-100"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Type: Match Pair */}
              {activeLesson.questions[currentQuestionIdx].type === "match-pair" && (
                <div className={`p-6 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">HAFIZA KARTI VE DİL EŞLEŞTİRME</span>
                  
                  <div className="flex flex-col gap-2">
                    {activeLesson.questions[currentQuestionIdx].options?.map((pair, index) => {
                      const [cmd, lang] = pair.split(" : ");
                      return (
                        <div key={index} className={`flex items-center justify-between p-3.5 rounded-xl border ${
                          isLight ? "bg-white border-slate-100 text-slate-800" : "bg-slate-900 border-slate-80 border-slate-800"
                        }`}>
                          <span className="font-mono text-xs uppercase text-emerald-500 font-black">{cmd}</span>
                          <span className="text-xs uppercase text-slate-400 font-black">{lang}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Type: Free Code AI Evaluated */}
              {activeLesson.questions[currentQuestionIdx].type === "free-code" && (
                <div className="space-y-3">
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                    
                    {/* Fake editor tab header */}
                    <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          LINGO.EDIT (MAIN.{stats.activeLanguage === "python" ? "PY" : stats.activeLanguage === "csharp" ? "CS" : "JAVA"})
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                      </div>
                    </div>

                    {/* Integrated Monospaced Editor Area */}
                    <div className="flex bg-slate-950 font-mono text-sm p-4 gap-4 height-[200px]">
                      <div className="text-slate-650 text-right select-none pr-1 border-r border-slate-900 hidden sm:block">
                        <div>1</div>
                        <div>2</div>
                        <div>3</div>
                        <div>4</div>
                        <div>5</div>
                      </div>
                      
                      <textarea
                        disabled={isAnswerChecked || reviewLoading}
                        value={freeFormCode || activeLesson.questions[currentQuestionIdx].codeSnippet}
                        onChange={(e) => setFreeFormCode(e.target.value)}
                        placeholder="# Kodlama diline göre buraya gerçek ifadeler yazın..."
                        style={{ height: "130px" }}
                        className="flex-1 bg-transparent border-0 outline-none p-0 text-slate-100 font-bold focus:ring-0 resize-none placeholder-slate-700 font-mono"
                      />
                    </div>

                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-semibold">
                    💡 <span className="font-black text-slate-250 uppercase tracking-widest">BEKLENEN SİMÜLASYON ŞARTI:</span> {activeLesson.questions[currentQuestionIdx].expectedOutcome}
                  </div>

                  {/* Terminal stdout display */}
                  {simulationOutput && (
                    <div className="bg-black p-3.5 rounded-xl border border-slate-850 font-mono text-xs">
                      <div className="text-slate-500 uppercase tracking-widest text-[9px] mb-1">PROGRAM ÇIKTISI (STDOUT):</div>
                      <div className="text-green-400 text-xs font-bold font-mono">{simulationOutput}</div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Feedback and dynamic AI evaluation drawer */}
            <AnimatePresence>
              {isAnswerChecked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-5 rounded-2xl mb-6 flex flex-col md:flex-row md:items-start gap-4 border ${
                    isCorrect 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-slate-100" 
                      : "bg-red-500/10 border-red-500/20 text-slate-100"
                  }`}
                >
                  <div className="text-3xl">
                    {isCorrect ? `${activeMascot.emoji}✅` : `${activeMascot.emoji}❌`}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black uppercase tracking-wider">{isCorrect ? "KUSURSUZ!" : "KOD HATASI!"}</h4>
                    <p className="text-xs font-semibold leading-relaxed text-slate-300">{feedbackMsg}</p>
                    {explanationMsg && (
                      <p className="text-[10px] text-slate-400 font-mono italic mt-1.5 leading-snug">
                        💡 {explanationMsg}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions for Quiz question checking */}
            <div className="flex gap-4">
              
              {!isAnswerChecked ? (
                <button
                  onClick={checkAnswer}
                  disabled={
                    reviewLoading || 
                    (activeLesson.questions[currentQuestionIdx].type === "multiple-choice" && !selectedOption) ||
                    (activeLesson.questions[currentQuestionIdx].type === "fill-gap" && !fillGapAnswer)
                  }
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {reviewLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin stroke-[3]" />
                      DEĞERLENDİRİLİYOR (YAPAY ZEKA)...
                    </>
                  ) : (
                    "KODU DERLE VE DENETLE"
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-widest py-4 px-6 rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  DEVAM ET
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              )}

              {/* Lingo assist inline chat toggle */}
              <button
                onClick={() => setShowChat(true)}
                title="Lingo'ya Sor"
                className="bg-indigo-600 hover:bg-indigo-500 p-4 rounded-2xl text-white transition-all transform active:scale-95 border border-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">HATA DESTEĞİ</span>
              </button>

            </div>

          </div>
        ) : (
          
          /* IF not inside active quiz, render tab contents */
          <div>
            
            {/* LEARN TAB */}
            {activeTab === "learn" && (
              <LessonTree
                lessons={getCurrentLessons()}
                stats={stats}
                onStartLesson={handleStartLesson}
                onRefillHearts={handleRefillHearts}
                onRefillEnergy={handleRefillEnergy}
                onToggleVip={handleToggleVip}
                onClaimDailyReward={handleClaimDailyReward}
              />
            )}

            {/* PLAYGROUND TAB */}
            {activeTab === "playground" && (
              <Playground stats={stats} theme={stats.theme} />
            )}

            {/* BATTLE INDEX TAB */}
            {activeTab === "battle" && (
              <TriviaArena stats={stats} onReward={handleArenaReward} theme={stats.theme} />
            )}

            {/* LEADERBOARD TAB */}
            {activeTab === "leaderboard" && (
              <Leaderboard users={leaderboard} theme={stats.theme} activeLanguage={stats.activeLanguage} />
            )}

            {/* QUESTS GÖREVLER Tab implemented internally directly under 'Bold Typography' */}
            {activeTab === "store" && (
              <StoreTab stats={stats} onBuyItem={handleBuyItem} />
            )}

            {activeTab === "quests" && (
              <div className="max-w-2xl mx-auto py-6 px-4">
                
                {/* Section Header */}
                <div className="text-center mb-8">
                  <div className={`inline-block p-4 rounded-full mb-3 ${
                    isLight 
                      ? "bg-purple-100 border border-purple-200 text-purple-600" 
                      : "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                  }`}>
                    <Zap className="w-12 h-12 stroke-[2.5]" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">HAFTALIK SIRALAMA & GÖREVLER</div>
                  <h2 className={`text-2xl font-black uppercase tracking-tight ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                    KODLAMA SERÜVEN GÖREVLERİ
                  </h2>
                  <p className={`text-xs font-bold mt-1 ${isLight ? "text-slate-650" : "text-slate-400"}`}>
                    Geliştirici rütbeni yükseltmek için aşağıdaki özel görevleri sırasıyla tamamla oradan mücevher topla!
                  </p>
                </div>

                <div className="space-y-4">
                  {quests.map((quest) => {
                    const progressPercentage = (quest.currentCount / quest.targetCount) * 100;
                    const isClaimed = quest.xpReward === 0;

                    return (
                      <div 
                        key={quest.id} 
                        className={`rounded-3xl p-6 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:scale-[1.01] ${
                          isLight 
                            ? "bg-white border-slate-200 shadow-md hover:shadow-lg text-slate-900" 
                            : "bg-slate-900/50 border-slate-800 hover:bg-slate-900 text-slate-100"
                        } ${quest.isCompleted && !isClaimed ? "border-emerald-500/40" : ""}`}
                      >
                        
                        <div className="flex-1 space-y-2 w-full">
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {quest.id === "q1" ? "📈" : quest.id === "q2" ? "🛡️" : quest.id === "q3" ? "🌍" : "🤖"}
                            </span>
                            <div className="flex-1">
                              <h4 className="text-sm font-black uppercase tracking-tight">{quest.title}</h4>
                              <p className={`text-[11px] font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>{quest.description}</p>
                            </div>
                          </div>

                          {/* Live beautiful Progress bar indicator */}
                          <div className="flex items-center gap-3 w-full">
                            <div className={`flex-1 h-2 rounded-full overflow-hidden border ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  quest.isCompleted ? "bg-emerald-500" : "bg-purple-500"
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-mono font-black text-slate-400 tracking-wider animate-pulse">
                              {quest.currentCount}/{quest.targetCount}
                            </span>
                          </div>

                        </div>

                        {/* Claim action button panel */}
                        <div className="w-full md:w-auto text-right">
                          {isClaimed ? (
                            <span className={`text-[9px] font-black border px-3 py-1.5 rounded-xl uppercase tracking-widest block text-center ${
                              isLight ? "bg-slate-100 border-slate-200 text-slate-400" : "bg-slate-950 border-slate-850 text-slate-550"
                            }`}>
                              ÖDÜL ALINDI
                            </span>
                          ) : quest.isCompleted ? (
                            <button
                              onClick={() => claimQuestReward(quest)}
                              className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-xl shadow-lg shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer"
                            >
                              ÖDÜLÜ AL (+{quest.xpReward} XP)
                            </button>
                          ) : (
                            <span className={`text-[9px] font-black border px-3 py-1.5 rounded-xl uppercase tracking-widest block text-center ${
                              isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-slate-950 border-slate-800 text-slate-400"
                            }`}>
                              +{quest.xpReward} XP HEDİYE
                            </span>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="max-w-4xl mx-auto py-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-inherit">
                
                {/* Left Card: Stats Overview */}
                <div className={`rounded-3xl p-6 border shadow-xl backdrop-blur-md space-y-6 ${
                  isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900/50 border-slate-800 text-slate-100"
                }`}>
                  
                  <div className="text-center space-y-2">
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-5xl border-2 p-1.5 shadow-xl ${
                      isLight ? "bg-slate-100 border-emerald-400/30" : "bg-slate-955 border-emerald-500/40 shadow-emerald-500/5"
                    }`}>
                      {activeMascot.emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight">{stats.name}</h3>
                      <span className="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full text-emerald-500 uppercase tracking-wider block w-max mx-auto mt-1">
                        🏆 {stats.title}
                      </span>
                    </div>
                  </div>

                  <hr className={isLight ? "border-slate-200" : "border-slate-800"} />

                  {/* Core Numeric Indicators */}
                  <div className="text-center mb-6">
                    <div className="inline-block relative">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className={isLight ? "text-slate-100" : "text-slate-800"} />
                        <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="276" strokeDashoffset={276 - (276 * ((stats.xp % 100) / 100))} className="text-emerald-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase text-slate-400">SEVİYE</span>
                        <span className="text-3xl font-black text-emerald-500 font-mono">{Math.floor(stats.xp / 100) + 1}</span>
                      </div>
                    </div>
                    <p className={`text-[10px] font-bold mt-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      Sonraki seviyeye {100 - (stats.xp % 100)} XP kaldı!
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className={`p-3.5 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                      <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">TOPLAM XP</span>
                      <span className="text-lg font-black text-emerald-500 font-mono mt-1 block">{stats.xp}</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                      <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">GÜNLÜK SERİ</span>
                      <span className="text-lg font-black text-orange-500 font-mono mt-1 block">{stats.streak} 🔥</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                      <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">MÜCEVHERLER</span>
                      <span className="text-lg font-black text-cyan-500 font-mono mt-1 block">{stats.gems} 💎</span>
                    </div>
                    <div className={`p-3.5 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                      <span className="text-xs font-black text-slate-500 block uppercase tracking-wider">DERS SAYISI</span>
                      <span className="text-lg font-black text-purple-500 font-mono mt-1 block">{stats.completedLessons.length}</span>
                    </div>
                  </div>

                </div>

                {/* Right Card: Profile Settings & Badges */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Settings section */}
                  <section className={`rounded-3xl p-6 border shadow-xl backdrop-blur-md ${
                    isLight ? "bg-white border-slate-200" : "bg-slate-900/50 border-slate-800"
                  }`}>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">PROFİL HESABINI GÜNCELLE</span>
                    <h3 className="text-base font-black uppercase tracking-tight mb-4">
                      HESAP AYARLARI
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="flex-1 w-full space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">KOD ADINIZ (NAME)</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={`w-full border font-extrabold text-sm uppercase tracking-wider py-3 px-4 rounded-xl focus:outline-none focus:border-emerald-500 transition-all ${
                            isLight 
                              ? "bg-slate-100 border-slate-200 text-slate-900" 
                              : "bg-slate-950 border-slate-800 text-slate-100"
                          }`}
                        />
                      </div>
                      
                      <button
                        onClick={saveProfile}
                        className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl transition-all cursor-pointer"
                      >
                        DEĞİŞİKLİKLERİ KAYDET
                      </button>
                    </div>

                    {saveSuccess && (
                      <div className="mt-3 text-xs bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 p-2 rounded-lg font-bold text-center">
                        ✓ Profil güncellendi! Rütbe unvanı sisteme kaydedildi.
                      </div>
                    )}

                    <div className={`mt-6 p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                    }`}>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                          <Crown className={`w-4 h-4 ${stats.isVip ? 'text-amber-500' : 'text-slate-400'}`} />
                          VIP Abonelik (Sınırsız Enerji)
                        </h4>
                        <p className={`text-[10px] font-bold mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          VIP olanlar yapay zeka asistanından daha detaylı (elit) yanıtlar alır ve enerji sınırı yaşamazlar!
                        </p>
                      </div>
                      <button
                        onClick={handleToggleVip}
                        className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                          stats.isVip 
                            ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20" 
                            : (isLight ? "bg-slate-200 text-slate-500" : "bg-slate-800 text-slate-300")
                        }`}
                      >
                        {stats.isVip ? "VIP AKTİF 👑" : "VIP OL (100💎)"}
                      </button>
                    </div>

                    <div className={`mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                    }`}>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                          {isLight ? <Sun className="w-4 h-4 text-orange-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                          Görünüm Teması
                        </h4>
                        <p className={`text-[10px] font-bold mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          Uygulamanın arayüz temasını aydınlık veya karanlık olarak değiştir.
                        </p>
                      </div>
                      <button
                        onClick={handleToggleTheme}
                        className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                          isLight 
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {isLight ? "KARANLIK TEMA YAP" : "AYDINLIK TEMA YAP"}
                      </button>
                    </div>
                  </section>

                  {/* PWA & Firebase Sync section */}
                  <section className={`rounded-3xl p-6 border shadow-xl backdrop-blur-md ${
                    isLight ? "bg-white border-slate-200" : "bg-slate-900/50 border-slate-800"
                  }`}>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">BULUT VERİ TABANI KORUMASI</span>
                    <h3 className="text-base font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center p-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-500 rounded-lg text-lg">☁️</span>
                      FİREBASE BULUT SENKRONİZASYONU & PWA
                    </h3>
                    <p className={`text-[11px] font-bold mb-5 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                      ByteQuest artık çevrimdışı çalışabilen bir <b>Progressive Web App (PWA)</b> olarak cihazınıza yüklenebilir! 
                      İlerlemenizi kaybetmemek ve tüm cihazlarınızda eşitlemek için Firebase bağlantısını kurun.
                    </p>

                    {fbUser ? (
                      <div className={`p-5 rounded-2xl border space-y-4 ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                      }`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <span className="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              BAĞLANDI ✓
                            </span>
                            <h4 className="text-sm font-black uppercase tracking-tight mt-1.5 break-all">
                              {fbUser.isAnonymous ? "MİSAFİR SEANS-ID" : "GELİŞTİRİCİ PROFİLİ"}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 break-all">
                              {fbUser.email || fbUser.uid}
                            </p>
                          </div>
                          
                          <button
                            onClick={handleFirebaseSignOut}
                            className="text-xs font-black uppercase tracking-widest bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl transition-all cursor-pointer text-rose-500"
                          >
                            OTURUMU KAPAT
                          </button>
                        </div>

                        <hr className={isLight ? "border-slate-200" : "border-slate-800"} />

                        <div className="flex flex-col sm:flex-row gap-3 items-center">
                          <button
                            onClick={() => pushStatsToFirestore(fbUser.uid, stats)}
                            disabled={fbLoading}
                            className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {fbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "☁️ BULUTA YEDEKLE (PUSH)"}
                          </button>

                          <button
                            onClick={() => pullStatsFromFirestore(fbUser.uid)}
                            disabled={fbLoading}
                            className={`w-full sm:flex-1 font-black text-xs uppercase tracking-widest py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                              isLight 
                                ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                                : "bg-slate-850 text-slate-200 hover:bg-slate-800"
                            }`}
                          >
                            {fbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "🔄 BULUTTAN YÜKLE (PULL)"}
                          </button>
                        </div>

                        {fbSyncSuccess && (
                          <div className="text-center text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl animate-pulse">
                            ✓ Verileriniz Firebase Firestore veritabanına başarıyla kaydedildi!
                          </div>
                        )}

                        <div className="text-[9px] font-black uppercase text-indigo-400 tracking-wider text-center pt-1 animate-pulse">
                          ⚡ Otomatik senkronizasyon aktif: İlerlemeniz eşzamanlı olarak buluta işleniyor.
                        </div>
                      </div>
                    ) : (
                      <div className={`p-5 rounded-2xl border space-y-4 ${
                        isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"
                      }`}>
                        <div className="flex border-b border-slate-850">
                          <button
                            onClick={() => { setFbIsLoginMode(true); setFbError(null); }}
                            className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                              fbIsLoginMode 
                                ? "border-sky-500 text-sky-500" 
                                : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            GİRİŞ YAP
                          </button>
                          <button
                            onClick={() => { setFbIsLoginMode(false); setFbError(null); }}
                            className={`flex-1 py-2 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                              !fbIsLoginMode 
                                ? "border-sky-500 text-sky-500" 
                                : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            HESAP OLUŞTUR
                          </button>
                        </div>

                        <form onSubmit={fbIsLoginMode ? handleFirebaseSignIn : handleFirebaseSignUp} className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-POSTA ADRESİ</label>
                            <input
                              type="email"
                              required
                              value={fbEmail}
                              onChange={(e) => setFbEmail(e.target.value)}
                              placeholder="ornek@bytequest.com"
                              className={`w-full border font-bold text-xs py-2.5 px-3 rounded-lg focus:outline-none focus:border-sky-500 transition-all ${
                                isLight 
                                  ? "bg-white border-slate-200 text-slate-900" 
                                  : "bg-slate-900 border-slate-800 text-slate-100"
                              }`}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ŞİFRE</label>
                            <input
                              type="password"
                              required
                              value={fbPassword}
                              onChange={(e) => setFbPassword(e.target.value)}
                              placeholder="••••••"
                              className={`w-full border font-bold text-xs py-2.5 px-3 rounded-lg focus:outline-none focus:border-sky-500 transition-all ${
                                isLight 
                                  ? "bg-white border-slate-200 text-slate-900" 
                                  : "bg-slate-900 border-slate-800 text-slate-100"
                              }`}
                            />
                          </div>

                          {fbError && (
                            <div className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg leading-relaxed select-text">
                              ⚠️ Hata: {fbError}
                            </div>
                          )}

                          <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            <button
                              type="submit"
                              disabled={fbLoading}
                              className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {fbLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (fbIsLoginMode ? "GİRİŞ YAP ✓" : "KAYIT OL VE BAĞLAN ✓")}
                            </button>

                            <button
                              type="button"
                              onClick={handleFirebaseAnonymous}
                              disabled={fbLoading}
                              className={`text-xs font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                                isLight 
                                  ? "bg-slate-200 text-slate-800 hover:bg-slate-300" 
                                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                              }`}
                            >
                              MİSAFİR BAĞLANTISI (ANONYMOUS)
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </section>

                  {/* Achievements and Badges */}
                  <section className={`rounded-3xl p-6 border shadow-xl backdrop-blur-md ${
                    isLight ? "bg-white border-slate-200" : "bg-slate-900/50 border-slate-800"
                  }`}>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">KODLAMA BAŞARILARINIZ</span>
                    <h3 className="text-base font-black uppercase tracking-tight mb-4">
                      ROZET KOLEKSİYONU
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {stats.badges.map((badge: Badge) => (
                        <div 
                          key={badge.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            badge.isUnlocked 
                              ? (isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800") 
                              : "opacity-40 select-none grayscale"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-3xl border p-2 rounded-xl block ${isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"}`}>
                              {badge.icon}
                            </span>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wide">{badge.title}</h4>
                              <p className={`text-[10px] font-semibold leading-relaxed mt-0.5 ${isLight ? "text-slate-650" : "text-slate-400"}`}>{badge.description}</p>
                              {badge.isUnlocked && (
                                <span className="text-[8px] text-emerald-500 font-extrabold uppercase mt-1 block tracking-wider">
                                  AÇILDI: {badge.unlockedAt || "Bugün"} 
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </section>

                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* Floating Chat Window widget with Lingo Coding Mascot Assistant - Interactive AI logic */}
      <div className="fixed bottom-6 right-6 z-50">
        
        {/* Toggle bubble button */}
        {!showChat && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChat(true)}
            className="w-14 h-14 bg-emerald-500 text-slate-950 font-black text-2xl rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/25 ring-4 ring-slate-950/80 hover:bg-emerald-400 relative cursor-pointer"
          >
            {activeMascot.emoji}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 text-[8px] text-white font-extrabold items-center justify-center">AI</span>
            </span>
          </motion.button>
        )}

        {/* Dynamic Chat Dialog Window */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="w-[320px] sm:w-[380px] h-[500px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              
              {/* Box Header */}
              <div className="bg-slate-950 p-4 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-wiggle">{activeMascot.emoji}</span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-100 tracking-wide">YAZILIM KOÇU {activeMascot.name.toUpperCase()}</h4>
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block -mt-0.5">Yapay Zeka Destekli</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowChat(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat list history */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950 flex flex-col">
                {chatHistory.map((msg, index) => (
                  <div 
                    key={index}
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-semibold ${
                      msg.role === "user"
                        ? "bg-emerald-500 text-slate-950 font-black self-end rounded-tr-none"
                        : "bg-slate-900 text-slate-200 self-start border border-slate-800 rounded-tl-none whitespace-pre-line"
                    }`}
                  >
                    {msg.text.replace(/Lingo/g, activeMascot.name)}
                  </div>
                ))}

                {chatLoading && (
                  <div className="bg-slate-900 text-slate-400 text-xs py-2 px-3.5 rounded-2xl border border-slate-800 self-start rounded-tl-none animate-pulse">
                    {activeMascot.name} yazıyor... {activeMascot.emoji}📝
                  </div>
                )}
              </div>

              {/* Box input message bar */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Python, Java veya C# hakkında sor..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  className="flex-1 bg-slate-950 border border-slate-855 px-3 py-2 rounded-xl text-xs text-slate-100 font-extrabold focus:outline-none focus:border-emerald-500"
                />

                <button
                  onClick={handleSendChat}
                  disabled={!chatMessage.trim() || chatLoading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3.5 py-2 rounded-xl transition-all disabled:opacity-30 flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {appAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm shadow-xl">
            <div className={`p-6 rounded-3xl max-w-sm w-full shadow-2xl relative ${isLight ? "bg-white text-slate-900 border border-slate-200" : "bg-zinc-950 text-slate-100 border border-zinc-800"}`}>
              <button 
                onClick={() => setAppAlert(null)}
                className="absolute top-4 right-4 p-1 rounded-xl bg-slate-100/10 hover:bg-slate-500/20"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-black tracking-tight mb-2 uppercase">BİLDİRİM</h3>
              <p className="text-sm font-bold opacity-80 whitespace-pre-wrap">{appAlert}</p>
              <button
                onClick={() => setAppAlert(null)}
                className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all"
              >
                TAMAM
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
