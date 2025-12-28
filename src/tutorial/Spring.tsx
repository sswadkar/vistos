"use client";

import { spring } from "motion";
import { useState } from "react";

export default function Spring() {
  const [state, setState] = useState(false);

  return (
    <div className="example-container">
      <div className="box" data-state={state}></div>
      <button onClick={() => setState(!state)}>Spring!</button>

      <style>
        {`
            .example-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 20px;
            }

            .example-container .box {
                width: 100px;
                height: 100px;
                background-color: #8df0cc;
                border-radius: 10px;
                transition: transform ${spring(0.1, 0.2)};
                transform: translateX(-50%);
            }

            .example-container .box[data-state="true"] {
                transform: translateX(50%) rotate(180deg);
            }

            .example-container button {
                background-color: #8df0cc;
                color: #0f1115;
                border-radius: 5px;
                padding: 10px;
                margin: 10px;
            }
        `}
      </style>
    </div>
  );
}
