import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddSize() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("1");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newSize = {
      name,
      status: parseInt(status),
    };

    fetch("https://tyka.premierhostings.com/beta/api/product-sizes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSize),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          toast.success("Size saved successfully ✅", {
            position: "top-right",
            autoClose: 2000,
          });
          setTimeout(() => {
            navigate("/sizes");
          }, 2200);
        } else {
          toast.error(data.message || "Failed to save size ❌", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      })
      .catch((err) => {
        console.error("Error saving size:", err);
        toast.error("Something went wrong ❌", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="max-w-2xl mx-auto dark:bg-gray-900 shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Add Size</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Size Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Size Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter size name (e.g., S, M, L, XL)"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Save Size
        </button>
      </form>

      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
}
