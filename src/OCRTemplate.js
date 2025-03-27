import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { askAI } from "./AIHelper";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function OCRTemplate() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleOCR() {
    if (!image) return;
    setLoading(true);

    try {
      const result = await Tesseract.recognize(image, "eng");
      const extractedText = result.data.text;
      setOcrText(extractedText);

      const prompt = `The following is a raw OCR output of a document:\n\n"${extractedText}"\n\nGenerate a JSON form template with a title and clearly labeled fields. Keep it concise.`;
      const response = await askAI(prompt);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Template not found in response");

      const parsed = JSON.parse(jsonMatch[0]);
      setTemplate(parsed);
    } catch (err) {
      alert("Error generating template: " + err.message);
    }

    setLoading(false);
  }

  async function handleSaveTemplate() {
    if (!template) return;
    setSaving(true);

    try {
      await addDoc(collection(db, "templates"), {
        ...template,
        createdAt: serverTimestamp(),
      });
      alert("Template saved to Firestore ✅");
      setTemplate(null);
      setOcrText("");
      setImage(null);
    } catch (err) {
      alert("Error saving template: " + err.message);
    }

    setSaving(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">OCR Template</h2>
      <p className="mb-4">
        Upload an image of a form or document. We'll extract the text and
        convert it into a reusable template.
      </p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleOCR}
        disabled={loading || !image}
        className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Extract & Generate Template"}
      </button>

      {ocrText && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Extracted Text</h3>
          <pre className="bg-gray-100 p-3 rounded max-h-48 overflow-auto text-sm">
            {ocrText}
          </pre>
        </div>
      )}

      {template && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">AI-Generated Template</h3>
          <pre className="bg-green-100 p-3 rounded text-sm whitespace-pre-wrap">
            {JSON.stringify(template, null, 2)}
          </pre>
          <button
            onClick={handleSaveTemplate}
            disabled={saving}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded"
          >
            {saving ? "Saving..." : "Save to Templates"}
          </button>
        </div>
      )}
    </div>
  );
}
