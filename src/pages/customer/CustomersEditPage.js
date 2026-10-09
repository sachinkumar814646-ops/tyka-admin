import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import AddressForm from "./AddressForm";
import Swal from "sweetalert2";
import { ArrowLeft } from "lucide-react";

const API_BASE = "https://tyka.premierhostings.com/beta/api/customers";

export default function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;
  const perpageFromUrl = parseInt(queryParams.get("per_page")) || 1;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load customer and address data
  useEffect(() => {
    if (!id || !token) return;

    setLoading(true);
    axios
      .get(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.data;

        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setGender(data.gender || "");
        setStatus(data.status || "");
        setAddresses(data.address?.data || []);
      })
      .catch((err) => {
        toast.error("Failed to load customer data");
        console.error(err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await axios.put(
        `https://tyka.premierhostings.com/beta/api/users/${id}`,
        { name, email, phone, gender, status, ...(password && { password }) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("Customer updated!");
      } else {
        toast.error(res.data.message || "Customer updated!");
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleAddAddress = () => {
    setFormData({
      name: "",
      line1: "",
      landmark: "",
      pincode: "",
      country: "",
      state: "",
      city: "",
      contact: "",
      addressType: "home",
      id: null,
    });
    setIsModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setFormData({
      id: address.id,
      name: address.name || "",
      line1: address.street || "",
      landmark: address.apartment_suite || "",
      pincode: address.zipcode || "",
      country: address.country?.id || "",
      state: address.state?.id || "",
      city: address.city?.id || "",
      contact: address.phone_number || "",
      addressType: address.address_type || "home",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (address) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this address!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const authToken = localStorage.getItem("authToken");
          await axios.delete(
            `https://tyka.premierhostings.com/beta/api/user-addresses/${address.id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          await refreshAddresses();
          Swal.fire("Deleted!", "Your address has been deleted.", "success");
        } catch (err) {
          Swal.fire("Error!", "Failed to delete address.", "error");
        }
      }
    });
  };

  const refreshAddresses = () => {
    axios
      .get(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAddresses(res.data.data.address?.data || []);
      })
      .catch((err) => {
        console.error("Failed to refresh addresses:", err.message);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading customer data...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
        {/* ✅ Back Button */}
        <button
          onClick={() =>
            navigate(
              `/customers?page=${pageFromUrl}&per_page=${perpageFromUrl}`
            )
          }
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold dark:text-white">Edit Customer</h1>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Name */}
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              Name <span className="text-red-600">*</span>
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />

            {/* Email */}
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              Email <span className="text-red-600">*</span>
            </label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />

            {/* Phone */}
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              Phone <span className="text-red-600">*</span>
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />

            {/* Gender */}
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border rounded p-2 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            {/* Status */}
            <div className="flex items-center">
              <label className="block font-medium text-gray-700 dark:text-gray-200">
                Status
              </label>
              <div className="flex items-center gap-3 pl-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {status === 1 ? "Active" : "Inactive"}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status === 1} // ✅ true if active
                    onChange={(e) => setStatus(e.target.checked ? 1 : 0)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer dark:bg-gray-600 peer-checked:bg-blue-600 transition"></div>
                  <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition peer-checked:translate-x-5"></div>
                </label>
              </div>
            </div>

            {/* Password */}
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10" // space for eye icon
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/customers")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Customer
              </Button>
            </div>
          </form>
        </div>

        {/* Address Section */}
        <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">Addresses</h2>
            <Button onClick={handleAddAddress}>+ Add Address</Button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-gray-500">No addresses found.</p>
          ) : (
            <ul className="space-y-4">
              {addresses.map((addr) => (
                <li
                  key={addr.id}
                  className="p-4 border rounded flex justify-between items-start gap-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold dark:text-white">
                      Name: {addr.name}
                    </p>
                    <p className="font-semibold dark:text-white">
                      Street Name: {addr.street}
                    </p>
                    <p className="font-semibold dark:text-white">
                      Address: {addr.city?.name}, {addr.state?.name},{" "}
                      {addr.country?.name}
                    </p>
                    <p className="font-semibold dark:text-white">
                      Phone Number: {addr.phone_number}
                    </p>
                    <p className="font-semibold dark:text-white">
                      Address Type: {addr.address_type}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => handleEditAddress(addr)}>
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(addr)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {isModalOpen && formData && (
        <AddressForm
          formData={formData}
          setFormData={setFormData}
          id={id}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => {
            setIsModalOpen(false);
            refreshAddresses();
          }}
        />
      )}

      <ToastContainer />
    </>
  );
}
