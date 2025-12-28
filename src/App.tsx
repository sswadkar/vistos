import "./App.css";
import GsapTest from "./tutorial/GsapTest";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

function App() {
  gsap.registerPlugin(useGSAP);

  return (
    <>
      <GsapTest></GsapTest>
    </>
  );
}

export default App;
