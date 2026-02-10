import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutGrid, Calculator, History, Users, Leaf } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <div className="navbar-wrapper">
      <nav className="navbar">

        {/* 1. BRAND / LOGO (Left) */}
        <Link to="/" className="nav-logo-link">
          <div className="logo-icon-box">
            <Leaf size={18} strokeWidth={3} />
          </div>
          <span className="logo-text">VegLedger</span>
        </Link>

        {/* 2. NAVIGATION LINKS (Right/Center) */}
        <div className="nav-menu">

          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutGrid />
            <span>Home</span>
          </NavLink>

          <NavLink to="/calculator" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Calculator />
            <span>Entry</span>
          </NavLink>

          <NavLink to="/bills" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <History />
            <span>History</span>
          </NavLink>

          <NavLink to="/clients" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Users />
            <span>Clients</span>
          </NavLink>

        </div>

      </nav>
    </div>
  );
};

export default Navbar;