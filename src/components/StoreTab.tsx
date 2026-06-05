import React from "react";
import { UserStats } from "../types";
import { Store, Zap, Heart, Sparkles, Crown } from "lucide-react";

interface StoreTabProps {
  stats: UserStats;
  onBuyItem: (itemType: string, price: number, payload?: any) => void;
}

export default function StoreTab({ stats, onBuyItem }: StoreTabProps) {
  const isLight = stats.theme === "light";

  const storeItems = [
    {
      id: "energy_refill",
      type: "energy",
      name: "Elit Kahve (100% Enerji)",
      desc: "Yapay zeka asistanıyla konuşmak için enerjini tam doldurur.",
      price: 50,
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      color: "amber",
      available: stats.energy! < 100 && !stats.isVip
    },
    {
      id: "heart_refill",
      type: "hearts",
      name: "Tam Sağlık",
      desc: "Dersleri tamamlarken kullanabileceğin 5 sağlığı (can) tamamen doldurur.",
      price: 30,
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      color: "rose",
      available: stats.hearts < 5
    },
    {
      id: "title_legend",
      type: "title",
      name: "Efsanevi Geliştirici",
      desc: "Profilindeki rütbe unvanını kalıcı olarak 'Efsanevi Geliştirici' yapar.",
      price: 250,
      payload: "Efsanevi Geliştirici",
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      color: "purple",
      available: stats.title !== "Efsanevi Geliştirici"
    },
    {
      id: "vip_status",
      type: "vip",
      name: "VIP Premium",
      desc: "Sınırsız enerji. AI asistanına reklamsız ve limitsiz soru sağla.",
      price: 100,
      icon: <Crown className="w-8 h-8 text-amber-500" />,
      color: "amber",
      available: !stats.isVip
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 text-inherit px-4">
      <div className="flex flex-col items-center justify-center text-center space-y-4 mb-10">
        <div className={`p-4 rounded-full border shadow-xl ${isLight ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"}`}>
          <Store className={`w-10 h-10 ${isLight ? "text-cyan-600" : "text-cyan-400"}`} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">MÜCEVHER MAĞAZASI</h2>
        <p className={`text-xs font-bold max-w-lg ${isLight ? "text-slate-600" : "text-slate-400"}`}>
          Zorlu serüvenlerde kazandığın mücevherleri (💎) burada yetenekler, sağlık şurupları ve elit unvanlar için harcayabilirsin.
        </p>
        <div className={`px-4 py-2 mt-2 rounded-xl text-lg font-black font-mono border inline-flex items-center gap-2 ${
          isLight ? "bg-cyan-50 border-cyan-200 text-cyan-600" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
        }`}>
          <span>BAKİYENİZ:</span>
          <span>💎 {stats.gems}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {storeItems.map(item => (
          <div key={item.id} className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
            isLight ? "bg-white border-slate-200 shadow-md" : "bg-slate-900/50 border-slate-800 shadow-xl"
          }`}>
            <div>
              <div className="flex gap-4 items-start mb-4">
                <div className={`p-3 rounded-2xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-[15px] font-black uppercase tracking-tight">{item.name}</h3>
                  <p className={`text-[11px] font-bold mt-1.5 leading-relaxed ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800/10 dark:border-slate-800">
              {item.available ? (
                <button
                  onClick={() => onBuyItem(item.type, item.price, item.payload)}
                  disabled={stats.gems < item.price}
                  className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                    stats.gems >= item.price
                      ? (isLight 
                          ? "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/10" 
                          : "bg-white text-slate-950 hover:bg-slate-200 shadow-xl shadow-white/10")
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  SATIN AL • {item.price} 💎
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 px-4 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-800 cursor-not-allowed"
                >
                  ŞU AN KULLANILAMAZ
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
