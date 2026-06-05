export type Language = "python" | "csharp" | "java";

export interface LessonUnit {
  id: string;
  title: string;
  description: string;
  requiredXp: number;
  status: "locked" | "available" | "completed";
  questions: QuizQuestion[];
}

export type QuestionType = "multiple-choice" | "fill-gap" | "match-pair" | "free-code";

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // Multiple choice options
  correctAnswer?: string; // The correct one (or comma-separated for match pairs)
  codeSnippet?: string; // Standard base code template for gaps/free-form code
  expectedOutcome?: string; // What the code should output/do
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  xpReward: number;
  isCompleted: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  isCurrentUser?: boolean;
  status: "up" | "down" | "same";
}

export interface UserStats {
  name: string;
  title: string;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
  completedLessons: string[];
  activeLanguage: Language;
  badges: Badge[];
  isVip?: boolean;
  energy?: number; // 0 to 100
  lastEnergyTimestamp?: number; // timestamp
  theme?: "dark" | "light";
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface MascotInfo {
  emoji: string;
  name: string;
  fullName: string;
  accentColor: string;
  desc: string;
}

export function getLanguageMascot(lang: Language): MascotInfo {
  switch (lang) {
    case "python":
      return {
        emoji: "🐍",
        name: "Mavi Pythie",
        fullName: "Mavi Python Yılanı Pythie",
        accentColor: "text-sky-400",
        desc: "Yapay zeka ve veri biliminin sevimli mavi rehberi!"
      };
    case "csharp":
      return {
        emoji: "⚔️",
        name: "Sharpie",
        fullName: "C# Şövalyesi Sharpie",
        accentColor: "text-purple-500",
        desc: "Unity oyun geliştirme ve güçlü yazılım mimarisi uzmanı!"
      };
    case "java":
      return {
        emoji: "☕",
        name: "Javie",
        fullName: "Java Duke Javie",
        accentColor: "text-amber-500",
        desc: "Nesne yönelimli programlama dünyasının meşhur kahvesi!"
      };
    default:
      return {
        emoji: "🐍",
        name: "Mavi Pythie",
        fullName: "Mavi Python Yılanı Pythie",
        accentColor: "text-sky-400",
        desc: "Yazılım akademisi rehberi!"
      };
  }
}

