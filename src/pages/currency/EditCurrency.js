import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Button from "../../components/ui/Button";
import currencySchema from "./validation";
import "react-toastify/dist/ReactToastify.css";

const getFlagEmoji = (countryCode) => {
  return countryCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt()))
    .join("");
};

export default function EditCurrency() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [country, setCountry] = useState("");
  const [flag, setFlag] = useState("");
  const [is_default, setIsDefault] = useState("false");
  const [status, setStatus] = useState("true");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = parseInt(searchParams.get("per_page") || "10", 10);

  useEffect(() => {
    fetch(`https://tyka.premierhostings.com/beta/api/currencies/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const currency = data.data || data;

        setName(currency.name || "");
        setCode(currency.code || "");
        setSymbol(currency.symbol || "");
        setCountry(currency.country || "");
        setFlag(currency.flag || "");
        setIsDefault(currency.is_default?.toString() || "false");
        setStatus(currency.status?.toString() || "true");
      })
      .catch((err) => {
        console.error("Error loading currency:", err);
        toast.error("Failed to load currency details ❌");
      });
  }, [id]);

  const handleUpdate = async (e) => {
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

    const generatedFlag = flag
      ? getFlagEmoji(flag)
      : "";
    const validatedData = result.data;
    console.log("validatedData", validatedData, validatedData.status ? 1 : 0);
    debugger

    try {
      setLoading(true);

      const response = await fetch(
        `https://tyka.premierhostings.com/beta/api/currencies/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...validatedData,
            flag: generatedFlag,
            is_default: validatedData.is_default ? 1 : 0,
            status: validatedData.status ? 1 : 0,
          }),
        }
      );

      const data = await response.json();

      if (data.success || data.id) {
        toast.success(data.message || "Currency updated successfully!");

        setTimeout(() => {
          navigate(`/currency?page=${initialPage}&per_page=${itemsPerPage}`);
        }, 2000);
      } else {
        toast.error(data.message || "Failed to update currency.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto dark:bg-gray-900 shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Edit Currency</h2>

      <form onSubmit={handleUpdate} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}

            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Code (3 uppercase letters) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}

            maxLength={3}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
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
