import React, { useState, useRef } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

const AddDiscountPage = () => {
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddDiscount = async (e) => {
    e.preventDefault();
    const form = e.target;

    // Basic validation
    if (!form.name.value.trim()) {
      toast.error("Please enter discount name");
      return;
    }
    if (!form.amount.value || Number(form.amount.value) <= 0) {
      toast.error("Please enter a valid discount amount");
      return;
    }
    if (!form.startDate.value) {
      toast.error("Please select a start date");
      return;
    }
    if (!form.endDate.value) {
      toast.error("Please select an end date");
      return;
    }

    const newDiscount = {
      name: form.name.value.trim(),
      type: form.type.value,
      amount: Number(form.amount.value),
      start_date: form.startDate.value,
      end_date: form.endDate.value,
      active: form.active.checked ? 1 : 0,
    };

    try {
      setLoading(true);

      // 🔹 Show SweetAlert Spinner (white + red)
      Swal.fire({
        title: "Saving Discount...",
        text: "Please wait while we save your discount.",
        allowOutsideClick: false,
        background: "#ffffff",
        color: "#dc2626", // ❤️ Red text
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        "https://tyka.premierhostings.com/beta/api/discounts",
        newDiscount,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Swal.close(); // 🔹 Close spinner

      toast.success("Discount added successfully!");

      // Reset form after success
      form.reset();

      // Redirect after short delay
      setTimeout(() => {
        navigate("/discounts");
      }, 500);
    } catch (error) {
      Swal.close(); // 🔹 Close spinner
      console.error("API Error:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to add discount. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-transparent dark:bg-gray-800 rounded-lg shadow-md dark:text-white">
      <h1 className="text-3xl font-semibold mb-6 border-b pb-2 dark:border-gray-700 dark:text-red-500">
        Add New Discount
      </h1>

      <p className="mb-8 text-gray-600 dark:text-gray-300">
        Fill in the details below to create a new discount.
      </p>

      <form onSubmit={handleAddDiscount} className="space-y-6">
        {/* Name & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label
              htmlFor="name"
              className="mb-2 font-medium text-gray-700 dark:text-gray-300"
            >
              Discount Name
            </label>
            <Input
              id="name"
              name="name"
              placeholder="Enter discount name"
              required
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="type"
              className="mb-2 font-medium text-gray-700 dark:text-gray-300"
            >
              Discount Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue="percentage"
              required
              className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
        </div>

        {/* Amount & Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label
              htmlFor="amount"
              className="mb-2 font-medium text-gray-700 dark:text-gray-300"
            >
              Amount
            </label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="Enter discount amount"
              required
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex flex-col dark:text-white">
            <label
              htmlFor="startDate"
              className="mb-2 font-medium text-gray-700 dark:text-gray-300"
            >
              Start Date
            </label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              required
              className="dark:bg-white dark:border-white"
            />
          </div>
        </div>

        {/* End Date & Active Checkbox */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col">
            <label
              htmlFor="endDate"
              className="mb-2 font-medium text-gray-700 dark:text-gray-300"
            >
              End Date
            </label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              required
              className="dark:bg-gray-300 dark:border-gray-200"
            />
          </div>

          <div className="flex items-center space-x-3 mt-6 sm:mt-0">
            <input
              type="checkbox"
              id="active"
              name="active"
              defaultChecked={true}
              className="form-checkbox h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
            />
            <label
              htmlFor="active"
              className="font-medium text-gray-700 dark:text-gray-300 select-none"
            >
              Active
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="px-6"
          >
            Cancel
          </Button>
          <Button type="submit" className="px-6" disabled={loading}>
            Add Discount
          </Button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default AddDiscountPage;
