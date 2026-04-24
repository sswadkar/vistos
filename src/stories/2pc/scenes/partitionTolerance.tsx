import type { SceneScript } from "../../../types";
import { pointBetween, segment } from "../../../lib/motion";
import {
  Abs,
  Flight,
  FlightDot,
  HiddenAnchor,
  MotionAnchor,
  Node,
  PreparedDashed,
  TitleVisual,
  TxBox,
  clampProgress,
  frame,
} from "../primitives";

export const partitionToleranceScene: SceneScript = 
  {
    id: "exploring-partition-tolerance",
    title: "Exploring Partition Tolerance with Two-Phase Commit (2PC)",
    steps: [
      frame({
        id: "intro-failure-modes",
        label: "Potential Failure Modes",
        hideCaption: true,
        narration: "",
        title: () => (
          <TitleVisual text="Exploring Partition Tolerance with Two-Phase Commit (2PC)" />
        ),
        visual: () => null,
        loop: false,
      }),
      frame({
        id: "coordinator-crash",
        label: "Coordinator Crash",
        hideCaption: true,
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-16">
                <p className="m-0 max-w-[86%] text-center text-[2.05rem] font-medium leading-tight tracking-tight text-slate-600">
                  <span>Let&apos;s explore what happens if the </span>
                  <span className="font-bold text-figmaPurple">
                    coordinator
                  </span>
                  <span>
                    {" "}
                    becomes unreachable (i.e. coordinator crash, network
                    partition, routing failure, etc)
                  </span>
                </p>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "coordinator-crash-before-active",
        label: "Before Active",
        hideCaption: false,
        narration:
          "If the coordinator begins sending PREPARE requests and crashes after, we run into a problem",
        durationMs: 8000,
        loop: true,
        visual: ({ progress }) => {
          const preparedP = clampProgress(progress, 0.5, 0.95);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedP }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg"></div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedP }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg"></div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.2}
                end={0.5}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  X
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="bottom"
                start={0.2}
                end={0.5}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  Y
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "prepared-blocked-before-decision",
        label: "Prepared Blocking",
        hideCaption: false,
        narration:
          "Once participants enter the PREPARED state but before the coordinator gets to send out either a COMMIT or ABORT request, they may not unilaterally abort",
        durationMs: 6500,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "coordinator-unreachable-participant-blocked",
        label: "Participant Blocked",
        hideCaption: false,
        narration:
          "Considering a coordinator crash, once in the PREPARED state, a participant cannot independently roll back the transaction",
        durationMs: 6500,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "prepared-unilateral-abort-breaks-atomicity",
        label: "Atomicity Risk",
        hideCaption: false,
        narration:
          "If participants were able to unilaterally abort, after entering the PREPARED state, then atomicity could be violated",
        durationMs: 6500,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participants-a-b-timeout-abort",
        label: "Timeout Abort Hypothesis",
        hideCaption: false,
        narration:
          "Let's say Participant A and Participant B, after entering the PREPARED state, have the ability to unilaterally abort, based on a timeout to reach the coordinator",
        durationMs: 10000,
        loop: true,
        visual: ({ progress }) => {
          const aTimeoutP = clampProgress(progress, 0.08, 0.5);
          const bTimeoutP = clampProgress(progress, 0.2, 0.78);
          const aAbortP = clampProgress(progress, 0.5, 0.62);
          const bAbortP = clampProgress(progress, 0.78, 0.9);

          const aRemainingDeg = (1 - aTimeoutP) * 360;
          const bRemainingDeg = (1 - bTimeoutP) * 360;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${aRemainingDeg}deg, transparent ${aRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10"
                      style={{ opacity: 1 - aAbortP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-400 z-10"
                      style={{ opacity: aAbortP }}
                    />
                    <span className="relative z-20">A</span>
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${bRemainingDeg}deg, transparent ${bRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10"
                      style={{ opacity: 1 - bAbortP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-400 z-10"
                      style={{ opacity: bAbortP }}
                    />
                    <span className="relative z-20">B</span>
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participant-a-aborts-first",
        label: "A Aborts",
        hideCaption: false,
        narration:
          "Let's say Participant A independently aborts after not hearing back from the coordinator after some time",
        durationMs: 9500,
        loop: false,
        visual: ({ progress }) => {
          const aTimeoutP = clampProgress(progress, 0.1, 0.55);
          const bTimeoutP = clampProgress(progress, 0.1, 1.25);
          const aAbortStateP = clampProgress(progress, 0.55, 0.68);

          const aRemainingDeg = (1 - aTimeoutP) * 360;
          const bRemainingDeg = (1 - bTimeoutP) * 360;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${aRemainingDeg}deg, transparent ${aRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10"
                      style={{ opacity: 1 - aAbortStateP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-400 z-10"
                      style={{ opacity: aAbortStateP }}
                    />
                    <span className="relative z-20">A</span>
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${bRemainingDeg}deg, transparent ${bRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <span className="relative z-20">B</span>
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10" />
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "coordinator-recovers-b-commits",
        label: "B Commits",
        hideCaption: false,
        narration:
          "If the coordinator recovers from the crash and sends out the COMMIT request, before Participant B's timeout clock finishes, Participant B commits",
        durationMs: 6500,
        loop: true,
        visual: ({ progress }) => {
          const bCommitP = clampProgress(progress, 0.58, 0.88);
          const bTimeoutDrainP = clampProgress(progress, 0.12, 0.95);
          const bTimeoutRemainderP = 0.2 - 0.25 * bTimeoutDrainP;
          const bRemainingDeg = bTimeoutRemainderP * 360;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-red-400">
                    A
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${bRemainingDeg}deg, transparent ${bRemainingDeg}deg 360deg)`,
                        opacity: 1 - bCommitP,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-blue-700 z-10" />
                    <span className="relative z-20">B</span>
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black z-10"
                      style={{ opacity: 1 - bCommitP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500 z-10"
                      style={{ opacity: bCommitP }}
                    />
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="bottom"
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "a-cannot-commit-after-abort",
        label: "A Cannot Commit",
        hideCaption: false,
        narration:
          "Participant A rolled back the transaction though, even if it wanted to, it can't commit",
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-red-400">
                    A
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-green-500">
                    B
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "unilateral-abort-breaks-atomicity-summary",
        label: "Atomicity Violation",
        hideCaption: false,
        narration:
          "Hence, giving participants the ability to unilaterally abort violates atomicity as the transaction is now partially committed",
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-red-400">
                    A
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white outline outline-[5px] outline-green-500">
                    B
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "two-pc-is-blocking",
        label: "Blocking Protocol",
        hideCaption: false,
        narration:
          "This is why Two-Phase Commit (2PC) is a blocking protocol, once in the PREPARED state, participants may no longer independently abort or rollback",
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    A
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    B
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participants-stay-blocked-if-no-recovery",
        label: "Indefinite Blocking",
        hideCaption: false,
        narration:
          "And if the coordinator never comes back up, then the participants may remain blocked in PREPARED indefinitely",
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-slate-500" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    A
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                  <div className="relative grid aspect-square w-32 shrink-0 place-items-center rounded-full bg-blue-700 text-6xl font-medium text-white">
                    B
                    <div className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black" />
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participant-crash-intro",
        label: "Participant Crash",
        hideCaption: true,
        durationMs: 6000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-16">
                <p className="m-0 max-w-[86%] text-center text-[2.05rem] font-medium leading-tight tracking-tight text-slate-600">
                  <span>Let&apos;s explore what happens if the </span>
                  <span className="font-bold text-blue-700">participant</span>
                  <span>
                    {" "}
                    becomes unreachable (i.e. participant crash, network
                    partition, routing failure, etc)
                  </span>
                </p>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "participant-crash-in-active",
        label: "Participant Crash - In Active",
        hideCaption: false,
        narration:
          "If a participant becomes unreachable before it enters PREPARED (it hasn’t durably logged a PREPARE record and voted YES),",
        durationMs: 8000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-slate-500" />
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-blue-700" />
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  P
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="bottom"
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  P
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "participant-crash-coordinator-aborts-prepared",
        label: "Abort Remaining Prepared",
        hideCaption: false,
        narration:
          "The coordinator sends out an ABORT request due to timeout to participants that did enter PREPARED",
        durationMs: 12000,
        loop: true,
        visual: ({ progress }) => {
          const coordinatorTimeoutP = clampProgress(progress, 0.08, 0.62);
          const coordinatorRemainingDeg = (1 - coordinatorTimeoutP) * 360;
          const participantAbortP = clampProgress(progress, 0.82, 0.96);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <div className="relative aspect-square w-72 shrink-0">
                    <div
                      className="absolute -inset-2 rounded-full z-0"
                      style={{
                        background: `conic-gradient(#111827 0deg ${coordinatorRemainingDeg}deg, transparent ${coordinatorRemainingDeg}deg 360deg)`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-purple-700 z-10" />
                  </div>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-slate-500" />
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - participantAbortP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-400"
                      style={{ opacity: participantAbortP }}
                    />
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="bottom"
                to="coordinator"
                start={0.22}
                end={0.46}
                fade
                fadeOut={true}
                scaleIn
              >
                <div className="aspect-square w-12 rounded-full bg-green-700" />
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.64}
                end={0.86}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-bold text-white">
                  A
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="bottom"
                start={0.64}
                end={0.86}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-bold text-white">
                  A
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "participant-crash-after-prepared",
        label: "Crash After Prepared",
        hideCaption: false,
        narration: "If a participant crashes after it enters PREPARED",
        durationMs: 8000,
        loop: true,
        visual: ({ progress }) => {
          const preparedP = clampProgress(progress, 0.56, 0.72);
          const crashTopP = clampProgress(progress, 0.8, 0.95);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedP * (1 - crashTopP) }}
                    />
                    <div
                      className="absolute inset-0 rounded-full bg-slate-500"
                      style={{ opacity: crashTopP }}
                    />
                  </div>
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedP }}
                    />
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.12}
                end={0.5}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  P
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="bottom"
                start={0.12}
                end={0.5}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-xl font-bold text-white">
                  P
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="top"
                to="coordinator"
                start={0.54}
                end={0.84}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-11 shrink-0 place-items-center rounded-full bg-green-700 text-base font-bold text-white">
                  Y
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="bottom"
                to="coordinator"
                start={0.54}
                end={0.84}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-11 shrink-0 place-items-center rounded-full bg-green-700 text-base font-bold text-white">
                  Y
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "coordinator-blocks-until-participant-recovers",
        label: "Blocking Until Recovery",
        hideCaption: false,
        narration:
          "The coordinator blocks transaction completion till the participant comes back up so it can deliver its decision (either COMMIT or ABORT)",
        durationMs: 6500,
        loop: true,
        visual: ({ progress }) => {
          const bottomCommitP = clampProgress(progress, 0.58, 0.88);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-slate-500" />
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - bottomCommitP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: bottomCommitP }}
                    />
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="bottom"
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "participant-recovers-coordinator-retries",
        label: "Retry Decision",
        hideCaption: false,
        narration:
          "When the participant comes back up, the coordinator will retry its decision",
        durationMs: 6500,
        loop: true,
        visual: ({ progress }) => {
          const topCommitP = clampProgress(progress, 0.58, 0.88);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - topCommitP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: topCommitP }}
                    />
                  </div>
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-green-500" />
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.12}
                end={0.5}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "participant-never-recovers-indefinite-block",
        label: "Indefinite Block",
        hideCaption: false,
        narration:
          "If the participant never comes back up, then the coordinator will block transaction completion indefinitely",
        durationMs: 6500,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW X", "UPDATE ROW Y"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="aspect-square w-32 shrink-0 rounded-full bg-slate-500" />
                  <div className="relative aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-green-500" />
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "fin",
        label: "Fin",
        hideCaption: true,
        durationMs: 7000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-12">
                <div className="flex flex-col items-center gap-6">
                  <h1 className="m-0 text-center text-7xl font-bold tracking-tight text-slate-700">
                    Fin
                  </h1>
                  <p className="m-0 text-center text-2xl font-medium text-slate-500">
                    Protocol explanation and failure mode handling
                    visualizations are inspired by{" "}
                    <em>Designing Data-Intensive Applications</em> by Martin
                    Kleppmann
                  </p>
                </div>
              </div>
            </div>
          );
        },
      }),
    ],
  };
