import { motion, AnimatePresence } from "framer-motion";
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { useRouter } from 'next/router';
import LoadingSpinner from "@/components/Spinner";
import SwapBox from "@/components/SwapBox";
import { ethers } from "ethers"
import lf from "localforage"
import SDK from "weavedb-sdk" 
import { isNil } from "ramda"

const inter = Inter({ subsets: ['latin'] });

const contractTxId = "Ng20dHZFTnbgIiwCfFJ1wO8K2x23FiUVuobnQVcMsi0"

export default function Home() {
  const [hasProvider, setHasProvider] = useState(null);
  const initialState = { accounts: [] };
  const [wallet, setWallet] = useState(initialState);
  const router = useRouter();
  const [isSwapped, setSwapped] = useState(false);
  const [user, setUser] = useState(null)
  const [db, setDb] = useState(null)

  useEffect(() => {
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      setHasProvider(provider); // transform provider to true or false
    }

    getProvider();
  }, []);

  const updateWallet = async (accounts) => {
    setWallet({ accounts });
  }

  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    updateWallet(accounts);
  }

  const handleSwap = () => {
    setSwapped(!isSwapped);
    // Add a delay to give time for the animation before redirecting
    // setTimeout(() => {
    //   router.push('/swap');
    // }, 2000); // Adjust the delay as needed
  };

  const setupWeaveDB = async () => {
    try {
        const _db = new SDK({
            contractTxId
        });
        await _db.init();
        setDb(_db);
        setInitDb(true);
    } catch (e) {
        console.error("setupWeaveDB", e);
    }
};

  const checkUser = async () => {
    const wallet_address = await lf.getItem(`temp_address:current`)
    if (!isNil(wallet_address)) {
        const identity = await lf.getItem(
            `temp_address:${contractTxId}:${wallet_address}`
        )
        if (!isNil(identity))
            setUser({
                wallet: wallet_address,
                privateKey: identity.privateKey,
            })
    }
}


  const login = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum, "any")
    const signer = await provider.getSigner()
    await provider.send("eth_requestAccounts", []);
    const wallet_address = await signer.getAddress();

    let identity = await lf.getItem(
      `temp_address:${contractTxId}:${wallet_address}`
    );

    let tx;

    // check if the value is null or undefined
    if (isNil(identity)) {
      ({ tx, identity } = await db.createTempAddress(wallet_address));
      const linked = await db.getAddressLink(identity.address);
      if (isNil(linked)) {
        alert("something went wrong");
        return;
      }
    } else {
      await lf.setItem("temp_address:current", wallet_address);

      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      });
      setIsWalletConnected(true);
      return;
    }

    if (!isNil(tx) && isNil(tx.err)) {
      identity.tx = tx;
      identity.linked_address = wallet_address;
      await lf.setItem("temp_address:current", wallet_address);
      await lf.setItem(
        `temp_address:${contractTxId}:${wallet_address}`,
        JSON.parse(JSON.stringify(identity))
      );
      setUser({
        wallet: wallet_address,
        privateKey: identity.privateKey,
      });
    }
  };

  const logout = async () => {
    if (confirm("Would you like to sign out?")) {
      await lf.removeItem("temp_address:current")
      setUser(null, "temp_current")
    }
  }

  useEffect(() => {
    checkUser()
    setupWeaveDB();
}, []);


  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 overflow-hidden ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        {!isNil(user) ? (
          <button onClick={() => logout()} className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 hover:bg-zinc-400/30 duration-400 transition-all ease-in-out cursor-pointer">
            {user.wallet.slice(0, 7)}
          </button>
        ) : (
          <button onClick={() => login()} className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 hover:bg-zinc-400/30 duration-400 transition-all ease-in-out cursor-pointer">
            Connect Wallet
          </button>
        )}

        <AnimatePresence>
          {wallet.accounts.length > 0 &&
            <motion.div
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"
            >
              <a
                className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
              >
                Wallet Accounts: {wallet.accounts[0]}
              </a>
            </motion.div>
          }
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {isSwapped && (
          <SwapBox isSwapped={isSwapped} />
        )}
      </AnimatePresence>
      <div className="">
        <motion.button
          animate={{ scale: 1 }}
          transition={{
            ease: "linear",
            duration: 2,
            x: { duration: 1 },
          }}
          onClick={handleSwap}
          className="bg-white w-48 h-12 rounded-md border-0 flex items-center justify-center cursor-pointer"
        >
          <p className="text-black">Create Gift Link 🎉</p>
        </motion.button>
      </div>
    </main>
  );
}
