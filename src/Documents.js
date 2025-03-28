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
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => {
    refreshDocuments();
  }, []);

  async function summarizeDocument(id, title) {
    setSummarizingId(id);
    const prompt = `Summarize the document titled "${title}". Be concise. Then suggest 2-3 tags in lowercase like: ["nda", "contract"]`;
    const result = await askAI(prompt);

    const tagMatch = result.match(/\[(.*?)\]/);
    const tags = tagMatch ? JSON.parse(tagMatch[0]) : [];

    const summaryText = result.split("Then suggest")[0].trim();

    const docRef = doc(db, "documents", id);
    await updateDoc(docRef, { summary: summaryText, tags });

    setSummaries((prev) => ({ ...prev, [id]: summaryText }));
    setSummarizingId(null);
    refreshDocuments();
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
      tags: [],
    });

    refreshDocuments();
  }

  async function toggleSignature(id, currentStatus, title) {
    const newStatus =
      currentStatus === "Signed ✓" ? "Awaiting Signature" : "Signed ✓";

    await updateDoc(doc(db, "documents", id), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "history"), {
      action: `Document "${title}" marked as ${newStatus}`,
      timestamp: serverTimestamp(),
    });

    refreshDocuments();
  }

  async function archiveDocument(id, title) {
    const confirmDelete = confirm("Archive this document?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "documents", id));

    await addDoc(collection(db, "history"), {
      action: `Document "${title}" was archived.`,
      timestamp: serverTimestamp(),
    });

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

  const filteredDocs = activeTag
    ? documents.filter((doc) => doc.tags?.includes(activeTag))
    : documents;

  const allTags = Array.from(
    new Set(documents.flatMap((doc) => doc.tags || []))
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Documents</h2>
      <p className="mb-4">
        Manage your documents awaiting signature or review completed ones.
      </p>

      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1 rounded-full border ${
              activeTag === null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 rounded-full border ${
                activeTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading documents...</p>
      ) : filteredDocs.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <ul className="mb-4 space-y-4">
          {filteredDocs.map((docItem) => (
            <li
              key={docItem.id}
              className="border p-4 rounded shadow-sm bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{docItem.title}</h3>
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

                  {docItem.tags?.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {docItem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-200 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1 ml-4 whitespace-nowrap text-right">
                  <button
                    className="text-purple-600 hover:underline"
                    onClick={() => summarizeDocument(docItem.id, docItem.title)}
                  >
                    {summarizingId === docItem.id
                      ? "Summarizing..."
                      : "🧠 Summarize"}
                  </button>
                  <br />
                  <button
                    className="text-green-600 hover:underline"
                    onClick={() => toggleSignature(docItem.id, docItem.status, docItem.title)}
                  >
                    {docItem.status === "Signed ✓" ? "Unsign" : "Mark Signed"}
                  </button>
                  <br />
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => alert("Download feature coming soon!")}
                  >
                    Download
                  </button>
                  <br />
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => archiveDocument(docItem.id, docItem.title)}
                  >
                    Archive
                  </button>
                </div>
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
