import React, { useEffect, useRef, useState } from "react";
import { Play, Zap, Lightbulb, Bot } from "lucide-react";

const BlocklyRobotController = () => {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initializeBlockly = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/blockly/10.4.3/blockly.min.js"
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/blockly/10.4.3/blocks.min.js"
        );
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/blockly/10.4.3/javascript.min.js"
        );

        setTimeout(() => {
          initBlockly();
          setLoaded(true);
          const style = document.createElement('style');
          style.innerHTML = `
            .blocklyTreeLabel {
              font-size: 16px !important;
              font-weight: 600 !important;
              padding: 8px 16px 8px 0 !important;
            }
            .blocklyTreeRow {
              height: auto !important;
              min-height: 36px !important;
              padding: 4px 0 !important;
            }
            .blocklyTreeRow[aria-label*="Motion"] .blocklyTreeLabel {
              color: #4CAF50 !important;
            }
            .blocklyTreeRow[aria-label*="Display"] .blocklyTreeLabel {
              color: #FF9800 !important;
            }
            .blocklyTreeRow[aria-label*="Sound"] .blocklyTreeLabel {
              color: #E91E63 !important;
            }
            .blocklyTreeRow[aria-label*="Fan"] .blocklyTreeLabel {
              color: #00BCD4 !important;
            }
            .blocklyTreeRow[aria-label*="Control"] .blocklyTreeLabel {
              color: #673AB7 !important;
            }
          `;
          document.head.appendChild(style);
        }, 300);
      } catch (error) {
        console.error("Error loading Blockly:", error);
      }
    };

    initializeBlockly();

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, []);

  const initBlockly = () => {
    if (!window.Blockly) return;

    window.Blockly.Blocks["robot_move"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🚗 Move")
          .appendField(
            new window.Blockly.FieldDropdown([
              ["⬆️ Forward", "forward"],
              ["⬇️ Backward", "backward"],
            ]),
            "DIRECTION"
          )
          .appendField("for")
          .appendField(
            new window.Blockly.FieldNumber(1, 0.1, 10, 0.1),
            "DURATION"
          )
          .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4CAF50");
        this.setTooltip("Move the robot in a direction");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_turn"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🔄 Turn")
          .appendField(
            new window.Blockly.FieldDropdown([
              ["⬅️ Left", "left"],
              ["➡️ Right", "right"],
            ]),
            "DIRECTION"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4CAF50");
        this.setTooltip("Turn the robot");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_light"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🌈 Set light to rainbow effect");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF9800");
        this.setTooltip("Activate rainbow ring effect");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_light_color"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("💡 Set light to")
          .appendField(new window.Blockly.FieldColour("#ff0000"), "COLOUR");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF9800");
        this.setTooltip("Set the robot's light color");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_buzzer"] = {
      init: function () {
        const noteField = new window.Blockly.FieldDropdown([
          ["C", "C"],
          ["D", "D"],
          ["E", "E"],
          ["F", "F"],
          ["G", "G"],
          ["A", "A"],
          ["B", "B"],
        ]);
        
        const scaleField = new window.Blockly.FieldDropdown(
          this.getScaleOptions.bind(this)
        );
        
        this.appendDummyInput()
          .appendField("🔊 Play note")
          .appendField(noteField, "NOTE")
          .appendField("scale")
          .appendField(scaleField, "SCALE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E91E63");
        this.setTooltip("Play a musical note");
        this.setHelpUrl("");
      },
      getScaleOptions: function() {
        const note = this.getFieldValue("NOTE");
        if (note === "A" || note === "B") {
          return [["3", "3"], ["4", "4"], ["5", "5"]];
        }
        return [["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"]];
      }
    };

    window.Blockly.Blocks["robot_oled"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("📺 Display:")
          .appendField(
            new window.Blockly.FieldTextInput("Hello Robot!"),
            "MESSAGE"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#FF9800");
        this.setTooltip("Display message on LED screen");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_fan"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🌀 Fan")
          .appendField(
            new window.Blockly.FieldDropdown([
              ["ON", "on"],
              ["OFF", "off"],
            ]),
            "STATE"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#00BCD4");
        this.setTooltip("Turn fan on or off");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_wait"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("⏱️ Wait")
          .appendField(
            new window.Blockly.FieldNumber(1, 0.1, 10, 0.1),
            "DURATION"
          )
          .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#673AB7");
        this.setTooltip("Wait for a specified time");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_forever"] = {
      init: function () {
        this.appendDummyInput().appendField("🔁 Forever");
        this.appendStatementInput("DO").setCheck(null);
        this.setPreviousStatement(true, null);
        this.setColour("#673AB7");
        this.setTooltip("Repeat forever");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_stop"] = {
      init: function () {
        this.appendDummyInput().appendField("🛑 Stop");
        this.setPreviousStatement(true, null);
        this.setColour("#673AB7");
        this.setTooltip("Stop the program");
        this.setHelpUrl("");
      },
    };

    window.Blockly.JavaScript["robot_move"] = function (block) {
      const direction = block.getFieldValue("DIRECTION");
      const duration = block.getFieldValue("DURATION");
      return `robot.move('${direction}', ${duration});\n`;
    };

    window.Blockly.JavaScript["robot_turn"] = function (block) {
      const direction = block.getFieldValue("DIRECTION");
      return `robot.turn('${direction}');\n`;
    };

    window.Blockly.JavaScript["robot_light"] = function (block) {
      return `robot.rainbowRing();\n`;
    };

    window.Blockly.JavaScript["robot_light_color"] = function (block) {
      const colour = block.getFieldValue("COLOUR");
      return `robot.setLight('${colour}');\n`;
    };

    window.Blockly.JavaScript["robot_buzzer"] = function (block) {
      const note = block.getFieldValue("NOTE");
      const scale = block.getFieldValue("SCALE");
      return `robot.playNote('${note}', ${scale});\n`;
    };

    window.Blockly.JavaScript["robot_oled"] = function (block) {
      const message = block.getFieldValue("MESSAGE");
      return `robot.displayLED('${message}');\n`;
    };

    window.Blockly.JavaScript["robot_fan"] = function (block) {
      const state = block.getFieldValue("STATE");
      return `robot.setFan('${state}');\n`;
    };

    window.Blockly.JavaScript["robot_wait"] = function (block) {
      const duration = block.getFieldValue("DURATION");
      return `robot.wait(${duration});\n`;
    };

    window.Blockly.JavaScript["robot_forever"] = function (block) {
      const branch = window.Blockly.JavaScript.statementToCode(block, "DO");
      return `while (true) {\n${branch}}\n`;
    };

    window.Blockly.JavaScript["robot_stop"] = function (block) {
      return `robot.stop();\n`;
    };

    const originalRepeatInit = window.Blockly.Blocks['controls_repeat_ext'].init;
    window.Blockly.Blocks['controls_repeat_ext'].init = function() {
      originalRepeatInit.call(this);
      this.setColour("#673AB7");
    };

    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "🚗 Motion",
          colour: "#4CAF50",
          categorystyle: "motion_category",
          contents: [
            { kind: "block", type: "robot_move" },
            { kind: "block", type: "robot_turn" },
          ],
        },
        {
          kind: "category",
          name: "💡 Display",
          colour: "#FF9800",
          categorystyle: "display_category",
          contents: [
            { kind: "block", type: "robot_light" },
            { kind: "block", type: "robot_light_color" },
            { kind: "block", type: "robot_oled" }
          ],
        },
        {
          kind: "category",
          name: "🔊 Sound",
          colour: "#E91E63",
          categorystyle: "sound_category",
          contents: [{ kind: "block", type: "robot_buzzer" }],
        },
        {
          kind: "category",
          name: "🌀 Fan",
          colour: "#00BCD4",
          categorystyle: "fan_category",
          contents: [{ kind: "block", type: "robot_fan" }],
        },
        {
          kind: "category",
          name: "🔁 Control",
          colour: "#673AB7",
          categorystyle: "control_category",
          contents: [
            { kind: "block", type: "robot_wait" },
            {
              kind: "block",
              type: "controls_repeat_ext",
              inputs: {
                TIMES: {
                  shadow: {
                    type: "math_number",
                    fields: { NUM: 3 },
                  },
                },
                DO: {
                  shadow: null,
                },
              },
            },
            { kind: "block", type: "robot_forever" },
            { kind: "block", type: "robot_stop" },
          ],
        },
      ],
    };

    const customTheme = window.Blockly.Theme.defineTheme('robotTheme', {
      base: window.Blockly.Themes.Classic,
      componentStyles: {
        workspaceBackgroundColour: '#f8fafc',
        toolboxBackgroundColour: '#ffffff',
        toolboxForegroundColour: '#1f2937',
        flyoutBackgroundColour: '#f3f4f6',
        flyoutForegroundColour: '#111827',
        flyoutOpacity: 0.95,
        scrollbarColour: '#9ca3af',
        insertionMarkerColour: '#ffffff',
        insertionMarkerOpacity: 0.3,
        scrollbarOpacity: 0.4,
        cursorColour: '#d97706',
      },
      categoryStyles: {
        motion_category: {
          colour: '#4CAF50',
        },
        display_category: {
          colour: '#FF9800',
        },
        sound_category: {
          colour: '#E91E63',
        },
        fan_category: {
          colour: '#00BCD4',
        },
        control_category: {
          colour: '#673AB7',
        },
      },
    });

    workspaceRef.current = window.Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      grid: {
        spacing: 25,
        length: 3,
        colour: "#e5e7eb",
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.95,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
      sounds: true,
      theme: customTheme,
      renderer: 'zelos',
    });

    setTimeout(() => {
      if (workspaceRef.current) {
        window.Blockly.svgResize(workspaceRef.current);
      }
    }, 0);
  };

  const generateCode = () => {
    if (workspaceRef.current && window.Blockly) {
      const jsCode = window.Blockly.JavaScript.workspaceToCode(
        workspaceRef.current
      );
      setCode(jsCode);

      const lines = jsCode.split("\n").filter((l) => l.trim());
      if (lines.length > 0) {
        setOutput(
          "✅ Ready to execute!\n\n" +
            lines.map((l, i) => `Step ${i + 1}: ${l}`).join("\n")
        );
      } else {
        setOutput("👋 Drag some blocks from the toolbox to get started!");
      }
    }
  };

  useEffect(() => {
    if (workspaceRef.current && loaded && window.Blockly) {
      const updateCode = () => {
        const jsCode = window.Blockly.JavaScript.workspaceToCode(
          workspaceRef.current
        );
        setCode(jsCode);

        const lines = jsCode.split("\n").filter((l) => l.trim());
        if (lines.length > 0) {
          setOutput(
            "✅ Ready to execute!\n\n" +
              lines.map((l, i) => `Step ${i + 1}: ${l}`).join("\n")
          );
        } else {
          setOutput("👋 Drag some blocks from the toolbox to get started!");
        }
      };
      
      workspaceRef.current.addChangeListener(updateCode);
      
      return () => {
        if (workspaceRef.current) {
          workspaceRef.current.removeChangeListener(updateCode);
        }
      };
    }
  }, [loaded]);

  const runCode = () => {
    setIsRunning(true);
    generateCode();
    setTimeout(() => setIsRunning(false), 1000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "linear-gradient(to bottom right, #f3e7ff, #fce7f3, #dbeafe)",
      padding: 0,
      margin: 0
    }}>
      <div style={{ width: "100vw", maxWidth: "100vw", margin: 0, padding: 0 }}>
        <div style={{
          textAlign: "center",
          marginBottom: 0,
          padding: "2rem 0",
          background: "linear-gradient(to bottom right, #111827, #581c87)",
          width: "100%"
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 2rem",
            marginBottom: "1rem"
          }}>
            <Bot style={{ width: "2.5rem", height: "2.5rem", color: "#c4b5fd" }} />
            <h1 style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              background: "linear-gradient(to right, #ffffffff, #f1e0e9ff)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              margin: 0
            }}>Block Buddy</h1>
          </div>
          <p style={{
            fontSize: "1.25rem",
            color: "#e9d5ff",
            fontWeight: 500
          }}>
            Where coding comes alive.
          </p>
        </div>

        <div style={{ backgroundColor: "white", overflow: "hidden", padding: 0 }}>
          <div style={{
            background: "linear-gradient(to bottom right, #eff6ff, #faf5ff)",
            padding: "1.25rem",
            margin: "0 0 1.5rem 0",
            borderTop: "4px solid #93c5fd",
            borderBottom: "4px solid #93c5fd",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{
              color: "#1e40af",
              fontWeight: "bold",
              fontSize: "1.125rem",
              margin: "0 0 0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <Lightbulb style={{ width: "1.25rem", height: "1.25rem", color: "#eab308" }} />
              Robot Instructions
            </h3>
            <pre style={{
              color: "#1e3a8a",
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
              lineHeight: 1.625,
              fontWeight: 500,
              margin: 0
            }}>
              {output || '👋 Hi there, young coder!\n\nDrag blocks from the colorful menu on the left and snap them together to create your robot program.\n\n💡 Try this:\n1. Click "Motion"\n2. Drag a move block here\n3. Click "Run My Program!"'}
            </pre>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "1.5rem",
            margin: "0 1.5rem"
          }}>
            <div>
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "1.5rem",
                border: "3px solid #a78bfa",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)",
                minHeight: "700px",
                position: "relative"
              }}>
                {!loaded && (
                  <div style={{
                    height: "700px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <Bot style={{ width: "4rem", height: "4rem", color: "#9333ea", margin: "0 auto 1rem" }} />
                      <p style={{ fontSize: "1.25rem", fontWeight: 600, color: "#7c3aed" }}>
                        Loading your coding playground...
                      </p>
                    </div>
                  </div>
                )}
                <div ref={blocklyDiv} style={{ height: "700px", width: "100%", display: loaded ? "block" : "none" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
                <button
                  onClick={runCode}
                  disabled={!loaded || isRunning}
                  style={{
                    flex: 1,
                    background: "linear-gradient(to right, #22c55e, #10b981)",
                    color: "white",
                    fontWeight: "bold",
                    padding: "1rem 1.5rem",
                    borderRadius: "1rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    fontSize: "1rem",
                    border: "none",
                    cursor: loaded && !isRunning ? "pointer" : "not-allowed",
                    opacity: !loaded || isRunning ? 0.5 : 1,
                    height: "4rem"
                  }}
                >
                  <Play style={{ width: "1.25rem", height: "1.25rem" }} />
                  {isRunning ? "Running..." : "Run!"}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setOutput("⏹️ Program stopped!");
                  }}
                  disabled={!loaded || !isRunning}
                  style={{
                    background: "linear-gradient(to right, #ef4444, #ec4899)",
                    color: "white",
                    fontWeight: "bold",
                    padding: "1rem 1.5rem",
                    borderRadius: "1rem",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    border: "none",
                    cursor: loaded && isRunning ? "pointer" : "not-allowed",
                    opacity: !loaded || !isRunning ? 0.5 : 1,
                    height: "4rem"
                  }}
                >
                  <Zap style={{ width: "1.25rem", height: "1.25rem" }} />
                  Stop
                </button>
              </div>
              
              <div style={{
                background: "linear-gradient(to bottom right, #111827, #581c87)",
                borderRadius: "1rem",
                padding: "1.25rem",
                height: "calc(700px - 4rem - 1.5rem - 3.5rem)",
                overflow: "auto",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                border: "2px solid #a78bfa"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem"
                }}>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "9999px", backgroundColor: "#ef4444" }} />
                    <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "9999px", backgroundColor: "#eab308" }} />
                    <div style={{ width: "0.75rem", height: "0.75rem", borderRadius: "9999px", backgroundColor: "#22c55e" }} />
                  </div>
                  <h3 style={{
                    color: "#86efac",
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                    margin: "0 0 0 0.5rem"
                  }}>📝 Your Code</h3>
                </div>
                <pre style={{
                  color: "#86efac",
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.625,
                  margin: 0
                }}>
                  {code || '// Drag blocks and click "Run" to see your code here!\n// Let\'s create something awesome! 🚀'}
                </pre>
              </div>
            </div>
          </div>

          <div style={{
            background: "linear-gradient(to right, #f3e7ff, #fce7f3, #dbeafe)",
            padding: "1.5rem",
            margin: "1.5rem 0 0 0"
          }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              color: "#1f2937",
              margin: "0 0 1rem",
              textAlign: "center"
            }}>
              🎮 Quick Guide - Make Your Robot Come Alive!
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" }}>
              <div style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "2px solid #86efac"
              }}>
                <div style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>🚗</div>
                <strong style={{ fontSize: "1rem", display: "block", marginBottom: "0.25rem", color: "#16a34a" }}>Motion</strong>
                <p style={{ fontSize: "0.75rem", color: "#4b5563", margin: "0.25rem 0 0" }}>Move & turn</p>
              </div>
              <div style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "2px solid #fdba74"
              }}>
                <div style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>💡</div>
                <strong style={{ fontSize: "1rem", display: "block", marginBottom: "0.25rem", color: "#ea580c" }}>Display</strong>
                <p style={{ fontSize: "0.75rem", color: "#4b5563", margin: "0.25rem 0 0" }}>Lights & messages</p>
              </div>
              <div style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "2px solid #f472b6"
              }}>
                <div style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>🔊</div>
                <strong style={{ fontSize: "1rem", display: "block", marginBottom: "0.25rem", color: "#db2777" }}>Sound</strong>
                <p style={{ fontSize: "0.75rem", color: "#4b5563", margin: "0.25rem 0 0" }}>Play notes</p>
              </div>
              <div style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "2px solid #67e8f9"
              }}>
                <div style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>🌀</div>
                <strong style={{ fontSize: "1rem", display: "block", marginBottom: "0.25rem", color: "#0891b2" }}>Fan</strong>
                <p style={{ fontSize: "0.75rem", color: "#4b5563", margin: "0.25rem 0 0" }}>ON/OFF</p>
              </div>
              <div style={{
                backgroundColor: "white",
                padding: "1rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                border: "2px solid #c4b5fd"
              }}>
                <div style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>🔁</div>
                <strong style={{ fontSize: "1rem", display: "block", marginBottom: "0.25rem", color: "#7c3aed" }}>Control</strong>
                <p style={{ fontSize: "0.75rem", color: "#4b5563", margin: "0.25rem 0 0" }}>Loops & wait</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlocklyRobotController;