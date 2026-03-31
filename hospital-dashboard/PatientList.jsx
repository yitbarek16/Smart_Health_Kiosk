import PatientCard from "./PatientCard";

function PatientList() {
  const patients = [
    { name: "Abel", age: 28, heartRate: 76, temperature: 36.6 },
    { name: "Sara", age: 24, heartRate: 82, temperature: 37.1 },
    { name: "John", age: 35, heartRate: 79, temperature: 36.8 }
  ];

  return (
    <div>
      {patients.map((p, index) => (
        <PatientCard
          key={index}
          name={p.name}
          age={p.age}
          heartRate={p.heartRate}
          temperature={p.temperature}
        />
      ))}
    </div>
  );
}

export default PatientList;