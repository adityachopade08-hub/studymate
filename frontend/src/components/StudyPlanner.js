import React, { useState } from "react";
import jsPDF from "jspdf";

function StudyPlanner() {
  const [topics, setTopics] = useState([{ name: "", knowledge: "" }]);
  const [time, setTime] = useState("");
  const [unit, setUnit] = useState("Minutes");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTopicCount = (e) => {
    const count = parseInt(e.target.value) || 1;

    const newTopics = [];
    for (let i = 0; i < count; i++) {
      newTopics.push({ name: "", knowledge: "" });
    }
    setTopics(newTopics);
  };

  const handleTopicChange = (index, field, value) => {
    const updated = [...topics];
    updated[index][field] = value;
    setTopics(updated);
  };

  const generatePlan = async () => {
    if (!topics.length || !time) {
      setPlan("⚠️ Enter topics and time");
      return;
    }

    setLoading(true);
    setPlan("");

    try {
      const response = await fetch("https://studymate-backend-rz3z.onrender.com/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topics, time, unit }),
      });

      const data = await response.json();

      setPlan(
        data?.plan ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ No plan generated"
      );

    } catch (error) {
      console.error(error);
      setPlan("⚠️ Cannot connect to backend");
    }

    setLoading(false);
  };

  const downloadPlan = () => {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(plan, 180);
    doc.text(lines, 10, 10);
    doc.save("study-plan.pdf");
  };

  return (
    <div>
      <h2>📅 Study Planner</h2>

      <input
        type="number"
        placeholder="Number of Topics"
        onChange={handleTopicCount}
      />

      <br /><br />

      {topics.map((topic, index) => (
        <div key={index} className="topic-card">
          <h4>Topic {index + 1}</h4>

          <input
            placeholder="Topic Name"
            value={topic.name}
            onChange={(e) =>
              handleTopicChange(index, "name", e.target.value)
            }
          />

          <br />

          <input
            type="number"
            placeholder="% Knowledge"
            value={topic.knowledge}
            onChange={(e) => {
              let val = Number(e.target.value);
              if (val > 100) val = 100;
              if (val < 0) val = 0;
              handleTopicChange(index, "knowledge", val);
            }}
          />
        </div>
      ))}

      <br />

      <input
        type="number"
        placeholder="Total Time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <select
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        className="dropdown"
      >
        <option>Minutes</option>
        <option>Hours</option>
        <option>Days</option>
        <option>Weeks</option>
      </select>

      <br /><br />

      <button onClick={generatePlan} disabled={loading}>
        {loading ? "Planning..." : "Generate Plan"}
      </button>

      {loading && <p>📊 Creating your study plan...</p>}

      {plan && !loading && (
        <>
          <button onClick={downloadPlan}>📄 Download Plan</button>

          <div className="summary-text">
            {plan.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default StudyPlanner;