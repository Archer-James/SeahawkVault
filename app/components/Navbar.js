"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Home, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';  


export default function Navbar() {
  const { userEmail, logout } = useAuth();
  const [isVaultDropdownOpen, setVaultDropdownOpen] = useState(false);
  const [isVideoDropdownOpen, setVideoDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleVaultDropdown = () => {
    setVaultDropdownOpen(prevState => !prevState);
  };

  const toggleVideoDropdown = () => {
    setVideoDropdownOpen(prevState => !prevState);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(prevState => !prevState);
  };

  // Hide @uncw part of email
  const formatUsername = (email) => email.split('@')[0];

  return (
    <nav className="navbar">
      {/* Left Side - Home Icon & Vaults Dropdown */}
      <div className="left">
        <Link href="/" className="home-icon">
          <Home />
        </Link>

        {/* Vaults Dropdown Button */}
        <div
          className="relative"
          onMouseEnter={() => setVaultDropdownOpen(true)} 
          onMouseLeave={() => setVaultDropdownOpen(false)}
        >
          <button className="user-button">
            Vaults <ChevronDown />
          </button>

          {/* Vaults Dropdown Menu */}
          {isVaultDropdownOpen && (
            <div className="dropdown">
              <Link href="/vault" className="dropdown-link" onClick={() => setVaultDropdownOpen(false)}>
                Your Vault
              </Link>
              <Link href="/gradyear" className="dropdown-link" onClick={() => setVaultDropdownOpen(false)}>
                Class Vaults
              </Link>
            </div>
          )}
        </div>

        {/* Video Dropdown Button */}
        <div
          className="relative"
          onMouseEnter={() => setVideoDropdownOpen(true)} 
          onMouseLeave={() => setVideoDropdownOpen(false)}
        >
          <button className="user-button">
            Video <ChevronDown />
          </button>

          {/* Video Dropdown Menu */}
          {isVideoDropdownOpen && (
            <div className="dropdown">
              <Link href="/video" className="dropdown-link" onClick={() => setVideoDropdownOpen(false)}>
                Your Video
              </Link>
              <Link href="/gradvid" className="dropdown-link" onClick={() => setVideoDropdownOpen(false)}>
                Class Video
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - User Controls */}
      <div className="nav-right">
        {userEmail && (
          <div
            className="relative"
            onMouseEnter={() => setUserDropdownOpen(true)} 
            onMouseLeave={() => setUserDropdownOpen(false)}
          >
            {/* Welcome Message Dropdown Button */}
            <button className="user-button">
              Welcome, {formatUsername(userEmail)} <ChevronDown size={18} />
            </button>

            {/* User Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="dropdown">
                <Link
                  href="/GradEdit"
                  className="dropdown-link"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="dropdown-link"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Button if No User */}
        {!userEmail && (
          <Link href="/login">
            <button className="gold-button">Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
