import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roles: [],
    gender: "",
    address: "",
    country: "",
    state: "",
    city: "",
    zipcode: "",
    longitude: "",
    latitude: "",
    status: "active",
    user_type: "",
  });

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [roles, setRoles] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://tyka.premierhostings.com/beta/api/roles",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setRoles(data.data || []);
        } else {
          toast.error(data.message || "Failed to fetch roles");
        }
      } catch (error) {
        toast.error("Error fetching roles");
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation not supported by browser.");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, options, multiple } = e.target;

    if (multiple) {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);

      setFormData((prev) => ({
        ...prev,
        [name]: selectedValues,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authorization token not found!");
        return;
      }

      let base64Image = "";

      if (image) {
        base64Image = await toBase64(image);
      }

      // ✅ Custom validation messages
      const fieldErrorMessages = {
        name: "Please enter your full name.",
        phone: "Please enter your phone number.",
        email: "Please enter your email address.",
        user_type: "Please select the user type.",
        gender: "Please select your gender.",
        status: "Please select the user status.",
      };

      // ✅ Validate fields before API call
      for (const key in fieldErrorMessages) {
        const value = formData[key];
        if (!value || value.toString().trim() === "") {
          toast.error(fieldErrorMessages[key], {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored", // you can also use "light" or "dark"
          });
          return; // stop further execution
        }
      }

      const jsonData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        roles: [formData.roles],
        gender: formData.gender,
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        zipcode: formData.zipcode,
        longitude: longitude,
        latitude: latitude,
        status: formData.status,
        user_type: formData.user_type,
        avatar: base64Image,
      };

      const res = await fetch(
        "https://tyka.premierhostings.com/beta/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jsonData),
        }
      );

      const result = await res.json();

      if (result.success) {
        toast.success("User created successfully!");
        setTimeout(() => navigate("/user"), 1500);
      } else {
        toast.error(result.message || "Failed to create user.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      roles: "",
      gender: "",
      address: "",
      country: "",
      state: "",
      city: "",
      zipcode: "",
      longitude: "",
      latitude: "",
      status: "active",
      user_type: "",
    });
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto dark:bg-transparent">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-red-600">USER</h1>
      <p className="text-gray-500">New User</p>
      <hr className="my-2 border-gray-300" />

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-transparent"
        autoComplete="off"
      >
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
          />
        </div>
        {/* {/* Roles  */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Role
          </label>
          <select
            name="roles"
            value={formData.roles}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            name="email"
            autoComplete="off"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
          />
        </div>
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <PhoneInput
            country={"in"}
            value={formData.phone}
            onChange={(phone) => setFormData({ ...formData, phone })}
            inputClass="!w-full !py-2 !px-10"
            inputStyle={{
              borderRadius: "0.375rem",
              width: "100%",
              backgroundColor: "transparent",
            }}
            buttonStyle={{ backgroundColor: "transparent", border: "none" }}
            containerStyle={{ width: "100%" }}
          />
        </div>
        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Password <span className="text-red-600">*</span>
          </label>
          <input
            type="password"
            name="password"
            autoComplete="off"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
          />
        </div>
        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Gender <span className="text-red-600">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>
        </div>
        {/* Upload Image */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            name="avatar"
            onChange={handleImageChange}
            className="w-full border p-2 rounded dark:bg-transparent dark:text-white"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mt-2 h-24 w-24 object-cover rounded"
            />
          )}
        </div>
        {/* User Type */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            User Type <span className="text-red-600">*</span>
          </label>
          <select
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
          >
            <option value="">Select Type</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
            <option value="Seller">Seller</option>
          </select>
        </div>
        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-white">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 dark:bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        {/* Buttons */}
        <div className="md:col-span-2 flex gap-4 mt-4">
          <button
            type="submit"
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewUser;
