import React, { useState } from "react";
import axios from "axios";
import { useNavigate , Link } from "react-router-dom";

const Register = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/register", { email, password });
      localStorage.setItem("token", JSON.stringify(response.data));
      setUser(response.data.token);
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="login">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Register</h1>
        <div className="container">
          <label htmlFor="uname"><b>Username</b></label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="psw"><b>Password</b></label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="forget">
            <a href="">Forget Password?</a>
            <br />
            <Link to="/login">Login</Link>
          </div>
          <button type="submit">Register</button>
        </div>
      </form>
    </div>
  );
};

export default Register;