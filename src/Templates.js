import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  const templatesRef = collection(db, "templates");

  useEffect(() => {
    async function fetchTemplates() {
      const snapshot = await getDocs(templatesRef);
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTemplates(docs);
      setLoading(false);
    }
    fetchTemplates();
  }, []);

  async function createTemplate() {
    const title = prompt("Enter template name:");
    if (!title) return;

    await addDoc(templatesRef, {
      title,
      createdAt: serverTimestamp(),
    });

    const snapshot = await getDocs(templatesRef);
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTemplates(docs);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Templates</h2>
      <p className="mb-4">
        View and manage reusable templates created from previous documents.
      </p>

      {loading ? (
        <p>Loading templates...</p>
      ) : templates.length === 0 ? (
        <p>No templates yet.</p>
      ) : (
        <ul className="mb-4">
          {templates.map((template) => (
            <li key={template.id} className="mb-2">
              <strong>{template.title}</strong> ReuseEdit
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={createTemplate}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
      >
        + Create New Template
      </button>
    </div>
  );
}
