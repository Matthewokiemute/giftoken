import React from "react";
import { motion } from "framer-motion";

const AnimatedButton = () => {
  return (
    <motion.button
      whileHover={{ scale: 1 }}
      whileTap={{ scale: 3.2 }}
      initial={{ size: 30 }} // Set initial scale to 1.1
      transition={{ duration: 0.2 }} // Set transition duration to 0.2 seconds
    >
      Click me
    </motion.button>
  );
};

export default AnimatedButton;