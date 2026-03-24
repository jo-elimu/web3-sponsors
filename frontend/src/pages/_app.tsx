import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, coinbaseWallet } from "@rainbow-me/rainbowkit/wallets";

// Rainbowkit 🌈
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [coinbaseWallet, metaMaskWallet]
    }
  ],
  {
    appName: "Sponsors 🫶🏽",
    projectId: "YOUR_PROJECT_ID",
  }
);

// wagmi
const queryClient = new QueryClient();
export const wagmiConfig = createConfig({
  connectors: connectors,
  chains: [
    mainnet
  ],
  transports: {
    [mainnet.id]: http('https://ethereum-rpc.publicnode.com')
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={mainnet} theme={darkTheme({...darkTheme.accentColors.purple})}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
