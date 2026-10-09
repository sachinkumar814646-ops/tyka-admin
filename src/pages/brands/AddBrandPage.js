import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const AddBrandPage = ({ editBrand = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "1", // 1 = Active, 0 = Inactive
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const navigate = useNavigate();

  // Pre-fill when editing
  useEffect(() => {
    if (editBrand) {
      setFormData({
        name: editBrand.name,
        slug: editBrand.slug || "",
        status: editBrand.status?.toString() || "1",
        image: editBrand.image || "",
      });
      setImagePreview(editBrand.image || "");
    } else {
      setFormData({
        name: "",
        slug: "",
        status: "1",
        image: "",
      });
      setImagePreview("");
    }
  }, [editBrand]);

  // Auto-generate slug
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
        toast.error("Name should contain only alphabets and spaces.");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result; // Full base64 string
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

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authorization token not found.");
      return;
    }

    const payload = {
      brand_name: formData.name,
      slug: formData.slug,
      is_active: formData.status,
      logo: formData.image, // Base64 string
    };

    console.log("✅ JSON Payload:", payload);

    try {
      // 🔹 Spinner Show
      Swal.fire({
        title: editBrand ? "Updating Brand..." : "Saving Brand...",
        text: "Please wait while we save your brand.",
        allowOutsideClick: false,
        background: "#ffff",
        color: "#dc2626",
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        "https://tyka.premierhostings.com/beta/api/product-brands",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.close(); // 🔹 Spinner Close

      toast.success(
        editBrand ? "Brand updated successfully!" : "Brand added successfully!"
      );
      if (onSubmit) onSubmit(response.data);

      setTimeout(() => {
        navigate("/brands");
      }, 500);
    } catch (error) {
      Swal.close(); // 🔹 Spinner Close
      const message = error.response?.data?.message || "Something went wrong!";
      toast.error(message);
      console.error("Brand creation error:", error);
    }
  };

  const handleCancel = () => {
    navigate("/brands");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-2xl font-bold mb-4 text-red-600">
        {editBrand ? "Edit Brand" : "Add New Brand"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 p-6 rounded-lg shadow-md"
        encType="multipart/form-data"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Brand Image
          </label>
          <div className="space-y-3">
            {imagePreview && (
              <div className="flex justify-center">
                <img
                  src={imagePreview}
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
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            {editBrand ? "Update Brand" : "Add Brand"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBrandPage;
