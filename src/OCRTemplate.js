import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { askAI } from "./AIHelper";

export default function OCRTemplate() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setOcrText("");
    setSummary("");
  };

  const handleOCR = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const {
      data: { text }
    } = await Tesseract.recognize(selectedFile, "eng", {
      logger: (m) => console.log(m)
    });

    setOcrText(text);

    // Save to Firestore
    const docRef = await addDoc(collection(db, "documents"), {
      title: selectedFile.name,
      content: text,
      status: "Awaiting Signature",
      createdAt: serverTimestamp()
    });

    // Ask AI to summarize full content
    const aiSummary = await askAI(
      `Summarize this document clearly in one paragraph:\n\n${text}`
    );
    setSummary(aiSummary);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">OCR Template</h2>
      <p className="mb-4">Upload an image to extract text and auto-summarize it using AI.</p>

      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
      <button
        onClick={handleOCR}
        disabled={loading || !selectedFile}
        className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Extract & Summarize"}
      </button>

      {ocrText && (
        <div className="mt-4">
          <h3 className="font-semibold">Extracted Text:</h3>
          <pre className="bg-gray-100 p-2 text-sm rounded">{ocrText}</pre>
        </div>
      )}

      {summary && (
        <div className="mt-4">
          <h3 className="font-semibold">AI Summary:</h3>
          <p className="text-sm text-gray-700">{summary}</p>
        </div>
      )}
    </div>
  );
}
