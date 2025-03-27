import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export default function TemplatePreview() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [id]);

  async function loadTemplate() {
    const docRef = doc(db, "templates", id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      setTemplate(data);

      const initialData = {};
      (data.fields || []).forEach((field) => {
        initialData[field.name] = "";
      });
      setFormData(initialData);
    }
  }

  function handleChange(fieldName, value) {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await addDoc(collection(db, "documents"), {
      title: template.title,
      content: formData,
      status: "Awaiting Signature",
      createdAt: serverTimestamp(),
    });
    setSubmitted(true);
  }

  if (!template) return <div className="p-6">Loading template...</div>;

  if (submitted)
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Document Created!</h2>
        <p className="mb-4">
          The document based on <strong>{template.title}</strong> has been
          created and added to the Documents page.
        </p>
      </div>
    );

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Fill Out Template</h2>
      <h3 className="text-xl font-semibold mb-4">{template.title}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(template.fields || []).map((field, idx) => (
          <div key={idx}>
            <label className="block font-medium mb-1">{field.label}</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Create Document
        </button>
      </form>
    </div>
  );
}
