import "./PatientCard.css";
function PatientCard({ name, age, heartRate, temperature }) {
  return (
    <div className="patient-card">
      <h3>{name}</h3>
      <p>Age: {age}</p>
      <p>Heart Rate: {heartRate} bpm</p>
      <p>Temperature: {temperature}°C</p>
    </div>
  );
}

export default PatientCard;