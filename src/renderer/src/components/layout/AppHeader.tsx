// src/renderer/src/components/layout/AppHeader.tsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import "../../styles/AppHeader.css";
import homeIcon from "../icons/home.jpeg";

export function AppHeader() {
  return (
    <header className="appHeader">
      <div className="appHeader__inner">
        <Link to="/" className="appHeader__brand">
          <img
            src={homeIcon}
            alt="Home Page"
            className="appHeader__brandLogo"
            draggable={false}
          />
        </Link>

        <nav className="appHeader__nav">
          <NavLink to="/budgets" className={({ isActive }) => `appHeader__link ${isActive ? "is-active" : ""}`}>
            Budgets
          </NavLink>
          <NavLink to="/funds" className={({ isActive }) => `appHeader__link ${isActive ? "is-active" : ""}`}>
            Funds
          </NavLink>
          <NavLink to="/accounts" className={({ isActive }) => `appHeader__link ${isActive ? "is-active" : ""}`}>
            Accounts
          </NavLink>
        </nav>

        <div className="appHeader__right">
          {/* put settings/user/etc here later */}
        </div>
      </div>
    </header>
  );
}
