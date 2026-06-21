import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLETS = [
  {
    id: "metamask" as const,
    name: "MetaMask",
    description: "Connect using browser extension",
    icon: "🦊",
    color: "from-orange-500/20 to-orange-600/5",
    borderColor: "border-orange-500/20 hover:border-orange-500/40",
  },
  {
    id: "walletconnect" as const,
    name: "WalletConnect",
    description: "Scan QR code with mobile wallet",
    icon: "🔗",
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/20 hover:border-blue-500/40",
  },
  {
    id: "coinbase" as const,
    name: "Coinbase Wallet",
    description: "Connect with Coinbase Wallet app",
    icon: "🪙",
    color: "from-blue-400/20 to-indigo-500/5",
    borderColor: "border-blue-400/20 hover:border-blue-400/40",
  },
];

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { connect, isConnecting, isConnected, address, provider, disconnect } = useWallet();

  const handleConnect = async (providerId: "metamask" | "walletconnect" | "coinbase") => {
    await connect(providerId);
  };

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-2xl border overflow-hidden"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-glow)" }}>
                  <Wallet className="w-5 h-5" style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {isConnected ? "Wallet Connected" : "Connect Wallet"}
                  </h3>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {isConnected ? "Blockchain identity verified" : "Web3 Identity Layer • Polygon Amoy"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "var(--text-muted)" }}
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {isConnected ? (
                /* Connected State */
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--accent-glow-strong)" }}>
                      <CheckCircle2 className="w-5 h-5" style={{ color: "var(--accent)" }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                        {provider}
                      </div>
                      <div className="text-[10px] font-mono flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        {truncateAddress(address!)}
                        <ExternalLink className="w-3 h-3 cursor-pointer" style={{ color: "var(--accent)" }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "var(--text-dim)" }}>Carbon Credits</div>
                      <div className="text-sm font-bold" style={{ color: "var(--accent)" }}>250 CC</div>
                    </div>
                  </div>

                  {/* Identity Hash */}
                  <div className="p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: "var(--text-dim)" }}>
                      Blockchain Identity Hash
                    </div>
                    <div className="text-[10px] font-mono break-all" style={{ color: "var(--text-muted)" }}>
                      0x7a8f3e2d1c9b0456...blockchain_identity
                    </div>
                  </div>

                  {/* Green Identity Badge */}
                  <div className="nft-badge rounded-xl p-[1px]">
                    <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: "var(--bg-secondary)" }}>
                      <span className="text-lg">🌿</span>
                      <div>
                        <div className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Verified Green Identity</div>
                        <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>On-chain sustainability profile active</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={disconnect}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
                    style={{ background: "var(--surface)", border: "1px solid var(--danger)", color: "var(--danger)" }}
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                /* Connect State */
                <div className="flex flex-col gap-3">
                  {WALLETS.map((wallet) => (
                    <motion.button
                      key={wallet.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={isConnecting}
                      onClick={() => handleConnect(wallet.id)}
                      className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${wallet.borderColor}`}
                      style={{ background: "var(--surface)" }}
                    >
                      <span className="text-2xl">{wallet.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{wallet.name}</div>
                        <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{wallet.description}</div>
                      </div>
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--accent)" }} />
                      ) : (
                        <ExternalLink className="w-4 h-4" style={{ color: "var(--text-dim)" }} />
                      )}
                    </motion.button>
                  ))}

                  <div className="text-center text-[10px] mt-2" style={{ color: "var(--text-dim)" }}>
                    By connecting, you agree to store your sustainability data on-chain
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WalletConnectModal;
