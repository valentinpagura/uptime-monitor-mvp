import { useState, useEffect } from "react";


function App() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/health")  //hace petición HTTP al Backend
      .then((res) => res.json())
      .then((data) => setStatus(data.status))    //promesa que se cumple si todo sale bien
      .catch(err => setStatus('error'));     //promesa que se cumple si hay un error
  }, []);  //el corchete vacío dice "ejecuta esto solo cuando monta"

  return (
    <div>
      <h1>Uptime Monitor MVP</h1>
      <p>Status: {status}</p>
    </div>
  );

}
export default App;