import React, { useState } from "react";
import "./App.css";
import Summarizer from "./components/Summarizer";
import StudyPlanner from "./components/StudyPlanner";
import ChatPDF from "./components/ChatPDF";

function App() {
  const [section, setSection] = useState("summarizer");

  return (
  <div className="app">
    <div className="background-icons">
      <span className="icon icon1">📚</span>
      <span className="icon icon2">🧠</span>
      <span className="icon icon3">📖</span>
      <span className="icon icon4">⚛️</span>
    </div>
    <h1>📚 StudyMate</h1>

    <div className="nav">
    <button
  className={section === "summarizer" ? "active" : ""}
  onClick={() => setSection("summarizer")}
>
  📝 Summarizer
  </button>

    <button
  className={section === "planner" ? "active" : ""}
  onClick={() => setSection("planner")}
>
  📅 Study Planner
</button>

    <button
  className={section === "chat" ? "active" : ""}
  onClick={() => setSection("chat")}
>
  🤖 Chat with PDF
</button>

</div>

    <div className="card">
      {section === "summarizer" && <Summarizer />}
      {section === "planner" && <StudyPlanner />}
      {section === "chat" && <ChatPDF />}
    </div>
  </div>
);
}

export default App;