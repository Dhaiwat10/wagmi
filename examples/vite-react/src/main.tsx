import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { providers } from 'ethers'

import { Provider, chain, createClient, defaultChains } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'

import { App } from './App'

const alchemyId = import.meta.env.VITE_ALCHEMY_ID as string
const chains = defaultChains
const defaultChain = chain.mainnet

const isChainSupported = (chainId?: number) =>
  chains.some((x) => x.id === chainId)

const client = createClient({
  autoConnect: true,
  connectors({ chainId }) {
    const chain = chains.find((x) => x.id === chainId) ?? defaultChain
    const rpcUrl = chain.rpcUrls.alchemy
      ? `${chain.rpcUrls.alchemy}/${alchemyId}`
      : chain.rpcUrls.default
    return [
      new InjectedConnector({ chains }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: 'wagmi',
          chainId: chain.id,
          jsonRpcUrl: rpcUrl,
        },
      }),
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: true,
          rpc: {
            [chain.id]: rpcUrl,
          },
        },
      }),
    ]
  },
  provider({ chainId }) {
    return new providers.AlchemyProvider(
      isChainSupported(chainId) ? chainId : defaultChain.id,
      alchemyId,
    )
  },
  webSocketProvider({ chainId }) {
    return new providers.AlchemyWebSocketProvider(
      isChainSupported(chainId) ? chainId : defaultChain.id,
      alchemyId,
    )
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider client={client}>
      <App />
    </Provider>
  </React.StrictMode>,
)
