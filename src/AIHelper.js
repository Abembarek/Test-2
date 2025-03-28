import axios from "axios";
import jsPDF from "jspdf";

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export async function askAI(prompt) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    },
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.choices[0].message.content.trim();
}

export function exportSummariesToPDF(documents) {
  const doc = new jsPDF();
  let y = 20;

  documents.forEach((item, index) => {
    doc.setFontSize(14);
    doc.text(`${index + 1}. ${item.title}`, 10, y);
    y += 8;

    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(`Summary: ${item.summary}`, 180);
    summaryLines.forEach((line) => {
      doc.text(line, 10, y);
      y += 6;
    });

    if (item.tags?.length) {
      const tagLine = `Tags: ${item.tags.join(", ")}`;
      const tagLines = doc.splitTextToSize(tagLine, 180);
      tagLines.forEach((line) => {
        doc.text(line, 10, y);
        y += 6;
      });
    }

    y += 10;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("summaries.pdf");
}
