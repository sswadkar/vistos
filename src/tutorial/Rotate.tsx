import { useState } from "react";
import * as motion from "motion/react-client";

export default function Rotate() {
  const [isRotated, setIsRotated] = useState(false);
  return (
    <motion.div
      style={{
        width: 100,
        height: 100,
        backgroundColor: "#98c379",
        borderRadius: 5,
      }}
      animate={{ rotate: isRotated ? 180 : 0 }}
      transition={{ duration: 0.75, ease: "linear" }}
      onClick={() => {
        setIsRotated(!isRotated);
      }}
    />
  );
}
