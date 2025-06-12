import React from "react";
import '../styles/login.css'

const Login = () => {
  return (
    <div className="login-container">
      <h2>Entrar</h2>
      <form>
        <div className="input-group">
          <label htmlFor="login-email">E-mail</label>
          <input type="email" id="login-email" name="email" required />
        </div>
        <div className="input-group">
          <label htmlFor="login-password">Senha</label>
          <input type="password" id="login-password" name="password" required />
        </div>
        <button type="submit" className="btn-submit">
          Entrar
        </button>
      </form>
      <div className="form-footer">
        <p>
          Não tem uma conta?{" "}
          <a href="/cadastro">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
