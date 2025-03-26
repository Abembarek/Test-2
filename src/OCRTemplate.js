import { useState } from "react";
import Tesseract from "tesseract.js";
import { askAI } from "./AIHelper.js";

export default function OCRTemplate() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [template, setTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleOCR() {
    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const {
        data: { text },
      } = await Tesseract.recognize(selectedFile, "eng");
      const prompt = `
        Create a structured form template from this text.
        Identify form fields clearly:

        "${text}"
      `;
      const aiGeneratedTemplate = await askAI(prompt);
      setTemplate(aiGeneratedTemplate);
    } catch (e) {
      setError(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-4">AI-Generated Template</h2>

      <input
        className="block w-full"
        type="file"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />

      <button
        className="mt-4 bg-green-600 text-white py-2 px-4 rounded"
        onClick={handleOCR}
      >
        Generate Template
      </button>

      {loading && <p className="mt-4">Generating...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {template && (
        <div className="mt-6 bg-gray-100 p-4 rounded whitespace-pre-wrap">
          <strong>Template:</strong>
          <pre>{template}</pre>
        </div>
      )}
    </div>
  );
}
