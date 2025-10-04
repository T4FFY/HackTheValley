import "./App.css";

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>My Robot UI</h1>
        <p>Blockly + Wi-Fi JSON control</p>
      </header>

      <main className="main">
        <button className="btn">Connect</button>
        <button className="btn run">Run Program</button>
      </main>
    </div>
  );
}

export default App;
