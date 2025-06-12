import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ Importa o hook
import '../styles/login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ✅ Cria o hook de navegação

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post("http://localhost:8000/api/auth/login/", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access);

      alert("Login realizado com sucesso!");
      navigate("/"); 
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.detail || "Erro ao fazer login");
      } else {
        setError("Erro de conexão");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Entrar</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="login-email">E-mail</label>
          <input
            type="email"
            id="login-email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label htmlFor="login-password">Senha</label>
          <input
            type="password"
            id="login-password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" className="btn-submit">
          Entrar
        </button>
      </form>
      <div className="form-footer">
        <p>
          Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
