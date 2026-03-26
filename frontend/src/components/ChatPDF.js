import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function ChatPDF() {
  const [text, setText] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // 📄 PDF Upload
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();

    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;

      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        let pageText = "";
        let lastY = null;

        content.items.forEach((item) => {
          const str = item.str;
          const y = item.transform[5];

          if (lastY !== null && Math.abs(lastY - y) > 10) {
            pageText += "\n";
          }

          pageText += str + " ";
          lastY = y;
        });

        extractedText += pageText.trim() + "\n\n";
      }

      setText(extractedText || "⚠️ No readable text found");
    };

    fileReader.readAsArrayBuffer(file);
  };

  // 🤖 ASK AI
  const handleAsk = async () => {
    if (!question || !text) {
      setAnswer("⚠️ Upload PDF and ask a question");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://studymate-backend.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          question: question,
        }),
      });

      const data = await response.json();

      console.log("CHAT RESPONSE:", data); // ✅ keep log INSIDE function

      setAnswer(data.answer || "⚠️ No response");

    } catch (error) {
      console.error(error);
      setAnswer("⚠️ Cannot connect to backend");
    }

    setLoading(false);
  };

  // 📄 DOWNLOAD ANSWER
  const downloadAnswer = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(answer, 180);
    doc.text(lines, 10, 10);
    doc.save("chat-answer.pdf");
  };

  return (
    <div>
      <h2>🤖 Chat with PDF</h2>

      <label className="upload-btn">
        📄 Upload PDF
        <input type="file" accept=".pdf" onChange={handleFile} hidden />
      </label>

      <br /><br />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="PDF content will appear here"
      ></textarea>

      <br /><br />

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="chat-input"
        placeholder="Ask your question"
      />

      <br /><br />

      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>

      {loading && <p>🤔 Thinking...</p>}

      {answer && !loading && (
        <>
          <button onClick={downloadAnswer}>📄 Download Answer</button>

          <div className="summary-text">
            {answer}
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPDF;