import React, { useEffect, useRef, useState } from "react";
import { Play, Trash2, Download, Zap, Lightbulb, Bot } from "lucide-react";
import "./App.css";

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
        }, 100);
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

    // Define custom blocks with fun colors
    window.Blockly.Blocks["robot_move"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🚗 Move")
          .appendField(
            new window.Blockly.FieldDropdown([
              ["⬆️ Forward", "forward"],
              ["⬇️ Backward", "backward"],
              ["⬅️ Left", "left"],
              ["➡️ Right", "right"],
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
          )
          .appendField("for")
          .appendField(
            new window.Blockly.FieldNumber(1, 0.1, 10, 0.1),
            "DURATION"
          )
          .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#2196F3");
        this.setTooltip("Turn the robot");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_light"] = {
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
        this.appendDummyInput()
          .appendField("🔊 Buzzer for")
          .appendField(
            new window.Blockly.FieldNumber(1, 0.1, 10, 0.1),
            "DURATION"
          )
          .appendField("seconds");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#E91E63");
        this.setTooltip("Activate buzzer");
        this.setHelpUrl("");
      },
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
        this.setColour("#9C27B0");
        this.setTooltip("Display message on OLED screen");
        this.setHelpUrl("");
      },
    };

    window.Blockly.Blocks["robot_fan"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("🌀 Fan speed")
          .appendField(new window.Blockly.FieldNumber(50, 0, 100, 1), "SPEED")
          .appendField("%");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#00BCD4");
        this.setTooltip("Set fan speed (0-100%)");
        this.setHelpUrl("");
      },
    };

    // JavaScript generators
    window.Blockly.JavaScript["robot_move"] = function (block) {
      const direction = block.getFieldValue("DIRECTION");
      const duration = block.getFieldValue("DURATION");
      return `robot.move('${direction}', ${duration});\n`;
    };

    window.Blockly.JavaScript["robot_turn"] = function (block) {
      const direction = block.getFieldValue("DIRECTION");
      const duration = block.getFieldValue("DURATION");
      return `robot.turn('${direction}', ${duration});\n`;
    };

    window.Blockly.JavaScript["robot_light"] = function (block) {
      const colour = block.getFieldValue("COLOUR");
      return `robot.setLight('${colour}');\n`;
    };

    window.Blockly.JavaScript["robot_buzzer"] = function (block) {
      const duration = block.getFieldValue("DURATION");
      return `robot.buzzer(${duration});\n`;
    };

    window.Blockly.JavaScript["robot_oled"] = function (block) {
      const message = block.getFieldValue("MESSAGE");
      return `robot.displayOLED('${message}');\n`;
    };

    window.Blockly.JavaScript["robot_fan"] = function (block) {
      const speed = block.getFieldValue("SPEED");
      return `robot.setFanSpeed(${speed});\n`;
    };

    // Create colorful toolbox
    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "🚗 Movement",
          colour: "#4CAF50",
          contents: [
            { kind: "block", type: "robot_move" },
            { kind: "block", type: "robot_turn" },
          ],
        },
        {
          kind: "category",
          name: "💡 Lights",
          colour: "#FF9800",
          contents: [{ kind: "block", type: "robot_light" }],
        },
        {
          kind: "category",
          name: "🔊 Sound",
          colour: "#E91E63",
          contents: [{ kind: "block", type: "robot_buzzer" }],
        },
        {
          kind: "category",
          name: "📺 Display",
          colour: "#9C27B0",
          contents: [{ kind: "block", type: "robot_oled" }],
        },
        {
          kind: "category",
          name: "🌀 Fan",
          colour: "#00BCD4",
          contents: [{ kind: "block", type: "robot_fan" }],
        },
        {
          kind: "category",
          name: "🔁 Loops",
          colour: "#673AB7",
          contents: [
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
              },
            },
            { kind: "block", type: "controls_whileUntil" },
            {
              kind: "block",
              type: "controls_for",
              inputs: {
                FROM: {
                  shadow: {
                    type: "math_number",
                    fields: { NUM: 1 },
                  },
                },
                TO: {
                  shadow: {
                    type: "math_number",
                    fields: { NUM: 10 },
                  },
                },
                BY: {
                  shadow: {
                    type: "math_number",
                    fields: { NUM: 1 },
                  },
                },
              },
            },
          ],
        },
        {
          kind: "category",
          name: "🧠 Logic",
          colour: "#795548",
          contents: [
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "logic_compare" },
            { kind: "block", type: "logic_operation" },
            { kind: "block", type: "logic_boolean" },
          ],
        },
        {
          kind: "category",
          name: "🔢 Math",
          colour: "#607D8B",
          contents: [
            { kind: "block", type: "math_number" },
            { kind: "block", type: "math_arithmetic" },
          ],
        },
      ],
    };

    // Create workspace with fun theme
    workspaceRef.current = window.Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      grid: {
        spacing: 25,
        length: 3,
        colour: "#e0e0e0",
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
      },
      trashcan: true,
      sounds: true,
      theme: window.Blockly.Themes.Classic,
    });
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

  const runCode = () => {
    setIsRunning(true);
    generateCode();
    setTimeout(() => setIsRunning(false), 1000);
  };

  const clearWorkspace = () => {
    if (workspaceRef.current) {
      if (window.confirm("🤔 Are you sure you want to clear your workspace?")) {
        workspaceRef.current.clear();
        setCode("");
        setOutput("");
      }
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Fun Header */}
        <div className="header">
          <div className="header-badge">
            <Bot className="header-icon" />
            <h1 className="header-title">Robot Programming Lab</h1>
            <Zap className="header-icon-accent" />
          </div>
          <p className="header-subtitle">
            Build your robot's brain with code blocks! 🧠✨
          </p>
        </div>

        <div className="main-card">
          {/* Main Content */}
          <div className="grid-layout">
            {/* Blockly Workspace */}
            <div className="workspace-column">
              <div className="blockly-container">
                {!loaded && (
                  <div className="loading-container">
                    <div className="loading-content">
                      <div className="loading-icon">
                        <Bot className="bot-icon" />
                      </div>
                      <div className="spinner"></div>
                      <p className="loading-text">
                        Loading your coding playground...
                      </p>
                    </div>
                  </div>
                )}
                <div
                  ref={blocklyDiv}
                  style={{
                    height: "600px",
                    width: "100%",
                    display: loaded ? "block" : "none",
                  }}
                />
              </div>

              {/* Controls */}
              <div className="controls">
                <button
                  onClick={runCode}
                  disabled={!loaded || isRunning}
                  className="btn-run"
                >
                  <Play className="btn-icon" />
                  {isRunning ? "Running..." : "Run My Program!"}
                </button>
                <button
                  onClick={clearWorkspace}
                  disabled={!loaded}
                  className="btn-clear"
                >
                  <Trash2 className="btn-icon-sm" />
                  Clear
                </button>
                <button
                  onClick={() => {
                    fetch("http://192.168.4.1/beep", { method: "POST" })
                      .then(() => console.log("Beep request sent!"))
                      .catch((err) =>
                        console.error("Beep request failed:", err)
                      );
                  }}
                  className="btn-test"
                >
                  Test Beep
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="output-column">
              {/* Generated Code */}
              <div className="code-panel">
                <div className="code-header">
                  <div className="code-dots">
                    <div className="dot dot-red"></div>
                    <div className="dot dot-yellow"></div>
                    <div className="dot dot-green"></div>
                  </div>
                  <h3 className="code-title">📝 Your Code</h3>
                </div>
                <pre className="code-content">
                  {code ||
                    '// Drag blocks and click "Run" to see your code here!\n// Let\'s create something awesome! 🚀'}
                </pre>
              </div>

              {/* Execution Output */}
              <div className="output-panel">
                <h3 className="output-title">
                  <Lightbulb className="output-icon" />
                  Robot Instructions
                </h3>
                <pre className="output-content">
                  {output ||
                    '👋 Hi there, young coder!\n\nDrag blocks from the colorful menu on the left and snap them together to create your robot program.\n\n💡 Try this:\n1. Click "🚗 Movement"\n2. Drag a move block here\n3. Click "Run My Program!"'}
                </pre>
              </div>
            </div>
          </div>

          {/* Fun Instructions Footer */}
          <div className="footer">
            <h3 className="footer-title">
              🎮 Quick Guide - Make Your Robot Come Alive!
            </h3>
            <div className="guide-grid">
              <div className="guide-card guide-card-green">
                <div className="guide-emoji">🚗</div>
                <strong className="guide-heading">Movement</strong>
                <p className="guide-text">
                  Make your robot go forward, backward, left, or right!
                </p>
              </div>
              <div className="guide-card guide-card-orange">
                <div className="guide-emoji">💡🔊</div>
                <strong className="guide-heading">Lights & Sounds</strong>
                <p className="guide-text">
                  Pick colors and play buzzer sounds!
                </p>
              </div>
              <div className="guide-card guide-card-purple">
                <div className="guide-emoji">📺🌀</div>
                <strong className="guide-heading">Display & Fan</strong>
                <p className="guide-text">
                  Show messages and control the fan speed!
                </p>
              </div>
              <div className="guide-card guide-card-blue">
                <div className="guide-emoji">🔁</div>
                <strong className="guide-heading">Loops</strong>
                <p className="guide-text">
                  Repeat actions multiple times automatically!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlocklyRobotController;
