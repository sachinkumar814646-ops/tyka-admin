import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import PermissionGuard from "../../components/auth/PermissionGuard";

export default function RoleTable() {
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [links, setLinks] = useState([]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const navigate = useNavigate();

  const fetchRoles = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/roles?page=${pageNum}&perPage=${perPage}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setRoles(data.data);
        if (data.meta) {
          setCurrentPage(data.meta.current_page);
          setTotalPages(data.meta.last_page);
          setTotalItems(data.meta.total);
          setLinks(data.meta.links);
          setFrom(data.meta.from);
          setTo(data.meta.to);
        }
      } else {
        setRoles([]);
        toast.error("Failed to fetch roles.");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Error fetching roles ❌");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles(currentPage);
  }, [currentPage, perPage, searchTerm]);

  const handleDelete = async (roleId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This role will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/roles/${roleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (data.status) {
        Swal.fire("Deleted!", "Role deleted successfully.", "success");
        fetchRoles(currentPage);
      } else {
        Swal.fire(
          "Error!",
          data.message || "Failed to delete role ❌",
          "error"
        );
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      Swal.fire("Error!", "Error deleting role ❌", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRoles.length === 0) {
      Swal.fire("Warning", "Please select at least one role!", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Selected roles will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(
        "https://tyka.premierhostings.com/beta/api/role/bulk-delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ids: selectedRoles }),
        }
      );
      const data = await res.json();
      if (data.status) {
        Swal.fire(
          "Deleted!",
          "Selected roles deleted successfully.",
          "success"
        );
        setSelectedRoles([]);
        fetchRoles(currentPage);
      } else {
        Swal.fire("Error!", data.message || "Bulk delete failed ❌", "error");
      }
    } catch (error) {
      console.error("Error bulk deleting roles:", error);
      Swal.fire("Error!", "Error deleting roles ❌", "error");
    }
  };

  const toggleSelectRole = (id) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRoles.length === roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(roles.map((r) => r.id));
    }
  };

  return (
    <div className="w-full max-w-screen overflow-x-hidden">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">
        Role Management
      </h1>
    <div className="mx-auto p-6 dark:bg-gray-900 rounded-lg shadow-md mt-6 border">
      
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Roles</h2>

      <div className="max-w-6xl flex justify-end mb-4 gap-2">
        <PermissionGuard permission="create_role">
          <button
            onClick={() => navigate("/add-roles")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Add New Role
          </button>
        </PermissionGuard>
        <PermissionGuard permission="view_role">
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Bulk Delete
          </button>
        </PermissionGuard>
      </div>

      <div className="flex justify-between items-center mb-3 dark:text-white">

        <div className="dark:text-white">
  <label className="text-lg font-medium text-gray-700 dark:text-white mr-2">
    Show
  </label>

  <select
            value={perPage}
            onChange={(e) => {
              setPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
    className="border border-gray-300 dark:border-slate-500 dark:bg-slate-600 dark:text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
  >
    {[10, 20, 50, 100].map((num) => (
      <option key={num} value={num}>
        {num}
      </option>
    ))}
  </select>

  <span className="text-lg font-semibold text-gray-700 dark:text-white ml-2">
    entries
  </span>
</div>
        <div>
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded bg-transparent px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            style={{ width: "310px" }}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-white">Loading roles...</p>
      ) : roles.length === 0 ? (
        <p className="text-white">No roles found.</p>
      ) : (
        <>
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="py-3 px-6 text-left text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={
                      roles.length > 0 && selectedRoles.length === roles.length
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-3 px-6 text-left text-gray-700 dark:text-gray-200">
                  Name
                </th>
                <th className="py-3 px-6 text-left text-gray-700 dark:text-gray-200">
                  Permissions
                </th>
                <th className="py-3 px-6 text-left text-gray-700 dark:text-gray-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-6">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => toggleSelectRole(role.id)}
                    />
                  </td>
                  <td className="py-3 px-6 text-gray-800 dark:text-gray-200">
                    {role.name}
                  </td>
                  <td className="py-3 px-6 text-gray-800 dark:text-gray-200">
                    {Array.isArray(role.permissions) &&
                      role.permissions.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {role.permissions.map((perm) => (
                          <div
                            key={perm.id}
                            className="overflow-hidden max-w-full"
                          >
                            <span className="block whitespace-nowrap overflow-hidden text-ellipsis bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 border border-blue-500 px-3 py-1 rounded-full text-sm text-center">
                              {perm.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-6 flex space-x-2">
                    <PermissionGuard permission="edit_role">
                      <button
                        onClick={() => navigate(`/edit-roles/${role.id}`)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Edit
                      </button>
                    </PermissionGuard>
                    <PermissionGuard permission="remove_role">
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                      >
                        Delete
                      </button>
                    </PermissionGuard>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination + Info */}
          <div className="flex justify-between items-center mt-4 gap-2 dark:text-white flex-wrap border-b-2 border-t-2 py-3">
            <div>
              Showing {from || 0} to {to || 0} of {totalItems} entries
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {links.map((link, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 border rounded ${link.active
                      ? "bg-red-600 text-white"
                      : "bg-transparent dark:text-white"
                    }`}
                  onClick={() => link.page && setCurrentPage(link.page)}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <ToastContainer />
    </div>
    </div>
  );
}
