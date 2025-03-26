export default function Templates() {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>Templates</h2>
      <p>View and manage reusable templates created from previous documents.</p>

      <ul>
        <li>
          <strong>Rental Agreement</strong> <button>Reuse</button>
          <button>Edit</button>
        </li>
        <li>
          <strong>Employment Contract</strong> <button>Reuse</button>
          <button>Edit</button>
        </li>
        <li>
          <strong>NDA Form</strong> <button>Reuse</button>
          <button>Edit</button>
        </li>
      </ul>

      <button style={{ marginTop: "1rem" }}>+ Create New Template</button>
    </div>
  );
}
