import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/logo.png';

const Header = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo-link">
          <img src={logo} alt="HFSRB Logo" className="logo" />
          <h1>Illinois Health Facilities Survey Processor</h1>
        </Link>
      </div>
    </header>
  );
};

export default Header;