// File: frontend/src/components/Footer.jsx

import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-orange-400 mb-3">
              🛒 NexCart
            </h3>
            <p className="text-gray-400 text-sm">
              Your one-stop shop for everything you need. Quality products at
              the best prices.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-400">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-orange-400">
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-orange-400">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📧 support@nexcart.com</li>
              <li>📞 +91 98765 43210</li>
              <li>📍 Kakinada, Andhra Pradesh</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          © 2026 NexCart. Built with ❤️ using MERN Stack.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
