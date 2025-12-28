"use client";

import { motion } from "motion/react";

export default function Drag() {
  //   return <motion.div drag style={box} />;
  //   return <motion.div drag="y" style={box} />;
  return (
    <motion.div
      drag
      dragMomentum={false}
      whileDrag={{ scale: 3 }}
      dragConstraints={{
        top: -300,
        left: -300,
        right: 300,
        bottom: 300,
      }}
      style={box}
    ></motion.div>
  );
}

const box = {
  width: 100,
  height: 100,
  backgroundColor: "#2f7cf8",
  borderRadius: 10,
};
