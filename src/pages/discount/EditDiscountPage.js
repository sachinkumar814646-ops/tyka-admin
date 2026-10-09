import React, { useState, useEffect, useRef } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

const EditDiscountPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "PERCENTAGE",
    amount: "",
    start_date: "",
    end_date: "",
    active: true,
  });

  // Fetch discount details on mount
  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        setLoading(true);

        // 🔹 Show Spinner
        Swal.fire({
          title: "Fetching Discount...",
          text: "Please wait while we load discount details.",
          allowOutsideClick: false,
          background: "#fff",
          color: "#dc2626", // ❤️ Red text
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await axios.get(
          `https://tyka.premierhostings.com/beta/api/discounts/${id}`
        );

        Swal.close(); // 🔹 Close Spinner

        setFormData({
          name: response.data.data.name || "",
          type: response.data.data.type || "PERCENTAGE",
          amount: response.data.data.amount || "",
          start_date: response.data.data.start_date || "",
          end_date: response.data.data.end_date || "",
          active: !!response.data.data.active,
        });
      } catch (error) {
        Swal.close(); // 🔹 Close Spinner on error
        console.error("Error fetching discount:", error);
        toast.error("Failed to fetch discount details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDiscount();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!formData.name.trim()) {
      toast.error("Discount name is required.");
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid discount amount.");
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      toast.error("Start and end date are required.");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Show Spinner
      Swal.fire({
        title: "Updating Discount...",
        text: "Please wait while we save your changes.",
        allowOutsideClick: false,
        background: "#fff",
        color: "#dc2626", // ❤️ Red text
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.put(
        `https://tyka.premierhostings.com/beta/api/discounts/${id}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      Swal.close(); // 🔹 Close Spinner

      toast.success("Discount updated successfully!");
      setTimeout(() => {
        navigate("/discounts");
      }, 500);
    } catch (error) {
      Swal.close(); // 🔹 Close Spinner
      console.error("Update API Error:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to update discount. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-transparent dark:bg-gray-800 rounded-lg shadow-md dark:text-white">
      <h1 className="text-3xl font-semibold mb-6 border-b pb-2 dark:border-gray-700 dark:text-red-500">
        Edit Discount
      </h1>

      {!loading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Discount Name</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter discount name"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Discount Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="border rounded-md p-2"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>
          </div>

          {/* Amount & Start Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="mb-2 font-medium">Amount</label>
              <Input
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter discount amount"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-2 font-medium">Start Date</label>
              <Input
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* End Date & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col">
              <label className="mb-2 font-medium">End Date</label>
              <Input
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center space-x-3 mt-6 sm:mt-0">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <label className="font-medium">Active</label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/discounts")}
              className="px-6"
            >
              Cancel
            </Button>
            <Button type="submit" className="px-6">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      )}
      <ToastContainer />
    </div>
  );
};

export default EditDiscountPage;
