import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddRoles() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [errors, setErrors] = useState({});
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const navigate = useNavigate();

  // Slug auto-generation
  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  useEffect(() => {
    setSlug(generateSlug(name));
  }, [name]);

  // Fetch all paginated permissions
  useEffect(() => {
    const fetchAllPermissions = async () => {
      let allPermissions = [];
      let page = 1;
      let keepFetching = true;

      while (keepFetching) {
        try {
          const res = await fetch(
            `https://tyka.premierhostings.com/beta/api/permissions?page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const data = await res.json();

          if (Array.isArray(data.data) && data.data.length > 0) {
            allPermissions = [...allPermissions, ...data.data];
            page += 1;
          } else {
            keepFetching = false; // no more data
          }
        } catch (error) {
          console.error("Error fetching permissions:", error);
          toast.error("Failed to fetch permissions ❌");
          keepFetching = false;
        }
      }

      setPermissions(allPermissions);
    };

    fetchAllPermissions();
  }, []);

  // Handle individual permission toggle
  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  // Handle select all permissions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allPermissionIds = permissions.map((p) => p.id);
      setSelectedPermissions(allPermissionIds);
    } else {
      setSelectedPermissions([]);
    }
  };

  const isAllSelected =
    permissions.length > 0 && selectedPermissions.length === permissions.length;

  // Improved error parser
  const parseErrors = (data) => {
    const fieldErrors = {};

    if (!data) return fieldErrors;

    // If data has "errors" object (common validation error format)
    if (data.errors && typeof data.errors === "object") {
      for (const key in data.errors) {
        if (data.errors[key].length > 0) {
          fieldErrors[key] = data.errors[key][0]; // first error message for the field
        }
      }
    } else if (typeof data.message === "string") {
      const lowerMessage = data.message.toLowerCase();
      if (lowerMessage.includes("name")) {
        fieldErrors.name = data.message;
      }
      if (lowerMessage.includes("permission")) {
        fieldErrors.permissions = data.message;
      }
      // If message does not specify field errors, set as general
      if (!fieldErrors.name && !fieldErrors.permissions) {
        fieldErrors.general = data.message;
      }
    } else if (typeof data === "string") {
      fieldErrors.general = data;
    }

    return fieldErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const roleData = {
      name,
      slug,
      permissions: selectedPermissions, // array of IDs
    };

    fetch("https://tyka.premierhostings.com/beta/api/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(roleData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setErrors({});
          toast.success(data.message || "Role created successfully!", {
            position: "top-right",
            autoClose: 2000,
          });
          setTimeout(() => {
            navigate("/roles");
          }, 2200);
        } else {
          console.log(data.errors.name);

          const parsedErrors = parseErrors(data);
          setErrors(parsedErrors);
          toast.error(data.errors.name[0] || "Failed to create role ❌", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      })
      .catch((err) => {
        console.error("Error saving role:", err);
        toast.error("Something went wrong ❌", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="max-w-3xl mx-auto dark:bg-gray-900 shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Add Role</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* General error */}
        {errors.general && (
          <p className="text-red-500 mb-4 font-semibold">{errors.general}</p>
        )}

        {/* Role Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Role Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({ ...errors, name: null });
            }}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter role name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            Assign Permissions
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border p-3 rounded-md dark:border-gray-700 bg-white dark:bg-gray-800">
            {/* Select All */}
            <label className="flex items-center space-x-2 col-span-full">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="accent-red-600"
              />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Select All
              </span>
            </label>

            {/* Individual permissions */}
            {permissions.map((permission) => (
              <label
                key={permission.id}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  value={permission.id}
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => handlePermissionToggle(permission.id)}
                  className="accent-red-600"
                />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {permission.name}
                </span>
              </label>
            ))}
          </div>
          {errors.permissions && (
            <p className="text-red-500 text-sm mt-1">{errors.permissions}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Save Role
        </button>
      </form>

      <ToastContainer />
    </div>
  );
}
