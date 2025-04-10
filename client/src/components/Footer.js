import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <p>© {currentYear} Illinois Health Facilities and Services Review Board</p>
      </div>
    </footer>
  );
};

export default Footer;