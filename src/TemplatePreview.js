import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function TemplatePreview() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchTemplate() {
      const snapshot = await getDoc(doc(db, "templates", id));
      if (snapshot.exists()) {
        setTemplate(snapshot.data());
      }
    }

    fetchTemplate();
  }, [id]);

  function handleChange(e, fieldName) {
    setFormData({ ...formData, [fieldName]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitted data:", formData);
    setSubmitted(true);
  }

  if (!template) return <p className="p-4">Loading template...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{template.title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {template.fields?.map((field, index) => (
          <div key={index}>
            <label className="block font-medium">{field.label}</label>
            <input
              type={field.type || "text"}
              value={formData[field.label] || ""}
              onChange={(e) => handleChange(e, field.label)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        ))}

        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>

      {submitted && (
        <div className="mt-4 text-green-600 font-medium">
          ✅ Form submitted! (Check console for data)
        </div>
      )}
    </div>
  );
}
