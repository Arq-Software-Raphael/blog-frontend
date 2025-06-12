import React from "react";
import "../styles/login.css";

const Cadastro = () => {
  return (
    <div className="register-container" id="register">
      <h2>Cadastrar</h2>
      <form>
        <div className="input-group">
          <label htmlFor="register-name">Nomeee</label>
          <input type="text" id="register-name" name="name" required />
        </div>
        <div className="input-group">
          <label htmlFor="register-email">E-mail</label>
          <input type="email" id="register-email" name="email" required />
        </div>
        <div className="input-group">
          <label htmlFor="register-password">Senha</label>
          <input type="password" id="register-password" name="password" required />
        </div>
        <div className="input-group">
          <label htmlFor="register-password-confirm">Confirmar Senha</label>
          <input
            type="password"
            id="register-password-confirm"
            name="password_confirm"
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
