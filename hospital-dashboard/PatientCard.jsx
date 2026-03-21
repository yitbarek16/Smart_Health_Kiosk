function PatientCard({ name, age, heartRate, temperature }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "10px",
      borderRadius: "8px",
      width: "200px"
    }}>
      <h3>{name}</h3>
      <p>Age: {age}</p>
      <p>Heart Rate: {heartRate} bpm</p>
      <p>Temperature: {temperature}°C</p>
    </div>
  );
}

export default PatientCard;