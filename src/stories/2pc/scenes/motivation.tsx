import type { SceneScript } from "../../../types";
import { segment } from "../../../lib/motion";
import {
  Abs,
  Flight,
  FlightDot,
  HiddenAnchor,
  MotionAnchor,
  MotionFlight,
  Node,
  PreparedDashed,
  TitleVisual,
  TxBox,
  clampProgress,
  frame,
} from "../primitives";

export const motivationScene: SceneScript = {
  id: "motivation",
  title: "Motivation",
  steps: [
    frame({
      id: "title",
      label: "Title",
      hideCaption: true,
      title: () => (
        <TitleVisual text="The Motivation behind Two-Phase Commit" />
      ),
      visual: () => null,
      loop: false,
    }),
    frame({
      id: "intro-client",
      label: "Intro",
      hideCaption: false,
      narration: "Let's say we have a client",
      durationMs: 2500,
      loop: false,
      visual: ({ progress }) => {
        const scaleP = clampProgress(progress, 0.05, 0.35);
        const scale = scaleP;
        const opacity = clampProgress(progress, 0.0, 0.2);

        return (
          <div className="relative w-full h-full">
            <Abs
              style={{
                left: "31%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
              }}
            >
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
            </Abs>
          </div>
        );
      },
    }),
    frame({
      id: "intro-database",
      label: "Intro",
      hideCaption: false,
      narration: "and a database",
      durationMs: 2500,
      loop: false,
      visual: ({ progress }) => {
        const scaleP = clampProgress(progress, 0.05, 0.35);
        const scale = scaleP;
        const opacity = clampProgress(progress, 0.0, 0.2);

        return (
          <div className="relative w-full h-full">
            <Abs
              style={{
                left: "31%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
            </Abs>

            <Abs
              style={{
                left: "67%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
              }}
            >
              <MotionAnchor id="database">
                <div className="aspect-square w-48 shrink-0 rounded-full bg-purple-700" />
              </MotionAnchor>
            </Abs>
          </div>
        );
      },
    }),
    frame({
      id: "intro",
      label: "Intro",
      hideCaption: false,
      narration:
        "This client that issues a sequence of read and write operations against a database",
      durationMs: 8000,
      visual: ({ progress }) => {
        const readP = clampProgress(progress, 0.1, 0.7);
        const write1P = clampProgress(progress, 0.2, 0.8);
        const write2P = clampProgress(progress, 0.3, 0.9);

        return (
          <div className="relative w-full h-full">
            {/* Nodes */}
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
              <MotionAnchor id="database">
                <div className="aspect-square w-48 shrink-0 rounded-full bg-purple-700" />
              </MotionAnchor>
            </div>

            <FlightDot
              progress={readP}
              from="client"
              to="database"
              color="#3B82F6"
              label="R"
              size="md"
              start={0.0}
              end={0.7}
            />

            <FlightDot
              progress={write1P}
              from="client"
              to="database"
              color="#3B82F6"
              label="W"
              size="md"
              start={0.2}
              end={0.8}
            />

            <FlightDot
              progress={write2P}
              from="client"
              to="database"
              color="#3B82F6"
              label="W"
              size="md"
              start={0.3}
              end={0.9}
            />
          </div>
        );
      },
      loop: true,
    }),
    frame({
      id: "intro-transaction",
      label: "Intro",
      hideCaption: false,
      narration:
        "Each client may want to batch certain read and write operations for the database to execute as a single logical unit, we call this logical unit a transaction",
      durationMs: 3000,
      loop: true,
      visual: ({ progress }) => {
        return (
          <div className="relative w-full h-full">
            <HiddenAnchor id="client-front-top" x="41%" y="46%" />
            <HiddenAnchor id="client-front-bottom" x="41%" y="54%" />
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
              <MotionAnchor id="database">
                <div className="aspect-square w-48 shrink-0 rounded-full bg-purple-700" />
              </MotionAnchor>
            </div>

            <Flight
              progress={progress}
              from="client"
              to="database"
              start={0.0}
              end={0.8}
              fade
            >
              <div>
                <div className="flex items-center whitespace-nowrap">
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    R
                  </div>
                  <div className="h-1 w-4 shrink-0 bg-orange-500" />
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    W
                  </div>
                  <div className="h-1 w-4 shrink-0 bg-orange-500" />
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    W
                  </div>
                </div>
              </div>
            </Flight>
          </div>
        );
      },
    }),
    frame({
      id: "intro-pre-shard",
      label: "Intro",
      hideCaption: false,
      narration:
        "Since our database is monolithic, we can rely on local mechanisms (i.e. write ahead logging) to enforce transaction atomicity, also known as preventing a partially applied transaction",
      durationMs: 4000,
      loop: true,
      visual: ({ progress }) => {
        const ackStart = 0.62;
        const ackEnd = 0.98;

        return (
          <div className="relative w-full h-full">
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
              <MotionAnchor id="database">
                <div className="aspect-square w-48 shrink-0 rounded-full bg-purple-700" />
              </MotionAnchor>
            </div>

            <Flight
              progress={progress}
              from="client"
              to="database"
              start={0.0}
              end={0.55}
              fade
            >
              <div>
                <div className="flex items-center whitespace-nowrap">
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    R
                  </div>
                  <div className="h-1 w-4 shrink-0 bg-orange-500" />
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    W
                  </div>
                  <div className="h-1 w-4 shrink-0 bg-orange-500" />
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    W
                  </div>
                </div>
              </div>
            </Flight>

            {progress >= ackStart && (
              <Flight
                progress={progress}
                from="database"
                to="client"
                start={ackStart}
                end={ackEnd}
                fade
                scaleIn
              >
                <div>
                  <div className="h-8 w-8 rounded-full bg-green-500" />
                </div>
              </Flight>
            )}
          </div>
        );
      },
    }),
    frame({
      id: "intro-pre-shard",
      label: "Intro",
      hideCaption: false,
      narration: "But if our database gets too big...",
      durationMs: 4200,
      loop: false,
      visual: ({ progress }) => {
        const growth = clampProgress(progress, 0.25, 0.95);
        const dbSize = 190 + growth * 280;
        const traffic = [
          { kind: "W", start: 0.04, end: 0.44, color: "#2563eb" },
          { kind: "W", start: 0.14, end: 0.54, color: "#2563eb" },
          { kind: "W", start: 0.24, end: 0.64, color: "#2563eb" },
          { kind: "W", start: 0.34, end: 0.74, color: "#2563eb" },
          { kind: "W", start: 0.46, end: 0.9, color: "#2563eb" },
        ];

        return (
          <div className="relative w-full h-full">
            <HiddenAnchor id="traffic-start" x="25%" y="47%" />
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="monolith">
                <div
                  className="shrink-0 rounded-full bg-purple-700"
                  style={{
                    width: `${dbSize}px`,
                    height: `${dbSize}px`,
                  }}
                />
              </MotionAnchor>
            </div>

            {/* <div className="-translate-x-1/2 -translate-y-1/2"> */}
            <div className="flex items-center whitespace-nowrap">
              {traffic.map((packet) => (
                <Flight
                  key={`${packet.kind}-${packet.start}`}
                  progress={progress}
                  from="traffic-start"
                  to="monolith"
                  start={packet.start}
                  end={packet.end}
                  fade
                  scaleIn
                >
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    {packet.kind}
                  </div>
                </Flight>
              ))}
            </div>
          </div>
          // </div>
        );
      },
    }),
    frame({
      id: "intro-split-into-shard",
      label: "Intro",
      hideCaption: false,
      narration:
        "We may need to partition our database into independent managed subsets of data. These partitions are also known as shards",
      durationMs: 4200,
      loop: true,
      visual: ({ progress }) => {
        const splitP = clampProgress(progress, 0.25, 0.85);
        const monolithScale = 1 - splitP * 0.45;
        const monolithOpacity = 1 - splitP * 0.85;
        const shardOpacity = clampProgress(progress, 0.35, 0.9);

        return (
          <div className="relative w-full h-full">
            <div className="flex h-full flex-row items-center justify-center gap-16">
              <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                <div className="flex flex-col justify-center text-white text-bold text-8xl">
                  1
                </div>
              </div>
              <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                <div className="flex flex-col justify-center text-white text-bold text-8xl">
                  2
                </div>
              </div>
            </div>
          </div>
        );
      },
    }),
    frame({
      id: "intro-shared-desc",
      label: "Intro",
      hideCaption: false,
      narration:
        "Let's say Shard 1 stores rows 100 - 199, and Shard 2 stores rows 200 - 299",
      durationMs: 3000,
      loop: false,
      visual: ({ progress }) => {
        return (
          <div className="relative w-full h-full">
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
              <MotionAnchor id="shard-stack">
                <div className="flex flex-col gap-8">
                  <MotionAnchor id="shard-1">
                    <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex justify-center text-bold text-6xl">
                          <div>1</div>
                        </div>
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">100 - 199</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionAnchor>
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>2</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">200 - 299</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionAnchor>
            </div>
          </div>
        );
      },
    }),
    frame({
      id: "intro-shared-sole-shard-transaction",
      label: "Intro",
      hideCaption: false,
      narration:
        "If a client issues a transaction, in which all reads and writes only access rows 100 - 199, then the entire transaction is handled by Shard 1",
      durationMs: 4500,
      loop: true,
      visual: ({ progress }) => {
        const txP = clampProgress(progress, 0.05, 1.0);
        const ackP = clampProgress(progress, 0.05, 1.0);

        return (
          <div className="relative w-full h-full">
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
              <MotionAnchor id="shard-stack">
                <div className="flex flex-col gap-8">
                  <MotionAnchor id="shard-1">
                    <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex justify-center text-bold text-6xl">
                          <div>1</div>
                        </div>
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">100 - 199</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionAnchor>
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>2</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">200 - 299</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionAnchor>
            </div>

            <Flight
              progress={txP}
              from="client"
              to="shard-1"
              start={0.05}
              end={0.5}
              fade
            >
              <div>
                <div className="flex flex-col items-center whitespace-nowrap">
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    W
                  </div>
                  <div className="h-4 w-1 shrink-0 bg-orange-500" />
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    W
                  </div>
                </div>
              </div>
            </Flight>

            <Flight
              progress={ackP}
              from="shard-1"
              to="client"
              start={0.5}
              end={0.92}
              fade
              scaleIn
            >
              <div>
                <div className="h-8 w-8 rounded-full bg-green-500" />
              </div>
            </Flight>
          </div>
        );
      },
    }),
    frame({
      id: "intro-shared-sole-shard-failed-transaction",
      label: "Intro",
      hideCaption: false,
      narration:
        "If Shard 1 crashes or is unable to handle this transaction, then its local mechanisms will still enforce transaction atomicity",
      durationMs: 6000,
      loop: true,
      visual: ({ progress }) => {
        const txP = clampProgress(progress, 0.05, 1.0);
        const ackP = clampProgress(progress, 0.05, 1.0);

        return (
          <div className="relative w-full h-full">
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
              <MotionAnchor id="shard-stack">
                <div className="flex flex-col gap-8">
                  <MotionAnchor id="shard-1">
                    <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex justify-center text-bold text-6xl">
                          <div>1</div>
                        </div>
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">100 - 199</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionAnchor>
                  <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                    <div className="flex flex-col justify-center text-white gap-1">
                      <div className="flex justify-center text-bold text-6xl">
                        <div>2</div>
                      </div>
                      <div className="flex flex-col justify-center text-bold text-lg">
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex justify-center">Rows:</div>
                          <div className="flex justify-center">200 - 299</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionAnchor>
            </div>

            <Flight
              progress={txP}
              from="client"
              to="shard-1"
              start={0.05}
              end={0.5}
              fade
            >
              <div>
                <div className="flex flex-col items-center whitespace-nowrap">
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    W
                  </div>
                  <div className="h-4 w-1 shrink-0 bg-orange-500" />
                  <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                    W
                  </div>
                </div>
              </div>
            </Flight>

            <Flight
              progress={ackP}
              from="shard-1"
              to="client"
              start={0.5}
              end={0.92}
              fade
              scaleIn
            >
              <div>
                <div className="h-8 w-8 rounded-full bg-red-500" />
              </div>
            </Flight>
          </div>
        );
      },
    }),
    frame({
      id: "intro-shared-multi-shard-transaction",
      label: "Intro",
      hideCaption: false,
      narration:
        "But what happens if a client issues a transaction that updates rows in different shards?",
      durationMs: 4500,
      loop: true,
      visual: ({ progress }) => {
        const txStart = 0.0;
        const txEnd = 0.76;
        const lineGrow = clampProgress(progress, 0.0, 0.72);
        const lineHeight = 16 + lineGrow * 164;
        const fadeOut = 1 - segment(progress, 0.6, 0.72);
        const txOpacity = progress < txStart ? 0 : fadeOut;

        return (
          <div className="relative w-full h-full">
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
              <MotionAnchor id="shard-stack">
                <div className="flex flex-col gap-8">
                  <MotionAnchor id="shard-1">
                    <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex justify-center text-bold text-6xl">
                          <div>1</div>
                        </div>
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">100 - 199</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionAnchor>
                  <MotionAnchor id="shard-2">
                    <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex justify-center text-bold text-6xl">
                          <div>2</div>
                        </div>
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">200 - 299</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionAnchor>
                </div>
              </MotionAnchor>
            </div>

            <MotionFlight
              progress={progress}
              from="client"
              to="shard-stack"
              start={txStart}
              end={txEnd}
            >
              {({ t }) => (
                <div
                  style={{
                    opacity: txOpacity,
                    transform: `scale(${0.9 + 0.1 * t})`,
                  }}
                >
                  <div>
                    <div className="flex flex-col items-center whitespace-nowrap">
                      <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                        W
                      </div>
                      <div
                        className="w-1 shrink-0 bg-orange-500"
                        style={{ height: `${lineHeight}px` }}
                      />
                      <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                        W
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </MotionFlight>
          </div>
        );
      },
    }),
    frame({
      id: "intro-shared-multi-shard-transaction-2",
      label: "Intro",
      hideCaption: false,
      narration:
        "Let's say a transaction containing two writes updates both Shard 1 and Shard 2",
      durationMs: 4000,
      loop: true,
      visual: ({ progress }) => {
        const txStart = 0.0;
        const txEnd = 0.76;
        const lineGrow = clampProgress(progress, 0.0, 0.72);
        const lineHeight = 16 + lineGrow * 164;
        const fadeOut = 1 - segment(progress, 0.6, 0.72);
        const txOpacity = progress < txStart ? 0 : fadeOut;

        return (
          <div className="relative w-full h-full">
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
              <MotionAnchor id="shard-stack">
                <div className="flex flex-col gap-8">
                  <MotionAnchor id="shard-1">
                    <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex justify-center text-bold text-6xl">
                          <div>1</div>
                        </div>
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">100 - 199</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionAnchor>
                  <MotionAnchor id="shard-2">
                    <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex justify-center text-bold text-6xl">
                          <div>2</div>
                        </div>
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">200 - 299</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionAnchor>
                </div>
              </MotionAnchor>
            </div>

            <MotionFlight
              progress={progress}
              from="client"
              to="shard-stack"
              start={txStart}
              end={txEnd}
            >
              {({ t }) => (
                <div
                  style={{
                    opacity: txOpacity,
                    transform: `scale(${0.9 + 0.1 * t})`,
                  }}
                >
                  <div>
                    <div className="flex flex-col items-center whitespace-nowrap">
                      <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                        W
                      </div>
                      <div
                        className="w-1 shrink-0 bg-orange-500"
                        style={{ height: `${lineHeight}px` }}
                      />
                      <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                        W
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </MotionFlight>
          </div>
        );
      },
    }),
    frame({
      id: "intro-shared-multi-shard-transaction-fail",
      label: "Intro",
      hideCaption: false,
      narration:
        "If Shard 1 fails to commit but Shard 2 commits successfully, the transaction becomes partially applied, violating atomicity",
      durationMs: 6000,
      loop: true,
      visual: ({ progress }) => {
        const txStart = 0.0;
        const txEnd = 0.5;
        const lineGrow = clampProgress(progress, 0.0, 0.4);
        const lineHeight = 16 + lineGrow * 164;
        const fadeOut = 1 - segment(progress, 0.5, 0.62);
        const txOpacity = progress < txStart ? 0 : fadeOut;
        const returnStart = 0.55;
        const returnEnd = 0.9;

        return (
          <div className="relative w-full h-full">
            <HiddenAnchor id="client-front-top" x="37%" y="46%" />
            <HiddenAnchor id="client-front-bottom" x="37%" y="54%" />
            <div className="flex h-full flex-row items-center justify-center gap-96">
              <MotionAnchor id="client">
                <div className="aspect-square w-32 shrink-0 rounded-full bg-green-700" />
              </MotionAnchor>
              <MotionAnchor id="shard-stack">
                <div className="flex flex-col gap-8">
                  <MotionAnchor id="shard-1">
                    <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex justify-center text-bold text-6xl">
                          <div>1</div>
                        </div>
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">100 - 199</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionAnchor>
                  <MotionAnchor id="shard-2">
                    <div className="flex items-center justify-center aspect-square w-48 shrink-0 rounded-full bg-pink-700">
                      <div className="flex flex-col justify-center text-white gap-1">
                        <div className="flex justify-center text-bold text-6xl">
                          <div>2</div>
                        </div>
                        <div className="flex flex-col justify-center text-bold text-lg">
                          <div className="flex flex-col justify-center text-bold text-lg">
                            <div className="flex justify-center">Rows:</div>
                            <div className="flex justify-center">200 - 299</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </MotionAnchor>
                </div>
              </MotionAnchor>
            </div>

            <MotionFlight
              progress={progress}
              from="client"
              to="shard-stack"
              start={txStart}
              end={txEnd}
            >
              <div style={{ opacity: txOpacity }}>
                <div>
                  <div className="flex flex-col items-center whitespace-nowrap">
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                    <div
                      className="w-1 shrink-0 bg-orange-500"
                      style={{ height: `${lineHeight}px` }}
                    />
                    <div className="grid aspect-square w-12 shrink-0 place-items-center rounded-full bg-blue-500 text-lg font-bold text-white">
                      W
                    </div>
                  </div>
                </div>
              </div>
            </MotionFlight>

            {progress >= returnStart && (
              <Flight
                progress={progress}
                from="shard-1"
                fromAttach="left"
                to="client-front-top"
                start={returnStart}
                end={returnEnd}
                scaleIn
              >
                <div>
                  <div className="h-8 w-8 rounded-full bg-red-500" />
                </div>
              </Flight>
            )}

            {progress >= returnStart && (
              <Flight
                progress={progress}
                from="shard-2"
                fromAttach="left"
                to="client-front-bottom"
                start={returnStart}
                end={returnEnd}
                scaleIn
              >
                <div>
                  <div className="h-8 w-8 rounded-full bg-green-500" />
                </div>
              </Flight>
            )}
          </div>
        );
      },
    }),
    frame({
      id: "intro-final",
      label: "Intro",
      hideCaption: true,
      narration: "",
      durationMs: 6000,
      loop: false,
      visual: ({ progress }) => {
        return (
          <div className="relative w-full h-full">
            <div className="flex flex-col justify-center items-center h-full my-24 gap-16 text-3xl text-center">
              <div className="">
                To prevent such partial commits, the system must coordinate the
                commit decision across{" "}
                <span className="font-bold text-pink-700">shards</span>,
                ensuring that either all{" "}
                <span className="font-bold text-pink-700">shards</span> commit
                or none do
              </div>
              <div>
                This is the motivation behind{" "}
                <span className="font-bold">Two-Phase Commit (2PC)</span>
              </div>
            </div>
          </div>
        );
      },
    }),
  ],
};
