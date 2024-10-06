import React, { useState, useEffect } from 'react';
import { Connection, Transaction } from '@solana/web3.js';
import { WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

import '@solana/wallet-adapter-react-ui/styles.css';

// Define props interface to include 'children'
interface WalletContextProviderProps {
  children: React.ReactNode; // children can be any valid React node
}

// Solana devnet RPC endpoint
const SOLANA_RPC_ENDPOINT = 'https://api.devnet.solana.com';

const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
    const wallets = [new PhantomWalletAdapter()];
    return (
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                {children}
            </WalletModalProvider>
        </WalletProvider>
    );
};

const App: React.FC = () => {
    const { publicKey, signTransaction, sendTransaction, connected } = useWallet();
    const [solAmount, setSolAmount] = useState<string>('');
    const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

    // Effect to log wallet connection status
    useEffect(() => {
        if (connected) {
            console.log("Wallet connected: ", publicKey?.toBase58());
        } else {
            console.log("Wallet is not connected");
        }
    }, [connected, publicKey]);

    const swapAndProvideLiquidity = async () => {
        if (!connected || !publicKey || !signTransaction) {
            alert('Please connect your wallet');
            return;
        }

        try {
            const halfSolAmount = parseFloat(solAmount) / 2;

            // Step 1: Swap half SOL to USDC (this needs to be handled by Raydium's Swap SDK)
            const usdcAmount = await swapSOLToUSDC(halfSolAmount);

            // Step 2: Add liquidity manually using Solana Token Program and SPL Liquidity pools
            const transaction = await createAddLiquidityTransaction(halfSolAmount, usdcAmount);

            const txSignature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(txSignature, 'confirmed');

            alert('Liquidity added! LP tokens sent to your wallet.');
        } catch (error) {
            console.error('Error adding liquidity:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="App">
            <h1>SOL to SOL/USDC LP Swapper</h1>
            <WalletMultiButton />
            {connected ? (
                <div>
                    <input
                        type="number"
                        placeholder="Enter SOL amount"
                        value={solAmount}
                        onChange={(e) => setSolAmount(e.target.value)}
                    />
                    <button onClick={swapAndProvideLiquidity}>
                        Swap & Add Liquidity
                    </button>
                </div>
            ) : (
                <p>Please connect your wallet to proceed.</p>
            )}
        </div>
    );
};

// Placeholder function for swapping SOL to USDC using Raydium's Swap SDK
async function swapSOLToUSDC(solAmount: number): Promise<number> {
    console.log(`Swapping ${solAmount} SOL to USDC`);
    return solAmount * 30;  // Dummy conversion rate for testing purposes
}

// Manually create transaction to add liquidity using Solana Token Program
async function createAddLiquidityTransaction(solAmount: number, usdcAmount: number) {
    const transaction = new Transaction();
    // Create instructions for adding liquidity here

    
    return transaction;
}

const AppWithWalletProvider: React.FC = () => (
    <WalletContextProvider>
        <App />
    </WalletContextProvider>
);

export default AppWithWalletProvider;