from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

import os
API_KEY = os.getenv("API_KEY")

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend is running!"

# ✅ TEST
@app.route("/test")
def test():
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
    }

    data = {
        "contents": [
            {"parts": [{"text": "Say hello in one line"}]}
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    return response.text


# ✅ CHAT
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    text = data.get("text", "")
    question = data.get("question", "")

    if not text or not question:
        return jsonify({"answer": "⚠️ Missing data"})

    try:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY
        }

        prompt = f"""
Answer ONLY from the content.

CONTENT:
{text[:3000]}

QUESTION:
{question}

Give a clear answer in 3-4 lines.
"""

        body = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }

        response = requests.post(url, headers=headers, json=body)
        result = response.json()

        # 🔥 Handle quota error
        if "error" in result:
            return jsonify({"answer": "⚠️ AI limit reached. Try later."})

        answer = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "⚠️ No response")

    except Exception as e:
        print("🔥 ERROR:", e)
        answer = "⚠️ AI error"

    return jsonify({"answer": answer})


# ✅ SUMMARIZER
@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    text = data.get("text", "")
    mode = data.get("mode", "short")   # ✅ FIXED

    if not text:
        return jsonify({"summary": "⚠️ No text provided"})

    try:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY
        }

        if mode == "short":
            instruction = "Write a short summary in 1-2 paragraphs."

        elif mode == "detailed":
            instruction = "Write a detailed summary in 3-4 paragraphs."

        elif mode == "exam":
            instruction = "Write exam revision notes in simple format."

        else:
            instruction = "Write a clear summary."

        prompt = f"""
You are a professional academic summarizer.

{instruction}

CONTENT:
{text[:5000]}
"""

        body = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }

        response = requests.post(url, headers=headers, json=body)
        result = response.json()

        if "error" in result:
            return jsonify({"summary": "⚠️ AI limit reached. Try later."})

        summary = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "⚠️ No summary")

    except Exception as e:
        print("🔥 ERROR:", e)
        summary = "⚠️ AI error"

    return jsonify({"summary": summary})


# ✅ PLANNER
@app.route("/planner", methods=["POST"])
def planner():
    data = request.get_json()
    topics = data.get("topics", [])
    time = data.get("time", "")
    unit = data.get("unit", "")

    if not topics or not time:
        return jsonify({"plan": "⚠️ Missing data"})

    try:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY
        }

        topic_text = ""
        for t in topics:
            topic_text += f"{t['name']} ({t['knowledge']}%)\n"

        prompt = f"""
Create a simple and clean study plan.

Topics:
{topic_text}

Time: {time} {unit}

Prioritize weak topics first.
"""

        body = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }

        response = requests.post(url, headers=headers, json=body)
        result = response.json()

        if "error" in result:
            return jsonify({"plan": "⚠️ AI limit reached. Try later."})

        plan = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "⚠️ No plan")

    except Exception as e:
        print("🔥 ERROR:", e)
        plan = "⚠️ AI error"

    return jsonify({"plan": plan})


if __name__ == "__main__":
    app.run(debug=True)