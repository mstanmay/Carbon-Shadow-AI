import React, { createContext, useContext, useState, useCallback } from "react";

interface WalletContextValue {
  address: string | null;
  provider: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  carbonCredits: number;
  identityHash: string | null;
  connect: (providerType: "metamask" | "walletconnect" | "coinbase") => Promise<void>;
  disconnect: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const STORAGE_KEY = "carbon-shadow-wallet";

// Generate a mock identity hash
function generateIdentityHash(address: string): string {
  let hash = 0;
  const str = address + Date.now().toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "0x" + Math.abs(hash).toString(16).padStart(64, "0").slice(0, 64);
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.address || null;
      }
    } catch {}
    return null;
  });
  const [provider, setProvider] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        return data.provider || null;
      }
    } catch {}
    return null;
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [carbonCredits, setCarbonCredits] = useState(250);
  const [identityHash, setIdentityHash] = useState<string | null>(null);

  const connect = useCallback(async (providerType: "metamask" | "walletconnect" | "coinbase") => {
    setIsConnecting(true);

    try {
      // Try real MetaMask connection
      if (providerType === "metamask" && typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const { BrowserProvider } = await import("ethers");
          const ethProvider = new BrowserProvider((window as any).ethereum);
          const accounts = await ethProvider.send("eth_requestAccounts", []);
          if (accounts && accounts.length > 0) {
            const addr = accounts[0];
            const hash = generateIdentityHash(addr);
            setAddress(addr);
            setProvider("MetaMask");
            setIdentityHash(hash);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ address: addr, provider: "MetaMask" }));
            setIsConnecting(false);
            return;
          }
        } catch (err) {
          console.warn("MetaMask connection failed, falling back to demo mode:", err);
        }
      }

      // Mock connection for demo / when wallet not available
      await new Promise(r => setTimeout(r, 1500));
      const mockAddresses: Record<string, string> = {
        metamask: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
        walletconnect: "0x8ba1f109551bD432803012645Hac136E9AC4B6c3",
        coinbase: "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
      };
      const mockAddr = mockAddresses[providerType];
      const providerNames: Record<string, string> = {
        metamask: "MetaMask",
        walletconnect: "WalletConnect",
        coinbase: "Coinbase Wallet",
      };
      const hash = generateIdentityHash(mockAddr);
      setAddress(mockAddr);
      setProvider(providerNames[providerType]);
      setIdentityHash(hash);
      setCarbonCredits(250);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        address: mockAddr,
        provider: providerNames[providerType]
      }));
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    setIdentityHash(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!address) return null;

    // Try real signing with MetaMask
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const { BrowserProvider } = await import("ethers");
        const ethProvider = new BrowserProvider((window as any).ethereum);
        const signer = await ethProvider.getSigner();
        const signature = await signer.signMessage(message);
        return signature;
      } catch (err) {
        console.warn("Signing failed:", err);
      }
    }

    // Mock signature
    return "0x" + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  }, [address]);

  return (
    <WalletContext.Provider value={{
      address,
      provider,
      isConnected: !!address,
      isConnecting,
      carbonCredits,
      identityHash,
      connect,
      disconnect,
      signMessage,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextValue => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
};
