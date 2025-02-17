import Home from "./Home";
import Login from "./Login";
import AddContact from "./AddContact";
import Register from "./Register";
import { useState , useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")).token : false);
  const [email, setEmail] = useState(localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token')).email : "");



  return (
    <div>
      <Routes>
        <Route exact path="/" element={user ? <Home email={email} /> : <Navigate to='/login' />} />
        <Route exact path="/addcontact" element={<AddContact email={email} />} />
        <Route exact path="/login" element={<Login setUser={setUser}/>} />
        <Route exact path="/register" element={<Register setUser={setUser} />} />
      </Routes>
    </div>
  );
};

export default App;
