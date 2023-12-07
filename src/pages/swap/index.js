import React, { useState } from "react";
import AnimatedButton from "@/components/AnimatedButton";
import { motion, AnimatePresence } from "framer-motion";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ['latin'] });

const Swap = () => {
  const [isSwapped, setSwapped] = useState(false);

  const handleSwap = () => {
    setSwapped(!isSwapped);
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-10 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full flex items-center justify-between font-mono text-sm lg:flex">
        <p>Hey You!</p>
        <AnimatedButton onClick={handleSwap} />
      </div>
      <AnimatePresence>
        {isSwapped && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 10 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 w-screen h-screen bg-gray-800 flex items-center justify-center"
          >
            {/* Your new component goes here */}
            <p className="text-white">New Component!</p>
          </motion.div>
        )}
      </AnimatePresence>
      {/* <div className="">
        <motion.button
        //   whileTap={{ x: -40 }}
          animate={{ scale: 1 }}
          transition={{
            ease: "linear",
            duration: 2,
            x: { duration: 1 },
          }}
          onClick={handleSwap}
          className="bg-white w-40 h-20 rounded-md border-0 flex items-center justify-center cursor-pointer"
        >
          <p className="text-black">Swap</p>
        </motion.button>
      </div> */}
    </main>
  );
};

export default Swap;
