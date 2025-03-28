import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePad({ onSave }) {
  const sigRef = useRef();

  const clear = () => sigRef.current.clear();

  const save = () => {
    if (sigRef.current.isEmpty()) {
      alert("Please provide a signature first.");
      return;
    }
    const dataURL = sigRef.current.toDataURL("image/png");
    onSave(dataURL); // send back to parent
  };

  return (
    <div className="p-4 border rounded">
      <SignatureCanvas
        penColor="black"
        canvasProps={{
          width: 400,
          height: 150,
          className: "border rounded bg-white",
        }}
        ref={sigRef}
      />
      <div className="mt-2 flex gap-2">
        <button onClick={clear} className="bg-gray-300 px-3 py-1 rounded">
          Clear
        </button>
        <button
          onClick={save}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
}
