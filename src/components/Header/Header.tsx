"use client";

import React from "react";
import Link from "next/link";
import { FiShoppingBag, FiLogIn, FiSearch } from "react-icons/fi";
import "./Header.scss";

const Header = () => {
  return (
    <header className="landing-header">
      <div className="landing-logo">
        <Link href="/">
          Circl<span className="logo-accent">T</span>rade
        </Link>
      </div>
      <div className="header-actions">
        {/* Search button */}
        <Link
          href="/search"
          className="header-link search-btn"
          title="Search Products"
          aria-label="Search"
        >
          <FiSearch className="header-icon" />
        </Link>

        <Link
          href="/signup"
          className="header-link create-store"
          title="Create Store"
        >
          <FiShoppingBag className="header-icon" />
          <span className="header-text">Create store</span>
        </Link>
        <Link href="/login" className="header-link login" title="Login">
          <FiLogIn className="header-icon" />
          <span className="header-text">Login</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
