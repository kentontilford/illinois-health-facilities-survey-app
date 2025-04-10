import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <h2>404</h2>
      <h3>Page Not Found</h3>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="home-link">Return to Home</Link>
    </div>
  );
};

export default NotFound;