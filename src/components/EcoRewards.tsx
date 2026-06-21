import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Lock, Sparkles, CheckCircle2, Flame, Zap, Shield, TreePine, Sun, Waves } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  carbonSaved: number;
  creditsReward: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "eco_explorer", title: "Eco Explorer", description: "Run your first carbon simulation",
    icon: <Sparkles className="w-5 h-5" />, rarity: "Common", progress: 1, maxProgress: 1,
    isUnlocked: true, carbonSaved: 5, creditsReward: 10,
  },
  {
    id: "green_commuter", title: "Green Commuter", description: "Choose eco-friendly transport 10 times",
    icon: <TreePine className="w-5 h-5" />, rarity: "Rare", progress: 7, maxProgress: 10,
    isUnlocked: false, carbonSaved: 120, creditsReward: 50,
  },
  {
    id: "solar_champion", title: "Solar Champion", description: "Simulate solar panel installation",
    icon: <Sun className="w-5 h-5" />, rarity: "Epic", progress: 1, maxProgress: 1,
    isUnlocked: true, carbonSaved: 1500, creditsReward: 100,
  },
  {
    id: "carbon_guardian", title: "Carbon Guardian", description: "Save over 500 kg CO2 total",
    icon: <Shield className="w-5 h-5" />, rarity: "Epic", progress: 320, maxProgress: 500,
    isUnlocked: false, carbonSaved: 320, creditsReward: 200,
  },
  {
    id: "climate_architect", title: "Climate Architect", description: "Complete 50 simulations and achieve a carbon score of 95+",
    icon: <Flame className="w-5 h-5" />, rarity: "Legendary", progress: 12, maxProgress: 50,
    isUnlocked: false, carbonSaved: 0, creditsReward: 500,
  },
  {
    id: "ocean_protector", title: "Ocean Protector", description: "Reduce food delivery emissions by 80%",
    icon: <Waves className="w-5 h-5" />, rarity: "Rare", progress: 3, maxProgress: 5,
    isUnlocked: false, carbonSaved: 28, creditsReward: 75,
  },
];

const RARITY_COLORS: Record<string, { gradient: string; border: string; text: string }> = {
  Common: { gradient: "from-gray-400 to-gray-600", border: "border-gray-500/30", text: "text-gray-400" },
  Rare: { gradient: "from-blue-400 to-cyan-500", border: "border-blue-500/30", text: "text-blue-400" },
  Epic: { gradient: "from-purple-400 to-pink-500", border: "border-purple-500/30", text: "text-purple-400" },
  Legendary: { gradient: "from-amber-400 via-orange-500 to-red-500", border: "border-amber-500/30", text: "text-amber-400" },
};

export const EcoRewards: React.FC = () => {
  const { isConnected, carbonCredits } = useWallet();
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [mintedIds, setMintedIds] = useState<Set<string>>(new Set());

  const totalCarbonSaved = ACHIEVEMENTS.reduce((sum, a) => sum + (a.isUnlocked ? a.carbonSaved : 0), 0);
  const totalCredits = ACHIEVEMENTS.reduce((sum, a) => sum + (a.isUnlocked ? a.creditsReward : 0), 0);
  const unlockedCount = ACHIEVEMENTS.filter(a => a.isUnlocked).length;

  const handleMint = async (id: string) => {
    setMintingId(id);
    await new Promise(r => setTimeout(r, 2000));
    setMintedIds(prev => new Set([...prev, id]));
    setMintingId(null);
  };

  return (
    <div className="flex flex-col gap-6 font-sans select-none text-left animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Eco Rewards Dashboard</h2>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Earn sustainability achievements and mint them as blockchain-verified NFT badges.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border-l-2" style={{ borderLeftColor: "var(--accent)" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Carbon Credits</div>
          <div className="text-2xl font-bold mt-1" style={{ color: "var(--accent)" }}>{carbonCredits + totalCredits}</div>
          <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Total earned</div>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-2" style={{ borderLeftColor: "var(--accent-secondary)" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>CO2 Saved</div>
          <div className="text-2xl font-bold mt-1" style={{ color: "var(--accent-secondary)" }}>{totalCarbonSaved} kg</div>
          <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Lifetime impact</div>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-2" style={{ borderLeftColor: "var(--accent-tertiary)" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Badges Earned</div>
          <div className="text-2xl font-bold mt-1" style={{ color: "var(--accent-tertiary)" }}>{unlockedCount}/{ACHIEVEMENTS.length}</div>
          <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>Achievements</div>
        </div>
        <div className="glass-card rounded-xl p-4 border-l-2" style={{ borderLeftColor: isConnected ? "var(--accent)" : "var(--text-dim)" }}>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>Blockchain</div>
          <div className="text-2xl font-bold mt-1" style={{ color: isConnected ? "var(--accent)" : "var(--text-dim)" }}>
            {isConnected ? "Active" : "Offline"}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {isConnected ? "Polygon Amoy Testnet" : "Connect wallet to mint"}
          </div>
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest pb-2 border-b mb-4"
          style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
          NFT Achievement Badges
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const rarityStyle = RARITY_COLORS[achievement.rarity];
            const isMinted = mintedIds.has(achievement.id);
            const isMinting = mintingId === achievement.id;
            const progressPct = Math.min(100, (achievement.progress / achievement.maxProgress) * 100);

            return (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: achievement.isUnlocked ? 1.02 : 1 }}
                className={`relative rounded-2xl overflow-hidden ${!achievement.isUnlocked ? "opacity-60" : ""}`}
              >
                {/* NFT Holographic border */}
                {achievement.isUnlocked && (
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${rarityStyle.gradient} p-[1px]`}>
                    <div className="absolute inset-0 rounded-2xl nft-badge opacity-30" />
                  </div>
                )}

                <div className="relative rounded-2xl p-5 flex flex-col gap-3"
                  style={{ background: "var(--bg-secondary)", border: achievement.isUnlocked ? "none" : "1px solid var(--border)" }}>
                  {/* Badge header */}
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${rarityStyle.gradient}`}>
                      <div className="text-white">{achievement.icon}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[8px] uppercase tracking-widest font-bold ${rarityStyle.text}`}>
                        {achievement.rarity}
                      </span>
                      {achievement.isUnlocked ? (
                        <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
                      ) : (
                        <Lock className="w-4 h-4" style={{ color: "var(--text-dim)" }} />
                      )}
                    </div>
                  </div>

                  {/* Title + Description */}
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{achievement.title}</h4>
                    <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{achievement.description}</p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[9px] mb-1">
                      <span style={{ color: "var(--text-dim)" }}>Progress</span>
                      <span style={{ color: "var(--text-muted)" }}>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${rarityStyle.gradient}`}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex justify-between text-[9px]">
                    <span style={{ color: "var(--text-dim)" }}>
                      <Zap className="w-3 h-3 inline mr-0.5" />{achievement.creditsReward} credits
                    </span>
                    <span style={{ color: "var(--text-dim)" }}>
                      {achievement.carbonSaved > 0 ? `${achievement.carbonSaved} kg CO2` : "—"}
                    </span>
                  </div>

                  {/* Mint Button */}
                  {achievement.isUnlocked && (
                    <button
                      onClick={() => handleMint(achievement.id)}
                      disabled={isMinted || isMinting || !isConnected}
                      className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${
                        isMinted
                          ? "cursor-default"
                          : "cursor-pointer"
                      }`}
                      style={{
                        background: isMinted ? "var(--accent-glow)" : isMinting ? "var(--surface)" : "var(--accent)",
                        color: isMinted ? "var(--accent)" : isMinting ? "var(--text-muted)" : "var(--bg-primary)",
                        border: `1px solid ${isMinted ? "var(--accent)" : "transparent"}`,
                        opacity: !isConnected && !isMinted ? 0.5 : 1,
                      }}
                    >
                      {isMinted ? (
                        <><CheckCircle2 className="w-3 h-3 inline mr-1" />Minted on Blockchain</>
                      ) : isMinting ? (
                        <><Award className="w-3 h-3 inline mr-1 animate-spin" />Minting...</>
                      ) : !isConnected ? (
                        "Connect Wallet to Mint"
                      ) : (
                        <><Award className="w-3 h-3 inline mr-1" />Mint to Blockchain</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EcoRewards;
