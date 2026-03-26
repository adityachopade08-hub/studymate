import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import jsPDF from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function Summarizer() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [mode, setMode] = useState("short");
  const [loading, setLoading] = useState(false);

  // 📄 PDF Upload
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function () {
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

        extractedText += pageText + "\n\n";
      }

      setText(extractedText || "⚠️ No readable text found");
    };

    reader.readAsArrayBuffer(file);
  };

  // 🤖 Generate Summary
  const generateSummary = async () => {
    if (!text) {
      setSummary("⚠️ Enter or upload text");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      const response = await fetch("http://127.0.0.1:5000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, mode }),
      });

      const data = await response.json();

      setSummary(
        data?.summary ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No summary generated"
      );

    } catch (error) {
      console.error(error);
      setSummary("⚠️ Cannot connect to backend");
    }

    setLoading(false);
  };

  // 📄 Download
  const downloadSummary = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(summary, 180);
    doc.text(lines, 10, 10);
    doc.save("summary.pdf");
  };

  return (
    <div>
      <h2>📝 Summarizer</h2>

      <p>Select Summary Type:</p>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="dropdown"
      >
        <option value="short">Short Summary</option>
        <option value="detailed">Detailed Summary</option>
        <option value="exam">Exam Notes</option>
      </select>

      <br /><br />

      <label className="upload-btn">
        📄 Upload PDF
        <input type="file" accept=".pdf" onChange={handleFile} hidden />
      </label>

      <br /><br />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <br /><br />

      <button onClick={generateSummary} disabled={loading}>
        {loading ? "Generating..." : "Generate Summary"}
      </button>

      {loading && <p>⏳ Generating summary...</p>}

      {summary && !loading && (
        <>
          <button onClick={downloadSummary}>📄 Download Summary</button>

          <div className="summary-text">
            {summary.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Summarizer;