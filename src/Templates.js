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
  // Edit template title
  async function editTemplate(id, currentTitle) {
    const newTitle = prompt("Edit template name:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    await setDoc(doc(db, "templates", id), {
      title: newTitle,
      updatedAt: serverTimestamp(),
    });

    refreshTemplates();
  }

  // Delete template
  async function deleteTemplate(id) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this template?"
    );
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "templates", id));
    refreshTemplates();
  }

  // Refresh templates after add/edit/delete
  async function refreshTemplates() {
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
        <ul className="mb-4 space-y-2">
          {templates.map((template) => (
            <li
              key={template.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <strong>{template.title}</strong>
              <div className="space-x-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => alert(`Reuse "${template.title}"`)}
                >
                  Reuse
                </button>
                <button
                  className="text-yellow-600 hover:underline"
                  onClick={() => editTemplate(template.id, template.title)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => deleteTemplate(template.id)}
                >
                  Delete
                </button>
              </div>
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
