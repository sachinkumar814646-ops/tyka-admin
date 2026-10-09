import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

export default function AddProductTag() {
  const [tagName, setTagName] = useState("");
  const [status, setStatus] = useState("1");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!tagName.trim()) {
      toast.error("Please enter a tag name", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    const newTag = {
      name: tagName,
      status: parseInt(status),
    };

    // 🔹 SweetAlert Spinner Show
    Swal.fire({
      title: "Saving Product...",
      text: "Please wait while we save your product.",
      allowOutsideClick: false,
      background: "#fff",
      color: "#dc2626", // ❤️ Red text
      didOpen: () => {
        Swal.showLoading();
      },
    });

    fetch("https://tyka.premierhostings.com/beta/api/tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // token from localStorage
      },
      body: JSON.stringify(newTag),
    })
      .then((res) => res.json())
      .then((data) => {
        Swal.close(); // 🔹 Spinner Close
        if (data?.status === true || data?.success) {
          toast.success("Product Tag saved successfully ✅", {
            position: "top-right",
            autoClose: 1000,
          });
          setTimeout(() => {
            navigate("/producttags"); // redirect to /producttags
          }, 2200);
        } else {
          toast.error(data?.message || "Failed to save product tag ❌", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      })
      .catch((err) => {
        Swal.close(); // 🔹 Spinner Close
        console.error("Error saving product tag:", err);
        toast.error("Failed to save product tag ❌", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="max-w-2xl mx-auto dark:bg-gray-900 shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">
        Add Product Tag
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tag Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Tag Name
          </label>
          <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter tag name"
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
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/producttags")}
            className="px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-500 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Save Tag
          </button>
        </div>
      </form>

      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
}
