// File: frontend/src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold tracking-wide">
            🛒 NexCart
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-orange-200 transition">
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/cart" className="hover:text-orange-200 transition">
                  🛒 Cart
                </Link>
                <Link to="/orders" className="hover:text-orange-200 transition">
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  className="hover:text-orange-200 transition"
                >
                  {user?.name}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="bg-white text-orange-500 px-3 py-1 rounded font-semibold hover:bg-orange-100 transition"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-orange-700 px-4 py-1 rounded hover:bg-orange-800 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-orange-200 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-orange-500 px-4 py-1 rounded font-semibold hover:bg-orange-100 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/cart" onClick={() => setMenuOpen(false)}>
                  Cart
                </Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)}>
                  My Orders
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
