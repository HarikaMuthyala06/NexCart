// File: frontend/src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/Loader";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all data for stats
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get("/orders"),
          api.get("/products"),
          api.get("/auth/admin/users"),
        ]);

        const orders = ordersRes.data.orders;
        const products = productsRes.data.products;
        const users = usersRes.data.users;

        setStats({
          totalOrders: orders.length,
          totalProducts: products.length,
          totalUsers: users.length,
          totalRevenue: ordersRes.data.totalRevenue,
          recentOrders: orders.slice(0, 5),
          pendingOrders: orders.filter((o) => o.orderStatus === "Processing")
            .length,
        });
      } catch (err) {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, Admin! 👋</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-orange-500">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">
            ₹{stats?.totalRevenue?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">From all orders</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <p className="text-3xl font-bold text-blue-500 mt-1">
            {stats?.totalOrders || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {stats?.pendingOrders} pending
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Total Products</p>
          <p className="text-3xl font-bold text-green-500 mt-1">
            {stats?.totalProducts || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Active listings</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm">Total Users</p>
          <p className="text-3xl font-bold text-purple-500 mt-1">
            {stats?.totalUsers || 0}
          </p>
          <p className="text-xs text-gray-400 mt-1">Registered users</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/admin/products"
          className="bg-orange-500 text-white rounded-xl p-5 hover:bg-orange-600 transition"
        >
          <p className="text-2xl mb-1">📦</p>
          <p className="font-bold text-lg">Manage Products</p>
          <p className="text-orange-100 text-sm">Add, edit, delete products</p>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-blue-500 text-white rounded-xl p-5 hover:bg-blue-600 transition"
        >
          <p className="text-2xl mb-1">🛒</p>
          <p className="font-bold text-lg">Manage Orders</p>
          <p className="text-blue-100 text-sm">View and update orders</p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-purple-500 text-white rounded-xl p-5 hover:bg-purple-600 transition"
        >
          <p className="text-2xl mb-1">👥</p>
          <p className="font-bold text-lg">Manage Users</p>
          <p className="text-purple-100 text-sm">View all registered users</p>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-orange-500 hover:underline text-sm"
          >
            View all →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left p-3 rounded-l-lg">Order ID</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">
                    {order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-3 font-semibold">
                    ₹{order.totalPrice?.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.orderStatus === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.orderStatus === "Shipped"
                            ? "bg-blue-100 text-blue-700"
                            : order.orderStatus === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
