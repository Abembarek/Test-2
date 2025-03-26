import { useState } from "react";
import { askAI } from "./AIHelper.js";

export default function Dashboard() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  async function handleAskAI() {
    setLoading(true);
    const response = await askAI(question);
    setAnswer(response);
    if (audioEnabled) speak(response);
    setLoading(false);
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>

      <input
        className="w-full border rounded p-3"
        type="text"
        placeholder="Ask AI about complex terms..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
        onClick={handleAskAI}
      >
        Ask AI
      </button>

      <div className="mt-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={audioEnabled}
            onChange={() => setAudioEnabled(!audioEnabled)}
          />
          <span>Voice Response {audioEnabled ? "On 🔊" : "Off 🔇"}</span>
        </label>
      </div>

      {loading && <p className="mt-4">Loading answer...</p>}

      {answer && (
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <strong className="block mb-2">AI Assistant:</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
