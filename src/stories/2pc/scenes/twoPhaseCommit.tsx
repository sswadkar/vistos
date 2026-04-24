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

export const twoPhaseCommitScene: SceneScript = 
  {
    id: "two-phase-commit",
    title: "Two Phase Commit Protocol",
    steps: [
      frame({
        id: "intro-transaction-coordinator",
        label: "Transaction Coordinator",
        hideCaption: true,
        narration: "",
        title: () => <TitleVisual text="Two-Phase Commit (2PC) Protocol" />,
        visual: () => null,
        loop: false,
      }),
      frame({
        id: "intro-transaction-coordinator",
        label: "Transaction Coordinator",
        hideCaption: false,
        narration:
          "This is a Transaction Coordinator. It’s responsible for managing the protocol, ensuring all nodes reach a unanimous decision, maintaining consistency and integrity",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-purple-700" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "This is a Participant. They execute transaction operations given to them by the transaction coordinator. In a database system, a participant is typically a shard responsible for a subset of the data",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration: "A participant may be in 1 of 4 states",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "A participant starts off as Active, from here it may either Abort or Prepare",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "A participant may be in the Prepared state, from here it may either Abort or Commit",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700 outline outline-8 outline-dashed outline-black" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "A participant may be in the Aborted state. This is a terminal state",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700 outline outline-8 outline-red-500" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-participant",
        label: "Participant",
        hideCaption: false,
        narration:
          "And a participant may be in the Commited state, which is also a terminal state",
        durationMs: 3000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="aspect-square w-[30%] shrink-0 rounded-full bg-blue-700 outline outline-8 outline-green-500" />
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "In this protocol, all transactions issued by a client go through the transaction coordinator which routes transaction operations to the appropriate shards",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-64">
                <MotionAnchor id="client"><div className="aspect-square w-48 shrink-0 rounded-full bg-green-700" /></MotionAnchor>
                <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">21 - 30</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="client"
                to="coordinator"
                start={0.02}
                end={0.32}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white"></div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.35}
                end={0.65}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"></div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                start={0.68}
                end={0.98}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"></div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-explanation",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "While the coordinator may communicate with all shards, participant status is defined per transaction and includes only shards involved in that transaction",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-64">
                <MotionAnchor id="client"><div className="aspect-square w-48 shrink-0 rounded-full bg-green-700" /></MotionAnchor>
                <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">21 - 30</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="client"
                to="coordinator"
                start={0.02}
                end={0.32}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-orange-500 text-sm font-bold text-white"></div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.35}
                end={0.65}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"></div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                start={0.68}
                end={0.98}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-700 text-sm font-bold text-white"></div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-explanation-shard",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "For this transaction, only the first two shards are considered participants, since they contain the affected rows",
        durationMs: 6000,
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
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">21 - 30</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-coordinator-req",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "Upon receiving a transaction, the coordinator sends a PREPARE request to all participants of the transaction, asking the participants to prepare to commit the transaction",
        durationMs: 6000,
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
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
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
                start={0.05}
                end={0.5}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-2xl text-white">
                  5
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="bottom"
                start={0.05}
                end={0.5}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-2xl text-white">
                  15
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-participant-checking",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "Still in the ACTIVE state, each participant conducts local checks to ensure that it can guarantee a commit if instructed by the coordinator",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div className="px-7">
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="flex flex-row gap-2 items-center">
                    <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">1 - 10</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid aspect-square h-12 w-12 shrink-0 place-items-center rounded-full bg-yellow-600 text-2xl text-white">
                      5
                    </div>
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">11 - 20</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid aspect-square h-12 w-12 shrink-0 place-items-center rounded-full bg-yellow-600 text-2xl text-white">
                      15
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-yes",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "If a participant passes local checks, it votes YES, indicating that it has entered a PREPARED state and can commit if instructed",
        durationMs: 6000,
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
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline-dashed outline-4 outline-offset-1">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="top"
                to="coordinator"
                start={0.05}
                end={0.5}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-green-700 text-2xl text-white">
                  5
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-no",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "If a participant fails local checks, it votes NO, indicating to the coordinator that the transaction cannot commit and must be aborted",
        durationMs: 6000,
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
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-red-500 outline-4">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="bottom"
                to="coordinator"
                start={0.05}
                end={0.5}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-500 text-2xl text-white">
                  15
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "intro-pre-prepare-in-db",
        label: "Pre Prepare",
        hideCaption: false,
        narration:
          "These local checks include acquiring locks, validating constraints (i.e. there’s enough storage), and writing and flushing a PREPARED record to its write-ahead log (WAL)",
        durationMs: 6000,
        loop: true,
        visual: ({ progress }) => {
          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div className="">
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="flex flex-row items-center">
                    <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">1 - 10</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <TxBox
                        x="89%"
                        y="40%"
                        scale={1.2}
                        borderColor="#0f766e"
                        lines={["PREPARE TO UPDATE ROW 5"]}
                      ></TxBox>
                    </div>
                  </div>
                  <div className="flex flex-row items-center">
                    <div className="flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">11 - 20</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <TxBox
                        x="89%"
                        y="60%"
                        scale={1.2}
                        borderColor="#0f766e"
                        lines={["PREPARE TO UPDATE ROW 15"]}
                      ></TxBox>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "prepare-req-commit-if-all-yes",
        label: "Commit",
        hideCaption: false,
        narration:
          "If all participants vote YES, the coordinator sends a COMMIT request to all participants to finalize the transaction",
        durationMs: 8000,
        loop: false,
        visual: ({ progress }) => {
          const preparedOpacity = 1;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedOpacity }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedOpacity }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="top"
                to="coordinator"
                start={0.04}
                end={0.38}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-green-600 text-2xl text-white">
                  5
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="bottom"
                to="coordinator"
                start={0.08}
                end={0.42}
                fade
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-green-600 text-2xl text-white">
                  15
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.58}
                end={0.8}
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
                start={0.58}
                end={0.8}
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
        id: "participants-commit-and-ack",
        label: "Committed",
        hideCaption: false,
        narration:
          "Upon receiving the coordinator's COMMIT request, each participant finalizes the transaction, enters the COMMITTED state, and acknowledges the decision",
        durationMs: 7000,
        loop: true,
        visual: ({ progress }) => {
          const committedP = clampProgress(progress, 0.18, 0.56);
          const ackOpacity = committedP;
          const commitReqOpacity = 1 - segment(progress, 0.18, 0.28);

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - committedP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: committedP }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: 1 - committedP }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-green-500"
                      style={{ opacity: committedP }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>

              <Abs
                style={{ left: "68%", top: "40%", opacity: commitReqOpacity }}
              >
                <div className="grid aspect-square w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </Abs>

              <Abs
                style={{ left: "68%", top: "60%", opacity: commitReqOpacity }}
              >
                <div className="grid aspect-square w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-700 text-xl font-bold text-white">
                  C
                </div>
              </Abs>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="top"
                to="coordinator"
                start={0.34}
                end={0.7}
                fade
                fadeOut={false}
                scaleIn
              >
                <div
                  className="aspect-square w-10 rounded-full bg-green-700"
                  style={{ opacity: ackOpacity }}
                />
              </Flight>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="bottom"
                to="coordinator"
                start={0.34}
                end={0.7}
                fade
                fadeOut={false}
                scaleIn
              >
                <div
                  className="aspect-square w-10 rounded-full bg-green-700"
                  style={{ opacity: ackOpacity }}
                />
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "commit-phase-if-all-yes-done",
        label: "Commit Done",
        hideCaption: false,
        narration:
          "At this point, the transaction is finished and its effects are durably committed",
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
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-green-500">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-green-500">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "transition-to-abort",
        label: "Abort Path",
        hideCaption: true,
        durationMs: 5000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-12">
                <p className="m-0 text-center text-[2.05rem] font-medium leading-tight tracking-tight text-slate-600">
                  <span>Now let&apos;s see what happens if a </span>
                  <span className="font-bold text-blue-700">participant</span>
                  <span> aborts</span>
                </p>
              </div>
            </div>
          );
        },
      }),
      frame({
        id: "commit-phase-if-even-one-no",
        label: "Abort Vote",
        hideCaption: false,
        narration:
          "If any participant votes NO, the coordinator sends an ABORT request to all participants, instructing them to rollback their PREPARED transaction",
        durationMs: 8000,
        loop: true,
        visual: ({ progress }) => {
          const abortedP = clampProgress(progress, 0.72, 0.92);
          const preparedTopOpacity = 1 - abortedP;
          const abortTopOpacity = abortedP;

          return (
            <div className="relative w-full h-full">
              <div className="flex h-full flex-row items-center justify-center gap-96">
                <div className="flex flex-row gap-24">
                  <div>
                    <TxBox
                      x="17%"
                      y="50%"
                      scale={1.2}
                      lines={["UPDATE ROW 5", "UPDATE ROW 15"]}
                    ></TxBox>
                  </div>
                  <MotionAnchor id="coordinator"><div className="aspect-square w-72 shrink-0 rounded-full bg-purple-700" /></MotionAnchor>
                </div>

                <MotionAnchor id="participant-stack"><div className="flex flex-col gap-12">
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700">
                    <div
                      className="absolute inset-0 rounded-full outline outline-dashed outline-4 outline-offset-1 outline-black"
                      style={{ opacity: preparedTopOpacity }}
                    />
                    <div
                      className="absolute inset-0 rounded-full outline outline-[5px] outline-red-500"
                      style={{ opacity: abortTopOpacity }}
                    />
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">1 - 10</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center aspect-square w-32 shrink-0 rounded-full bg-blue-700 outline outline-[5px] outline-red-500">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">11 - 20</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div></MotionAnchor>
              </div>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="top"
                to="coordinator"
                start={0.05}
                end={0.4}
                fade
                scaleIn
              >
                <div className="aspect-square w-10 rounded-full bg-green-600" />
              </Flight>

              <Flight
                progress={progress}
                from="participant-stack"
                fromAttach="bottom"
                to="coordinator"
                start={0.05}
                end={0.4}
                fade
                scaleIn
              >
                <div className="aspect-square w-10 rounded-full bg-red-500" />
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="top"
                start={0.48}
                end={0.7}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-700 text-xl font-bold text-white">
                  A
                </div>
              </Flight>

              <Flight
                progress={progress}
                from="coordinator"
                to="participant-stack"
                toAttach="bottom"
                start={0.48}
                end={0.7}
                fade
                fadeOut={false}
                scaleIn
              >
                <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-red-700 text-xl font-bold text-white">
                  A
                </div>
              </Flight>
            </div>
          );
        },
      }),
      frame({
        id: "two-phase-commit-final-note",
        label: "2PC Summary",
        hideCaption: true,
        durationMs: 7000,
        loop: true,
        visual: () => {
          return (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 grid place-items-center px-16 py-12">
                <div className="text-center text-[1.95rem] font-medium leading-tight tracking-tight text-slate-600">
                  <span>The </span>
                  <span className="font-extrabold text-teal-700">PREPARED</span>
                  <span> state allows </span>
                  <span className="font-bold text-blue-700">participants</span>
                  <span> to hold </span>
                  <span className="font-bold text-orange-700">
                    transactions
                  </span>
                  <span>
                    {" "}
                    that have not yet committed, so their changes remain
                    invisible and can be rolled back if the{" "}
                  </span>
                  <span className="font-bold text-figmaPurple">
                    coordinator
                  </span>
                  <span> decides to </span>
                  <span className="font-bold text-red-700">abort</span>
                </div>
              </div>
            </div>
          );
        },
      }),
    ],
  };
