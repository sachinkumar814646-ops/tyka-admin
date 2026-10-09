import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Button from "../../components/ui/Button";
import currencySchema from "./validation";
import "react-toastify/dist/ReactToastify.css";

export default function AddCurrency() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [country, setCountry] = useState("");
  const [flag, setFlag] = useState("");
  const [is_default, setIsDefault] = useState("false");
  const [status, setStatus] = useState("true");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = currencySchema.safeParse({
      name,
      code: code.trim(),
      symbol,
      country,
      flag,
      is_default: is_default === "true",
      status: status === "true",
    });

    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    const validatedData = result.data;

    try {
      setLoading(true);

      const response = await fetch(
        "https://tyka.premierhostings.com/beta/api/currencies",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...validatedData,
            is_default: validatedData.is_default ? 1 : 0,
            status: validatedData.status ? 1 : 0,
          }),
        }
      );

      const data = await response.json();

      if (data.success || data.id) {
        toast.success(data.message || "Currency saved successfully!");
        setTimeout(() => navigate("/currency"), 2000);
      } else {
        toast.error(data.message || "Failed to save currency.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto dark:bg-gray-900 shadow-md rounded-xl p-6 mt-6 dark:text-white border-2 border-gray-300 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 dark:text-white text-textColor border-b-2 border-gray-300 dark:border-gray-700">Add Currency</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter currency name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Code (3 uppercase letters) <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={code}
            onChange={(e) => {
              const value = e.target.value
                .toUpperCase()          // Convert to uppercase
                .replace(/[^A-Z]/g, ""); // Allow only letters

              setCode(value);
            }}

            maxLength={3}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. USD"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Symbol <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}

            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. $"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Country (Optional)
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. India, United States, United Kingdom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Flag <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 🇮🇳, 🇺🇸, 🇬🇧"
          />
        </div>


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

        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Currency"}
        </Button>
      </form>

      <ToastContainer />
    </div>
  );
}
