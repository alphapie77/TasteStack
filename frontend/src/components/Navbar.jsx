// Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  const navStyle = {
    backgroundColor: '#e5e7eb', // Light gray background
    borderBottom: '1px solid #d1d5db',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    padding: '0.75rem 1rem'
  };

  const baseLinkStyle = {
    color: '#1e3a8a', // Navy text for TasteStack
    transition: 'all 0.3s ease',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block'
  };

  const handleMouseOver = (e) => {
    e.target.style.backgroundColor = '#d1d5db'; // Gray hover background
    e.target.style.color = '#1e3a8a';
    e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    e.target.style.transform = 'scale(1.05)';
  };

  const handleMouseOut = (e) => {
    e.target.style.backgroundColor = 'transparent';
    e.target.style.color = '#1e3a8a';
    e.target.style.boxShadow = 'none';
    e.target.style.transform = 'scale(1)';
  };

  return (
    <nav className="navbar navbar-expand-lg" style={navStyle}>
      <div className="container">
        <Link
          className="navbar-brand fw-bold fs-4"
          to="/"
          style={baseLinkStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          TasteStack
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/"
                style={baseLinkStyle}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/auth"
                style={baseLinkStyle}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link"
                to="/about"
                style={baseLinkStyle}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

/* Add to App.css or index.css for responsiveness and hover effects */
/*

*/
