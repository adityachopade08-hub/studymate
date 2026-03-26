from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

# 🔐 Load API key
API_KEY = os.getenv("API_KEY")

# 🔍 DEBUG (VERY IMPORTANT)
print("🚀 API KEY LOADED:", API_KEY)

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "Backend is running!"


# ✅ TEST ROUTE (CHECK API WORKING)
@app.route("/test")
def test():
    if not API_KEY:
        return "❌ API_KEY not found in environment"

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
    if not API_KEY:
        return jsonify({"answer": "❌ API key missing"})

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
            "contents": [{"parts": [{"text": prompt}]}]
        }

        response = requests.post(url, headers=headers, json=body)
        result = response.json()

        if "error" in result:
            print("🔥 API ERROR:", result)
            return jsonify({"answer": "⚠️ AI error / limit reached"})

        answer = result["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        print("🔥 ERROR:", e)
        answer = "⚠️ Server error"

    return jsonify({"answer": answer})


# ✅ SUMMARIZER
@app.route("/summarize", methods=["POST"])
def summarize():
    if not API_KEY:
        return jsonify({"summary": "❌ API key missing"})

    data = request.get_json()
    text = data.get("text", "")
    mode = data.get("mode", "short")

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
            instruction = "Write clean exam revision notes (simple format)."
        else:
            instruction = "Write a clear summary."

        prompt = f"""
You are a professional academic summarizer.

{instruction}

CONTENT:
{text[:5000]}
"""

        body = {
            "contents": [{"parts": [{"text": prompt}]}]
        }

        response = requests.post(url, headers=headers, json=body)
        result = response.json()

        if "error" in result:
            print("🔥 API ERROR:", result)
            return jsonify({"summary": "⚠️ AI error / limit reached"})

        summary = result["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        print("🔥 ERROR:", e)
        summary = "⚠️ Server error"

    return jsonify({"summary": summary})


# ✅ PLANNER
@app.route("/planner", methods=["POST"])
def planner():
    if not API_KEY:
        return jsonify({"plan": "❌ API key missing"})

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

        topic_text = "\n".join([f"{t['name']} ({t['knowledge']}%)" for t in topics])

        prompt = f"""
Create a clean and simple study plan.

Topics:
{topic_text}

Time: {time} {unit}

Focus more on weak topics.
Avoid unnecessary symbols.
"""

        body = {
            "contents": [{"parts": [{"text": prompt}]}]
        }

        response = requests.post(url, headers=headers, json=body)
        result = response.json()

        if "error" in result:
            print("🔥 API ERROR:", result)
            return jsonify({"plan": "⚠️ AI error / limit reached"})

        plan = result["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        print("🔥 ERROR:", e)
        plan = "⚠️ Server error"

    return jsonify({"plan": plan})


if __name__ == "__main__":
    app.run(debug=True)