import { askAI } from "./AIHelper";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const documentsRef = collection(db, "documents");
  const [summaries, setSummaries] = useState({});
  const [summarizingId, setSummarizingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedSummary, setEditedSummary] = useState("");

  useEffect(() => {
    refreshDocuments();
  }, []);

  async function summarizeDocument(id, title) {
    setSummarizingId(id);
    const prompt = `Summarize what this document titled "${title}" is likely about. Be clear and concise.`;
    const summary = await askAI(prompt);
    setSummaries((prev) => ({ ...prev, [id]: summary }));

    const docRef = doc(db, "documents", id);
    await updateDoc(docRef, { summary });
    setSummarizingId(null);
  }

  async function refreshDocuments() {
    const snapshot = await getDocs(documentsRef);
    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDocuments(docs);
    setLoading(false);
  }

  async function uploadDocument() {
    const title = prompt("Enter document title:");
    if (!title) return;

    await addDoc(documentsRef, {
      title,
      status: "Awaiting Signature",
      createdAt: serverTimestamp(),
    });

    refreshDocuments();
  }

  async function toggleSignature(id, currentStatus) {
    const newStatus =
      currentStatus === "Signed ✓" ? "Awaiting Signature" : "Signed ✓";

    await updateDoc(doc(db, "documents", id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    refreshDocuments();
  }

  async function archiveDocument(id) {
    const confirmDelete = confirm("Archive this document?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "documents", id));
    refreshDocuments();
  }

  async function handleSaveSummary(id) {
    try {
      const docRef = doc(db, "documents", id);
      await updateDoc(docRef, { summary: editedSummary });
      setEditingId(null);
      refreshDocuments();
    } catch (error) {
      console.error("Error saving summary:", error);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Documents</h2>
      <p className="mb-4">
        Manage your documents awaiting signature or review completed ones.
      </p>

      {loading ? (
        <p>Loading documents...</p>
      ) : documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {documents.map((docItem) => (
            <li
              key={docItem.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div className="flex-1 pr-4">
                {editingId === docItem.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      rows={4}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveSummary(docItem.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-300 px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  docItem.summary && (
                    <div className="mt-2 text-sm text-gray-700">
                      <strong>Summary:</strong> {docItem.summary}
                      <button
                        onClick={() => {
                          setEditedSummary(docItem.summary);
                          setEditingId(docItem.id);
                        }}
                        className="text-blue-600 text-xs ml-2 underline"
                      >
                        Edit
                      </button>
                    </div>
                  )
                )}
              </div>

              <div className="space-x-2 whitespace-nowrap">
                <button
                  className="text-purple-600 hover:underline"
                  onClick={() => summarizeDocument(docItem.id, docItem.title)}
                >
                  {summarizingId === docItem.id
                    ? "Summarizing..."
                    : "🧠 Summarize"}
                </button>
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => toggleSignature(docItem.id, docItem.status)}
                >
                  {docItem.status === "Signed ✓" ? "Unsign" : "Mark Signed"}
                </button>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => alert("Download feature coming soon!")}
                >
                  Download
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => archiveDocument(docItem.id)}
                >
                  Archive
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={uploadDocument}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded"
      >
        + Upload New Document
      </button>
    </div>
  );
}
