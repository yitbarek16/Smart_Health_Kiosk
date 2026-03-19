function PatientCard() {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "8px",
      width: "200px"
    }}>
      <h3>Patient Name</h3>
      <p>Age: 25</p>
      <p>Heart Rate: 80 bpm</p>
      <p>Temperature: 36.5°C</p>
    </div>
  );
}

export default PatientCard;