import TemplatePreview from "./TemplatePreview";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./Dashboard.js";
import Templates from "./Templates.js";
import Documents from "./Documents.js";
import OCRTemplate from "./OCRTemplate.js";

export default function App() {
  return (
    <Router>
      <nav className="bg-gray-800 text-white p-4 flex space-x-4">
        <Link to="/">Dashboard</Link>
        <Link to="/templates">Templates</Link>
        <Link to="/documents">Documents</Link>
        <Link to="/ocr">OCR Template</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/ocr" element={<OCRTemplate />} />
        <Route path="/template/:id" element={<TemplatePreview />} />
      </Routes>
    </Router>
  );
}
