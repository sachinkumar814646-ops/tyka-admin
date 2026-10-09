// src/pages/brands/EditBrandPage.jsx
import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ Spinner ke liye import

const API_BASE = "https://tyka.premierhostings.com/beta/api/product-brands";

const EditBrandPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "1", // "1" = Active, "0" = Inactive (mapped from is_active boolean)
    image: null, // file
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Brand ID from route

  // Fetch existing brand data
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true);
        Swal.fire({
          title: "Loading Brand...",
          text: "Please wait while we fetch brand details.",
          allowOutsideClick: false,
          background: "#ffff",
          color: "#dc2626",
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await axios.get(`${API_BASE}/${id}`);
        const brand = res.data.data ?? {};

        setFormData({
          name: brand.brand_name || "",
          slug: brand.slug || "",
          status: brand.is_active ? "1" : "0",
          image: brand.logo,
        });
        setImagePreview(brand.logo || "");
        Swal.close();
      } catch (error) {
        Swal.close();
        console.error("Error fetching brand:", error?.response?.data || error);
        toast.error("Failed to load brand details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [id]);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const regex = /^[A-Za-z\s]*$/;
      if (!regex.test(value)) {
        toast.error("Only letters and spaces allowed in Brand Name.");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({
          ...prev,
          image: base64String,
        }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Brand name is required!");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required!");
      return;
    }

    const updateData = {
      brand_name: formData.name,
      slug: formData.slug,
      is_active: formData.status === "1" ? "1" : "0",
      logo: formData.image,
    };

    try {
      setLoading(true);
      Swal.fire({
        title: "Updating Brand...",
        text: "Please wait while we update brand details.",
        allowOutsideClick: false,
        background: "#ffff",
        color: "#dc2626",
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await axios.put(`${API_BASE}/${id}`, updateData, {
        headers: { "Content-Type": "application/json" },
      });

      Swal.close();
      toast.success("Brand updated successfully!");
      setTimeout(() => navigate("/brands"), 500);
    } catch (error) {
      Swal.close();
      console.error("Error updating brand:", error?.response?.data || error);
      const apiMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update brand.";
      toast.error(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/brands");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-2xl font-bold mb-4 text-red-600">Edit Brand</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-6 rounded-lg shadow-md"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Brand Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter brand name"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Status *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* Brand Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Brand Image
          </label>
          <div className="space-y-3">
            {imagePreview && (
              <div className="flex justify-center">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="h-24 w-24 object-cover rounded-lg border"
                />
              </div>
            )}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 hover:border-red-500 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Brand"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBrandPage;
