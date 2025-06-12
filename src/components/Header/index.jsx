import React from 'react';
import './Header.css'

const Header = () => {
  return (
    <header>
      <div className="logo">MeuBlog</div>
      <nav>
        <a href="/">Início</a>
        <a href="/login">Entrar</a>
      </nav>
    </header>
  );
};

export default Header;
