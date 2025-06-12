import React, { useState } from "react";
import "../styles/login.css";
import axios from "axios";
import { isAuthenticated, getAuthToken } from "../utils/auth";

const Cadastro = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirm: ""
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (formData.password !== formData.password_confirm) {
      setError("As senhas não conferem.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        name: formData.name,            
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm
      });

      if (response.status === 201) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          password: "",
          password_confirm: ""
        });
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.error || "Erro ao cadastrar");
      } else {
        setError("Erro de conexão com o servidor");
      }
    }
  };

  return (
    <div className="register-container" id="register">
      <h2>Cadastrar</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Cadastro realizado com sucesso!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="register-name">Nome</label>
          <input 
            type="text" 
            id="register-name" 
            name="name" 
            value={formData.name}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="input-group">
          <label htmlFor="register-email">E-mail</label>
          <input 
            type="email" 
            id="register-email" 
            name="email" 
            value={formData.email}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="input-group">
          <label htmlFor="register-password">Senha</label>
          <input 
            type="password" 
            id="register-password" 
            name="password" 
            value={formData.password}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="input-group">
          <label htmlFor="register-password-confirm">Confirmar Senha</label>
          <input
            type="password"
            id="register-password-confirm"
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-submit">
          Cadastrar
        </button>
      </form>
      <div className="form-footer">
        <p>
          Já tem uma conta? <a href="/login">Entrar</a>
        </p>
      </div>
    </div>
  );
};

export default Cadastro;