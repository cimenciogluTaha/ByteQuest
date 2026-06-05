import { LessonUnit, Quest, LeaderboardUser, UserStats } from "./types";

export const initialQuests: Quest[] = [
  {
    id: "q1",
    title: "Kodlama Maratonu",
    description: "Günlük derslerden toplam 50 XP kazan.",
    targetCount: 50,
    currentCount: 0,
    xpReward: 15,
    isCompleted: false
  },
  {
    id: "q2",
    title: "Hatasız Sürüş",
    description: "Can kaybetmeden (hiç hata yapmadan) bir ders tamamla.",
    targetCount: 1,
    currentCount: 0,
    xpReward: 25,
    isCompleted: false
  },
  {
    id: "q3",
    title: "Dil Kaşifi",
    description: "Farklı bir yazılım dilinin ilk dersini başarıyla bitir.",
    targetCount: 1,
    currentCount: 0,
    xpReward: 20,
    isCompleted: false
  },
  {
    id: "q4",
    title: "Yaza Yaza Öğren",
    description: "Free-Code (Serbest Kodlama) görevinde 1 kod değerlendirmesi yap.",
    targetCount: 1,
    currentCount: 0,
    xpReward: 30,
    isCompleted: false
  }
];

export const initialLeaderboard: LeaderboardUser[] = [
  { rank: 1, name: "Selin_Coder", xp: 480, avatar: "👩‍💻", status: "up" },
  { rank: 2, name: "JavaCan", xp: 410, avatar: "☕", status: "same" },
  { rank: 3, name: "PyDostu", xp: 350, avatar: "🐍", status: "down" },
  { rank: 4, name: "Misafir Geliştirici", xp: 120, avatar: "🐍", isCurrentUser: true, status: "same" },
  { rank: 5, name: "BugHunter", xp: 210, avatar: "🐜", status: "up" },
  { rank: 6, name: "SharpDev", xp: 190, avatar: "⚔️", status: "down" },
  { rank: 7, name: "Alt_Gr", xp: 90, avatar: "⌨️", status: "same" }
];

export const initialStats: UserStats = {
  name: "Misafir Geliştirici",
  title: "Kod Çömezi",
  xp: 120,
  streak: 3,
  hearts: 5,
  gems: 150,
  completedLessons: [],
  activeLanguage: "python",
  isVip: false,
  energy: 100,
  lastEnergyTimestamp: Date.now(),
  theme: "dark",
  badges: [
    {
      id: "b1",
      title: "İlk Satır",
      description: "İlk kodlama dersini başarıyla tamamladın.",
      icon: "🎈",
      isUnlocked: false
    },
    {
      id: "b2",
      title: "Hatasız Koşucu",
      description: "0 hata ile bir ders ağacı görevi bitirdin.",
      icon: "🛡️",
      isUnlocked: false
    },
    {
      id: "b3",
      title: "Çok Dillilik",
      description: "Aynı anda 2 farklı yazılım dillerinde pratik yaptın.",
      icon: "🌍",
      isUnlocked: false
    },
    {
      id: "b4",
      title: "AI Gurusu",
      description: "Yapay Zeka kod asistanından geri bildirim aldın.",
      icon: "🤖",
      isUnlocked: false
    }
  ]
};

// PYTHON TRACK: 10 Levels
export const pythonLessons: LessonUnit[] = [
  {
    id: "py_1",
    title: "1. Giriş ve Yazdırma",
    description: "print() fonksiyonu ile tanışın ve ilk satır kodunuzu yazarak ekrana çıktı gönderin.",
    requiredXp: 0,
    status: "available",
    questions: [
      {
        id: "py_q1",
        type: "multiple-choice",
        prompt: "Python dilinde ekrana metin yazdırmak için hangi fonksiyon kullanılır?",
        options: ["echo()", "Console.Write()", "print()", "System.out.println()"],
        correctAnswer: "print()"
      },
      {
        id: "py_q2",
        type: "fill-gap",
        prompt: "Aşağıdaki kod parçasında boşluğu doldurarak ekrana 'Kodlama Harika!' metnini yazdırın.",
        codeSnippet: "___('Kodlama Harika!')",
        correctAnswer: "print"
      }
    ]
  },
  {
    id: "py_2",
    title: "2. Değişken Atamaları",
    description: "Verileri hafızada nasıl tutacağınızı (String, Integer) öğrenin.",
    requiredXp: 15,
    status: "locked",
    questions: [
      {
        id: "py_q3",
        type: "multiple-choice",
        prompt: "Python'da 'x = 5' tanımı yapıldığında bu değişkenin türü nedir?",
        options: ["String", "Float", "Integer", "Boolean"],
        correctAnswer: "Integer"
      },
      {
        id: "py_q4",
        type: "fill-gap",
        prompt: "isim isminde bir değişken tanımlayıp değerini 'Taha' yapan kodu tamamlayın.",
        codeSnippet: "isim = ___'Taha'",
        correctAnswer: ""
      }
    ]
  },
  {
    id: "py_3",
    title: "3. Koşullu Kararlar",
    description: "if, elif ve else yapılarıyla karar kontrol akışları oluşturun.",
    requiredXp: 30,
    status: "locked",
    questions: [
      {
        id: "py_q5",
        type: "multiple-choice",
        prompt: "Python if yapısında 'değilse eğer' anlamına gelen kısaltılmış kelime hangisidir?",
        options: ["else if", "elseif", "elif", "case"],
        correctAnswer: "elif"
      },
      {
        id: "py_q6",
        type: "fill-gap",
        prompt: "Eğer sayı 0'dan büyükse koşulunu yazmak için boşluğu doldurun.",
        codeSnippet: "___ sayi > 0:",
        correctAnswer: "if"
      }
    ]
  },
  {
    id: "py_4",
    title: "4. Döngü Sistemleri",
    description: "for ve while döngüleri yardımıyla kodları tekrarlı çalıştırma yönergesi.",
    requiredXp: 45,
    status: "locked",
    questions: [
      {
        id: "py_q7",
        type: "multiple-choice",
        prompt: "0'dan başlayıp belirtilen sayıya kadar dizi üreten fonksiyon hangisidir?",
        options: ["range()", "generate()", "loop()", "list()"],
        correctAnswer: "range()"
      },
      {
        id: "py_q8",
        type: "fill-gap",
        prompt: "Sonsuz bir while döngüsü kurmak için boşluğu doğru boolean değeriyle tamamlayın.",
        codeSnippet: "while ___:",
        correctAnswer: "True"
      }
    ]
  },
  {
    id: "py_5",
    title: "5. Listeler ve Metotlar",
    description: "Birden fazla veriyi tek bir liste bünyesinde sıralayarak depolayın.",
    requiredXp: 60,
    status: "locked",
    questions: [
      {
        id: "py_q9",
        type: "multiple-choice",
        prompt: "Python listesinin sonuna yeni bir eleman ekleyen fonksiyon hangisidir?",
        options: ["add()", "push()", "append()", "insert()"],
        correctAnswer: "append()"
      },
      {
        id: "py_q10",
        type: "fill-gap",
        prompt: "meyveler isimli listenin ilk elemanını elde etmek için gereken indeksi yazın.",
        codeSnippet: "ilk = meyveler[___]",
        correctAnswer: "0"
      }
    ]
  },
  {
    id: "py_6",
    title: "6. Dictionaries (Sözlükler)",
    description: "Anahtar-değer (key-value) ilişkisiyle dinamik veri şemaları saklayın.",
    requiredXp: 75,
    status: "locked",
    questions: [
      {
        id: "py_q11",
        type: "multiple-choice",
        prompt: "Python sözlüklerini tanımlamak için hangi parantez çeşidi kullanılır?",
        options: ["[]", "()", "{}", "<>"],
        correctAnswer: "{}"
      },
      {
        id: "py_q12",
        type: "fill-gap",
        prompt: "Sözlükten anahtar alıp değeri okumak için boşluğu doldurun.",
        codeSnippet: "yas = kisi.___('yas')",
        correctAnswer: "get"
      }
    ]
  },
  {
    id: "py_7",
    title: "7. Fonksiyon Tanımlama",
    description: "Tekrar kullanılabilir kod blokları oluşturarak mimarinizi sadeleştirin.",
    requiredXp: 90,
    status: "locked",
    questions: [
      {
        id: "py_q13",
        type: "multiple-choice",
        prompt: "Python dilinde yeni bir fonksiyon bildirmek için hangi anahtar kelime kullanılır?",
        options: ["func", "function", "def", "define"],
        correctAnswer: "def"
      },
      {
        id: "py_q14",
        type: "fill-gap",
        prompt: "Fonksiyondan geri değer döndürmek için kullanılan kelimeyi girin.",
        codeSnippet: "___ sonuc",
        correctAnswer: "return"
      }
    ]
  },
  {
    id: "py_8",
    title: "8. try-except İstisnaları",
    description: "Uygulamanın hata anında çökmesini önleyecek istisnai hata yakalama yöntemleri.",
    requiredXp: 105,
    status: "locked",
    questions: [
      {
        id: "py_q15",
        type: "multiple-choice",
        prompt: "Python'da hataları yakalamak için 'try' bloğunun eşi olarak hangisi kullanılır?",
        options: ["catch", "except", "error", "finally"],
        correctAnswer: "except"
      },
      {
        id: "py_q16",
        type: "fill-gap",
        prompt: "Hata olsa da olmasa da en son çalışacak kod bloğunu tanımlayan kelimeyi yazın.",
        codeSnippet: "___:\n    print('İşlem Bitti')",
        correctAnswer: "finally"
      }
    ]
  },
  {
    id: "py_9",
    title: "9. Dosya Yönetimi",
    description: "Bilgisayardaki dosyalara veri yazma ve bu dosyalardan veri okuma pratikleri.",
    requiredXp: 120,
    status: "locked",
    questions: [
      {
        id: "py_q17",
        type: "multiple-choice",
        prompt: "Python'da bir dosyayı açmak için kullanılan dahili fonksiyon hangisidir?",
        options: ["open()", "read()", "file()", "load()"],
        correctAnswer: "open()"
      },
      {
        id: "py_q18",
        type: "fill-gap",
        prompt: "Dosyayı yazma (write) modunda açmak için open fonksiyonuna geçilen parametre karakterini yazın.",
        codeSnippet: "open('veri.txt', '___')",
        correctAnswer: "w"
      }
    ]
  },
  {
    id: "py_10",
    title: "10. Nesne Yönelimli Programlama",
    description: "Sınıf (class) yapıları kurma, nesne türetme ve yapıcı metot (__init__) tasarımı.",
    requiredXp: 135,
    status: "locked",
    questions: [
      {
        id: "py_q19",
        type: "multiple-choice",
        prompt: "Sınıf metotlarında nesnenin kendisine atıfta bulunmak için hangi kelime zorunludur?",
        options: ["this", "self", "me", "class"],
        correctAnswer: "self"
      },
      {
        id: "py_q20",
        type: "free-code",
        prompt: "Yapıcı metodu olan basit bir Python sınıfı tanımlayın veya ekrana 'Sınıf Hazır' yazdıran kodu tamamlayın.",
        codeSnippet: "class Ogrenci:\n    def __init__(self):\n        print('Sınıf Hazır')\n\nOgrenci()",
        expectedOutcome: "Sınıf Hazır"
      }
    ]
  }
];

// C# TRACK: 10 Levels
export const csharpLessons: LessonUnit[] = [
  {
    id: "cs_1",
    title: "1. Console Çıktıları",
    description: "C# dünyasına adım atın. Console sınıfı yardımıyla terminale ilk veri çıkışlarını sağlayın.",
    requiredXp: 0,
    status: "available",
    questions: [
      {
        id: "cs_q1",
        type: "multiple-choice",
        prompt: "C# dilinde ekrana yeni bir satır halinde metin yazdırmak için hangisi tercih edilir?",
        options: ["Console.Write()", "Console.WriteLine()", "print()", "cmd.Write()"],
        correctAnswer: "Console.WriteLine()"
      },
      {
        id: "cs_q2",
        type: "fill-gap",
        prompt: "C# kod bloklarının sonuna hangi noktalama işareti konmalıdır?",
        codeSnippet: "string name = \"Taha\"___",
        correctAnswer: ";"
      }
    ]
  },
  {
    id: "cs_2",
    title: "2. Veri Tipleri",
    description: "Değişken türlerini (int, string, bool, double) güvenle tanımlayın.",
    requiredXp: 15,
    status: "locked",
    questions: [
      {
        id: "cs_q3",
        type: "multiple-choice",
        prompt: "C#'ta true/false verileri saklamak için hangi tipe ihtiyaç duyarız?",
        options: ["int", "string", "bool", "char"],
        correctAnswer: "bool"
      },
      {
        id: "cs_q4",
        type: "fill-gap",
        prompt: "Sayisal bir değeri tam sayı formatında tutmak için gereken tipi yazın.",
        codeSnippet: "___ adet = 100;",
        correctAnswer: "int"
      }
    ]
  },
  {
    id: "cs_3",
    title: "3. Koşullu Kontrol",
    description: "if, else if ve else mantığı ile programın karar süreçlerini akışlandırın.",
    requiredXp: 30,
    status: "locked",
    questions: [
      {
        id: "cs_q5",
        type: "multiple-choice",
        prompt: "C# ve .NET ekosisteminde mantıksal VE (AND) operatörü hangisidir?",
        options: ["and", "&&", "&", "||"],
        correctAnswer: "&&"
      },
      {
        id: "cs_q6",
        type: "fill-gap",
        prompt: "Sayı sıfırdan küçükse koşul parantezindeki boşluğu doldurun.",
        codeSnippet: "if (sayi ___ 0)",
        correctAnswer: "<"
      }
    ]
  },
  {
    id: "cs_4",
    title: "4. Döngü Çeşitleri",
    description: "C#'ta kod satılarını for ve while döngüleri ile optimize edin.",
    requiredXp: 45,
    status: "locked",
    questions: [
      {
        id: "cs_q7",
        type: "multiple-choice",
        prompt: "Döngüyü koşul aranmaksızın anında kırmak ve döngüden çıkmak için hangi kelime kullanılır?",
        options: ["stop", "break", "continue", "exit"],
        correctAnswer: "break"
      },
      {
        id: "cs_q8",
        type: "fill-gap",
        prompt: "Döngüyü her adımda 1 birim artırmak için for bloğundaki boşluğu tamamlayın.",
        codeSnippet: "for (int i = 0; i < 5; ___)",
        correctAnswer: "i++"
      }
    ]
  },
  {
    id: "cs_5",
    title: "5. Metot Yapısı ve void",
    description: "Geriye değer döndürmeyen veya döndüren parametrik program fonksiyonları yazın.",
    requiredXp: 60,
    status: "locked",
    questions: [
      {
        id: "cs_q9",
        type: "multiple-choice",
        prompt: "Geriye bir veri iletmeyen (döndürmeyen) metotların başına hangi anahtar kelime yazılır?",
        options: ["void", "null", "empty", "static"],
        correctAnswer: "void"
      },
      {
        id: "cs_q10",
        type: "fill-gap",
        prompt: "Bir metottan değer döndürmek amacıyla kullanılan C# anahtar kelimesini girin.",
        codeSnippet: "___ toplam;",
        correctAnswer: "return"
      }
    ]
  },
  {
    id: "cs_6",
    title: "6. C# Dizileri (Arrays)",
    description: "Sabit boyutlu veri dizilimleri oluşturup indeks kullanarak elemanlara erişin.",
    requiredXp: 75,
    status: "locked",
    questions: [
      {
        id: "cs_q11",
        type: "multiple-choice",
        prompt: "C#'ta dizilerin ilk elemanının indeks numarası kaçtır?",
        options: ["1", "0", "-1", "dizinin boyutu"],
        correctAnswer: "0"
      },
      {
        id: "cs_q12",
        type: "fill-gap",
        prompt: "Integer dizisi tanımlarken köşeli parantezi yerleştirin.",
        codeSnippet: "int___ sayilar = new int[5];",
        correctAnswer: "[]"
      }
    ]
  },
  {
    id: "cs_7",
    title: "7. Listeler (List Koleksiyonu)",
    description: "Dinamik boyutlu, eleman eklenip çıkarılabilen gelişmiş koleksiyon yapıları.",
    requiredXp: 90,
    status: "locked",
    questions: [
      {
        id: "cs_q13",
        type: "multiple-choice",
        prompt: "C#'ta generic List listesine yeni eleman eklemek için hangi metot çağrılır?",
        options: ["Add()", "Push()", "Insert()", "Append()"],
        correctAnswer: "Add()"
      },
      {
        id: "cs_q14",
        type: "fill-gap",
        prompt: "String tipinde liste tanımlamak için generic parantezi doldurun (List<___>).",
        codeSnippet: "List<___> isimler = new List<___>();",
        correctAnswer: "string"
      }
    ]
  },
  {
    id: "cs_8",
    title: "8. Metot Aşırı Yükleme",
    description: "Aynı isimde fakat farklı parametre sayıları barındıran metot imzalarını (Overloading) kavrayın.",
    requiredXp: 105,
    status: "locked",
    questions: [
      {
        id: "cs_q15",
        type: "multiple-choice",
        prompt: "Aynı isimli metotların parametre listelerinin farklı olmasına ne ad verilir?",
        options: ["Overriding", "Overloading", "Inheritance", "Encapsulation"],
        correctAnswer: "Overloading"
      },
      {
        id: "cs_q16",
        type: "fill-gap",
        prompt: "Metot aşırı yükleme işleminde derleyici ayrımı parametrelerin ___ yapısına bakarak belirler.",
        codeSnippet: "parametre ___",
        correctAnswer: "tipi"
      }
    ]
  },
  {
    id: "cs_9",
    title: "9. try-catch İstisnaları",
    description: "Programın Runtime hatalarından etkilenmeden sağlıklı çalışmayı sürdürmesi için hata yönetimi.",
    requiredXp: 120,
    status: "locked",
    questions: [
      {
        id: "cs_q17",
        type: "multiple-choice",
        prompt: "C#'ta hata yakalama kod bloğu sırasıyla hangi anahtar kelimelerden oluşur?",
        options: ["try-except", "try-catch", "throw-error", "check-catch"],
        correctAnswer: "try-catch"
      },
      {
        id: "cs_q18",
        type: "fill-gap",
        prompt: "Manuel olarak bilerek bir hata fırlatmak (istisna) için hangi kelime kullanılır?",
        codeSnippet: "___ new Exception(\"Hata\");",
        correctAnswer: "throw"
      }
    ]
  },
  {
    id: "cs_10",
    title: "10. Sınıflar ve Nesne Yapıcıları",
    description: "C#'ta Nesne Yönelimli Programlama (OOP). Kurucu metotlar (Constructor) tasarlayın.",
    requiredXp: 135,
    status: "locked",
    questions: [
      {
        id: "cs_q19",
        type: "multiple-choice",
        prompt: "C#'ta bir kurucu metodun adı ne olmak zorundadır?",
        options: ["Construct", "New", "Sınıfın ismi ile aynı", "Main"],
        correctAnswer: "Sınıfın ismi ile aynı"
      },
      {
        id: "cs_q20",
        type: "free-code",
        prompt: "Ekrana 'Nesne Olustu' yazdıran basit bir C# sınıf çağrısı tamamlayın.",
        codeSnippet: "using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine(\"Nesne Olustu\");\n    }\n}",
        expectedOutcome: "Nesne Olustu"
      }
    ]
  }
];

// JAVA TRACK: 10 Levels
export const javaLessons: LessonUnit[] = [
  {
    id: "jv_1",
    title: "1. Sınıflar ve println",
    description: "Java dünyası ile tanışın. System.out yardımıyla terminale veri basımını inceleyin.",
    requiredXp: 0,
    status: "available",
    questions: [
      {
        id: "jv_q1",
        type: "multiple-choice",
        prompt: "Java'da her uygulama mutlaka bir ___ bloğunun içerisinde yer almak zorundadır.",
        options: ["class", "method", "package", "pointer"],
        correctAnswer: "class"
      },
      {
        id: "jv_q2",
        type: "fill-gap",
        prompt: "Java'da ekrana bir satır metin yazdırmak için boşluğu tamamlayın.",
        codeSnippet: "System.out.___(\"Java Öğreniyorum\");",
        correctAnswer: "println"
      }
    ]
  },
  {
    id: "jv_2",
    title: "2. Primitif Tipler",
    description: "Java dilindeki tam sayı ve karakter veri türlerini (int, char, double) kavrayın.",
    requiredXp: 15,
    status: "locked",
    questions: [
      {
        id: "jv_q3",
        type: "multiple-choice",
        prompt: "Java'da metin verileri tutmak için hangi sınıf nesnesi kullanılır?",
        options: ["string", "String", "Character", "txt"],
        correctAnswer: "String"
      },
      {
        id: "jv_q4",
        type: "fill-gap",
        prompt: "Değişkeni sabit kılmak için kullanılan kelimeyi giriniz.",
        codeSnippet: "___ int SABIT = 10;",
        correctAnswer: "final"
      }
    ]
  },
  {
    id: "jv_3",
    title: "3. Mantıksal Koşullar",
    description: "Java dilinde karar kontrol mekanizmalarını if ve else kullanarak yönetme.",
    requiredXp: 30,
    status: "locked",
    questions: [
      {
        id: "jv_q5",
        type: "multiple-choice",
        prompt: "Java'da iki String metninin eşitliğini kıyaslamak için hangisi kullanılmalıdır?",
        options: ["==", "equals()", "compare()", "equivalent()"],
        correctAnswer: "equals()"
      },
      {
        id: "jv_q6",
        type: "fill-gap",
        prompt: "VEYA mantıksal operatör simgesini boş yere doldurun.",
        codeSnippet: "if (yas > 18 ___ ehliyet == true)",
        correctAnswer: "||"
      }
    ]
  },
  {
    id: "jv_4",
    title: "4. Döngü Yapıları",
    description: "while ve gelişmiş for döngüleri ile kod yürütme pratikleri yapın.",
    requiredXp: 45,
    status: "locked",
    questions: [
      {
        id: "jv_q7",
        type: "multiple-choice",
        prompt: "Java'da diziler üzerinde dönmek için kullanılan modern döngü gösterimi hangisidir?",
        options: ["for (int x : dizi)", "foreach (int x in dizi)", "loop (dizi)", "for (int x; dizi)"],
        correctAnswer: "for (int x : dizi)"
      },
      {
        id: "jv_q8",
        type: "fill-gap",
        prompt: "Koşul başlatan while ifadesinin parantezini tamamlayın.",
        codeSnippet: "while ___ deger == true)",
        correctAnswer: "("
      }
    ]
  },
  {
    id: "jv_5",
    title: "5. Metotlar ve Girdi Alma",
    description: "Java programında Scanner yardımıyla terminalden veri almayı öğrenin.",
    requiredXp: 60,
    status: "locked",
    questions: [
      {
        id: "jv_q9",
        type: "multiple-choice",
        prompt: "Java'da konsoldan girdi (kelime, sayı vb.) okumak için hangi standart sınıf kullanılır?",
        options: ["Scanner", "Reader", "Console", "Input"],
        correctAnswer: "Scanner"
      },
      {
        id: "jv_q10",
        type: "fill-gap",
        prompt: "Scanner nesnesini oluştururken parametre olarak System.___ kullanılır. Boşluğu doldurun.",
        codeSnippet: "Scanner scan = new Scanner(System.___);",
        correctAnswer: "in"
      }
    ]
  },
  {
    id: "jv_6",
    title: "6. Nesne ve Referanslar",
    description: "Java'nın tamamen Nesne Yönelimli dünyasında referans tipleri ve bellek yönetimi.",
    requiredXp: 75,
    status: "locked",
    questions: [
      {
        id: "jv_q11",
        type: "multiple-choice",
        prompt: "Java'da yeni bir nesne türetmek için hangi anahtar kelimeye muhtacız?",
        options: ["new", "create", "alloc", "make"],
        correctAnswer: "new"
      },
      {
        id: "jv_q12",
        type: "fill-gap",
        prompt: "Bellekten referansın kopartıldığını, yani boşa çıktığını simgeleyen kelimeyi girin.",
        codeSnippet: "Ogrenci o = ___;",
        correctAnswer: "null"
      }
    ]
  },
  {
    id: "jv_7",
    title: "7. ArrayList Sınıfı",
    description: "Java'da sınırları dinamik olan ve genişleyip küçülen ArrayList koleksiyon yapısı.",
    requiredXp: 90,
    status: "locked",
    questions: [
      {
        id: "jv_q13",
        type: "multiple-choice",
        prompt: "ArrayList boyutunu öğrenmek için hangi fonksiyonu çağırmalıyız?",
        options: ["length()", "size()", "count()", "dimension()"],
        correctAnswer: "size()"
      },
      {
        id: "jv_q14",
        type: "fill-gap",
        prompt: "ArrayList'e yeni eleman eklemek için kullanılan fonksiyonu yazın.",
        codeSnippet: "liste.___(\"Yeni\");",
        correctAnswer: "add"
      }
    ]
  },
  {
    id: "jv_8",
    title: "8. Kapsülleme (Encapsulation)",
    description: "Private üyeler ve getter/setter metotları ile sınıfların güvenliğini saklama teorisi.",
    requiredXp: 105,
    status: "locked",
    questions: [
      {
        id: "jv_q15",
        type: "multiple-choice",
        prompt: "Üyelerin sadece tanımlandığı sınıf içerisinden erişilebilir olmasını sağlayan erişim belirleyici hangisidir?",
        options: ["public", "protected", "private", "default"],
        correctAnswer: "private"
      },
      {
        id: "jv_q16",
        type: "fill-gap",
        prompt: "Özel bir niteliğin değerini okumak için genellikle '___' kelimesi ile başlayan metotlar kullanılır.",
        codeSnippet: "public string ___Ad() { return ad; }",
        correctAnswer: "get"
      }
    ]
  },
  {
    id: "jv_9",
    title: "9. try-catch İstisna Yapısı",
    description: "Java programlarında olası çalışma zamanı çökmelerini yakalama ve yönetme mekanizması.",
    requiredXp: 120,
    status: "locked",
    questions: [
      {
        id: "jv_q17",
        type: "multiple-choice",
        prompt: "Java'da yakalanması zorunlu olan ve derleme anında kontrol edilen hatalara ne denir?",
        options: ["Checked Exceptions", "Unchecked Exceptions", "Errors", "Runtime Warnings"],
        correctAnswer: "Checked Exceptions"
      },
      {
        id: "jv_q18",
        type: "fill-gap",
        prompt: "Bir hata fırlatıldığında catch parantezinde yakalanacak genel ata sınıfı tamamlayın.",
        codeSnippet: "catch (___ e) { }",
        correctAnswer: "Exception"
      }
    ]
  },
  {
    id: "jv_10",
    title: "10. Sınıf Kalıtımı (Inheritance)",
    description: "extends anahtar sözcüğü ile ana sınıflardan yeni çocuk sınıflar türetme ilkeleri.",
    requiredXp: 135,
    status: "locked",
    questions: [
      {
        id: "jv_q19",
        type: "multiple-choice",
        prompt: "Java'da bir sınıfın başka bir sınıftan miras (kalıtım) almasını sağlayan anahtar kelime hangisidir?",
        options: ["implements", "extends", "inherits", "super"],
        correctAnswer: "extends"
      },
      {
        id: "jv_q20",
        type: "free-code",
        prompt: "Ekrana 'Miras Alindi' yazdıran bir deneme Java çıktısı oluşturun.",
        codeSnippet: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Miras Alindi\");\n    }\n}",
        expectedOutcome: "Miras Alindi"
      }
    ]
  }
];

function expandTo15Questions(levels: LessonUnit[], langLabel: string): LessonUnit[] {
  return levels.map(level => {
    const expandedQuestions = [...level.questions];
    let counter = expandedQuestions.length;
    while (expandedQuestions.length < 15) {
      counter++;
      const isMultipleChoice = counter % 2 !== 0;
      expandedQuestions.push(
        isMultipleChoice
          ? {
              id: `${level.id}_ex_${counter}`,
              type: "multiple-choice",
              prompt: `[Pratik ${counter}] ${langLabel} dünyasında "${level.title}" kurallarını pekiştirin. Aşağıdakilerden hangisi geçerlidir?`,
              options: ["Doğru Pratik", "Syntax Hatası", "Hatalı 1", "Hatalı 2"],
              correctAnswer: "Doğru Pratik"
            }
          : {
              id: `${level.id}_ex_${counter}`,
              type: "fill-gap",
              prompt: `[Pratik ${counter}] İşlemi tamamlamak için boşluğa 'Dogru' anahtar kelimesini yerleştirin.`,
              codeSnippet: "___ -> Sistem doğru çalışır.",
              correctAnswer: "Dogru"
            }
      );
    }
    return { ...level, questions: expandedQuestions };
  });
}

export const pythonLessonsExpanded = expandTo15Questions(pythonLessons, "Python");
export const csharpLessonsExpanded = expandTo15Questions(csharpLessons, "C#");
export const javaLessonsExpanded = expandTo15Questions(javaLessons, "Java");

