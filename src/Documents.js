export default function Documents() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Documents</h2>
      <p>Manage your documents awaiting signature or review completed ones.</p>

      <ul>
        <li>
          <strong>Freelance Contract</strong> (Awaiting Signature){" "}
          <button>Remind</button>
        </li>
        <li>
          <strong>HR Onboarding Form</strong> (Signed ✓){" "}
          <button>Download</button>
          <button>Archive</button>
        </li>
      </ul>

      <button style={{ marginTop: "1rem" }}>+ Upload New Document</button>
    </div>
  );
}
