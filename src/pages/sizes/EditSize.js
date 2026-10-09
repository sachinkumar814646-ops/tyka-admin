import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditSize() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("1");
  const navigate = useNavigate();

  // Fetch existing size details
  useEffect(() => {
    fetch(`https://tyka.premierhostings.com/beta/api/product-sizes/${id}`)
      .then((res) => res.json())
      .then((resData) => {
        console.log(resData.data[0].name);
        const sizeData = resData.data[0] || {}; // 👈 updated for nested structure
        console.log(sizeData);
        setName(sizeData.name || "");
        setStatus(sizeData.status?.toString() || "1");
      })
      .catch((err) => console.error("Error fetching size:", err));
  }, [id]);

  // Handle update
  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedSize = {
      name,
      status: status === "true" ? 1 : 0,
    };

    fetch(`https://tyka.premierhostings.com/beta/api/product-sizes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSize),
    })
      .then((res) => res.json())
      .then(() => {
        toast.success("Size updated successfully ✅", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/sizes"), 2000);
      })
      .catch(() => {
        toast.error("Failed to update size ❌", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="max-w-2xl mx-auto dark:bg-gray-900 shadow-md rounded-lg p-6 mt-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Edit Size</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Size Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Update Size
        </button>
      </form>
    </div>
  );
}
