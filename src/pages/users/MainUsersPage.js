import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import PermissionGuard from "../../components/auth/PermissionGuard";

const UsersListPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("asc");
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState(null); // pagination meta
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch users with backend pagination
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://tyka.premierhostings.com/beta/api/users?page=${currentPage}&perPage=${usersPerPage}&search=${encodeURIComponent(
          searchTerm,
        )}&sort=${sortOrder}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(res.data?.data ?? []);
      setMeta(res.data?.meta ?? null);
      setTotal(res.data?.meta?.total ?? 0);

      // clear selection for items not on current page
      setSelectedUsers((prev) =>
        prev.filter((id) => (res.data?.data ?? []).some((u) => u.id === id)),
      );
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, usersPerPage, searchTerm, sortOrder]);

  // Delete handlers (same as before)
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `https://tyka.premierhostings.com/beta/api/users/${id}`,
        );
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        console.error("Delete failed", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("No users selected");
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${selectedUsers.length} selected users?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post(
        "https://tyka.premierhostings.com/beta/api/user/bulk-delete",
        { ids: selectedUsers },
      );

      setSelectedUsers([]);
      fetchUsers();

      Swal.fire(
        "Deleted!",
        "Selected users have been deleted successfully.",
        "success",
      );
    } catch (error) {
      console.error("Bulk delete failed", error);
      Swal.fire("Error!", "Failed to delete selected users.", "error");
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length && users.length > 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const areAllOnPageSelected =
    users.length > 0 && users.every((u) => selectedUsers.includes(u.id));

  return (
    <div className="w-full max-w-screen overflow-x-hidden">
      <div className="space-y-4 px-4 py-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">
            User Management
          </h1>
        </div>
      </div>
      <div className="p-4 bg-transparent border-2 shadow-sm rounded-md">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <h2 className="text-2xl font-bold dark:text-white">Users</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <PermissionGuard permission="create_user">
              <button
                onClick={() => navigate("/newuser")}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Add User
              </button>
            </PermissionGuard>

            <PermissionGuard permission="bulk_delete_variants_colors">
              <button
                onClick={handleBulkDelete}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Delete Selected
              </button>
            </PermissionGuard>
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          {/* Left Controls */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Show Entries */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="usersPerPage"
                className="text-lg font-medium text-gray-700"
              >
                Show
              </label>

              <select
                id="usersPerPage"
                value={usersPerPage}
                onChange={(e) => {
                  setUsersPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {[10, 20, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>

              <span className="text-lg text-gray-700">entries</span>
            </div>

            {/* Sort */}
            <div className="flex flex-col">
              <label
                htmlFor="sortOrder"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Sort By :
              </label>

              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col">
            <label
              htmlFor="searchUsers"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Search Users
            </label>

            <input
              id="searchUsers"
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-md px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-white">
            <thead className="text-center">
              <tr className="bg-gray-500 hover:bg-gray-700 text-white">
                <th className="p-2 border">
                  <input
                    type="checkbox"
                    checked={areAllOnPageSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-4">
                    <div className="flex items-center gap-4 animate-pulse">
                      <div className="h-5 w-5 rounded bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-5 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-5 flex-1 rounded bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-5 w-24 rounded bg-gray-300 dark:bg-gray-700"></div>
                      <div className="h-5 w-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                      <div className="flex gap-2 ml-auto">
                        <div className="h-8 w-8 rounded bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-8 w-8 rounded bg-gray-300 dark:bg-gray-700"></div>
                        <div className="h-8 w-8 rounded bg-gray-300 dark:bg-gray-700"></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="text-center border-b odd:bg-white even:bg-gray-100 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <td className="p-3 border">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                      />
                    </td>
                    <td className="p-3 border">{user.name}</td>
                    <td className="p-3 border">{user.email}</td>
                    <td className="p-3 border">{user.phone}</td>
                    <td className="p-3 border">
                      {user.roles?.length
                        ? user.roles.map((role) => role.role_name).join(", ")
                        : "No Roles"}
                    </td>
                    <td className="p-2 border">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 1 || user.status === "1"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status === 1 || user.status === "1"
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="p-2 border space-x-2">
                      <PermissionGuard permission="edit_user">
                        <button
                          onClick={() => navigate(`/view-user/${user.id}`)}
                          className="text-green-500 hover:text-green-700"
                        >
                          <Eye size={16} />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="edit_user">
                        <button
                          onClick={() => navigate(`/edit-user/${user.id}`)}
                          className="text-yellow-500 hover:text-yellow-700"
                        >
                          <Edit size={16} />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="delete_user">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </PermissionGuard>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center dark:text-white p-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-2 mt-2 border-t-2 border-b-2">
            <div className="text-sm md:text-base font-semibold text-gray-600 dark:text-white ml-3">
              Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total ?? 0}{" "}
              entries
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                disabled={meta.current_page === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>

              {/* First Page */}
              <Button
                size="sm"
                variant={meta.current_page === 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>

              {/* Left ellipsis */}
              {meta.current_page > 3 && <span className="px-2">...</span>}

              {/* Middle Pages */}
              {Array.from({ length: 3 }, (_, i) => {
                const pageNumber = meta.current_page - 1 + i;
                if (pageNumber > 1 && pageNumber < meta.last_page) {
                  return (
                    <Button
                      key={pageNumber}
                      size="sm"
                      variant={
                        meta.current_page === pageNumber ? "default" : "outline"
                      }
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                }
                return null;
              })}

              {/* Right ellipsis */}
              {meta.current_page < meta.last_page - 2 && (
                <span className="px-2">...</span>
              )}

              {/* Last Page */}
              {meta.last_page > 1 && (
                <Button
                  size="sm"
                  variant={
                    meta.current_page === meta.last_page ? "default" : "outline"
                  }
                  onClick={() => setCurrentPage(meta.last_page)}
                >
                  {meta.last_page}
                </Button>
              )}

              <Button
                size="sm"
                disabled={meta.current_page === meta.last_page}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, meta.last_page))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersListPage;
