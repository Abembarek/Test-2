import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function TemplatePreview() {
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const ref = doc(db, "templates", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (!Array.isArray(data.fields)) {
            setError("Template fields are missing or not an array.");
            return;
          }
          setTemplate({ id: snap.id, ...data });
        } else {
          setError("Template not found.");
        }
      } catch (err) {
        console.error("Error fetching template:", err);
        setError("Failed to load template.");
      }
    }
    fetchTemplate();
  }, [id]);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await addDoc(collection(db, "documents"), {
        title: template.title,
        fields: formData,
        status: "Awaiting Signature",
        createdAt: serverTimestamp(),
      });
      navigate("/documents");
    } catch (err) {
      console.error("Error creating document:", err);
      setError("Failed to create document.");
    }
  }

  async function handleDownloadPDF() {
    const element = document.getElementById("template-preview");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${template.title || "document"}.pdf`);
  }

  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto" id="template-preview">
      <h2 className="text-2xl font-bold mb-4">
        Using: {template?.title || "Loading..."}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(template?.fields || []).map((field, idx) => {
          const label = typeof field === "string" ? field : field.label;
          const type = typeof field === "string" ? "text" : field.type || "text";
          return (
            <div key={idx}>
              <label className="block font-semibold mb-1">{label}</label>
              <input
                type={type}
                value={formData[label] || ""}
                onChange={(e) => handleChange(label, e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          );
        })}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Create Document
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Download as PDF
          </button>
        </div>
      </form>
    </div>
  );
}
