import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import Swal from "sweetalert2";

const API_BASE = "https://tyka.premierhostings.com/beta/api/tags";

const EditProductTagPage = () => {
  const { id } = useParams();
  const [tagName, setTagName] = useState("");
  const [status, setStatus] = useState("active");
  const navigate = useNavigate();

  // 👇 Token from localStorage
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTag = async () => {
      try {
        // 🔹 Spinner Show
        Swal.fire({
          title: "Loading...",
          text: "Fetching tag details",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await axios.get(`${API_BASE}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        Swal.close(); // 🔹 Close spinner

        console.log("GET tag response:", res.data);
        const tag = res.data.data[0];
        setTagName(tag.name || "");
        setStatus(
          tag.status === true || tag.status === "active" ? "active" : "inactive"
        );
      } catch (error) {
        Swal.close(); // 🔹 Close spinner
        toast.error("Failed to load tag details");
        console.error(error.response?.data || error.message);
      }
    };
    fetchTag();
  }, [id, token]);

  const handleEdit = async (e) => {
    e.preventDefault();

    if (!tagName.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    const payload = {
      name: tagName,
      status: status === "active" ? 1 : 0,
    };

    try {
      // 🔹 Spinner Show
      Swal.fire({
        title: "Updating...",
        text: "Please wait while we update the tag.",
        allowOutsideClick: false,
        background: "#fff",
        color: "#dc2626", // ❤️ Red text
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.put(`${API_BASE}/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      Swal.close(); // 🔹 Spinner Close

      console.log("PUT update tag response:", res.data);
      toast.success("Tag updated successfully!");
      setTimeout(() => navigate("/producttags"), 900);
    } catch (error) {
      Swal.close(); // 🔹 Spinner Close
      console.error(
        "Error updating tag:",
        error.response?.data || error.message
      );
      toast.error("Failed to update tag");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 dark:bg-gray-900">
      <div className="max-w-xl mx-auto dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Edit Product Tag
        </h1>
        <form onSubmit={handleEdit} className="space-y-4">
          {/* Tag Name */}
          <div>
            <label
              htmlFor="tagName"
              className="block mb-1 font-medium dark:text-gray-300"
            >
              Tag Name
            </label>
            <input
              id="tagName"
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block mb-1 font-medium dark:text-gray-300"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/producttags")}
              className="px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-500 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              Update Tag
            </button>
          </div>
        </form>
      </div>
      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
};

export default EditProductTagPage;
