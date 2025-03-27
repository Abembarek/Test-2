import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export default function TemplatePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const loadTemplate = async () => {
      const docRef = doc(db, "templates", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTemplate(docSnap.data());
      }
    };
    loadTemplate();
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "documents"), {
      ...formData,
      status: "Awaiting Signature",
      createdAt: serverTimestamp(),
    });
    navigate("/documents");
  };

  if (!template) return <p className="p-6">Loading template...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Using: {template.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {(template.fields || []).map((field, idx) => (
          <div key={idx}>
            <label className="block font-semibold mb-1">{field.label}</label>
            <input
              type={field.type || "text"}
              className="w-full border p-2 rounded"
              onChange={(e) => handleChange(field.label, e.target.value)}
              required
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
