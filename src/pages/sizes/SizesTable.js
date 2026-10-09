import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import PermissionGuard from "../../components/auth/PermissionGuard";

const SizesTable = () => {
  const [sizes, setSizes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token"); // if your API requires auth

  useEffect(() => {
    fetchSizes();
  }, [currentPage, perPage, searchTerm]);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/product-sizes?page=${currentPage}&perPage=${perPage}&search=${searchTerm}&sortDir=desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setSizes(data.data);
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setTotalItems(data.meta.total || data.data.length);
        }
      } else {
        setSizes([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Error fetching sizes:", err);
      setSizes([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await fetch(
          `https://tyka.premierhostings.com/beta/api/product-sizes/${id}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );
        fetchSizes();
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
        Swal.fire("Deleted!", "Size has been deleted.", "success");
      } catch {
        Swal.fire("Error!", "Failed to delete size.", "error");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("Info", "No sizes selected.", "info");
      return;
    }
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${selectedIds.length} selected sizes?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        await Promise.all(
          selectedIds.map((id) =>
            fetch(
              `https://tyka.premierhostings.com/beta/api/product-sizes/${id}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            )
          )
        );
        fetchSizes();
        setSelectedIds([]);
        Swal.fire("Deleted!", "Selected sizes have been deleted.", "success");
      } catch {
        Swal.fire("Error!", "Failed to delete selected sizes.", "error");
      }
    }
  };

  const handleSelectAll = (e) => {
    const idsOnPage = sizes.map((size) => size.id);
    if (e.target.checked) {
      setSelectedIds([...new Set([...selectedIds, ...idsOnPage])]);
    } else {
      setSelectedIds(selectedIds.filter((id) => !idsOnPage.includes(id)));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold dark:text-white">Sizes</h1>
        <div className="flex gap-2">
          <PermissionGuard permission="bulk_delete_variants_sizes">
            <button
              onClick={handleBulkDelete}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Delete Selected
            </button>
          </PermissionGuard>
          <PermissionGuard permission="create_variants_sizes">
            <button
              onClick={() => navigate("/add-size")}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              <Plus size={18} className="inline mr-2" />
              Add Size
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Top controls */}
      <div className="flex justify-between items-center mb-3 dark:text-white">
        <div>
          Show{" "}
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="border p-1 rounded bg-transparent"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>{" "}
          entries
        </div>
        <div>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-1 rounded bg-transparent"
            style={{ width: "310px" }}
          />
        </div>
      </div>

      {/* Table */}
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-2 border">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  sizes.length > 0 &&
                  sizes.every((s) => selectedIds.includes(s.id))
                }
              />
            </th>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                Loading sizes...
              </td>
            </tr>
          ) : sizes.length > 0 ? (
            sizes.map((size) => (
              <tr key={size.id} className="hover:bg-gray-100">
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(size.id)}
                    onChange={() => handleSelectRow(size.id)}
                  />
                </td>
                <td className="p-2 border dark:text-white">{size.id}</td>
                <td className="p-2 border dark:text-white">{size.name}</td>
                <td className="p-2 border">
                  <span
                    className={
                      size.status === 1 || size.status === true
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {size.status === 1 || size.status === true
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>
                <td className="p-2 border text-center">
                  <PermissionGuard permission="edit_variants_sizes">
                    <button
                      onClick={() => navigate(`/edit-size/${size.id}`)}
                      className="text-blue-500 hover:text-blue-700 mr-3"
                    >
                      <Pencil size={18} />
                    </button>
                  </PermissionGuard>
                  <PermissionGuard permission="delete_variants_sizes">
                    <button
                      onClick={() => handleDelete(size.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </PermissionGuard>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No sizes found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 gap-2 dark:text-white flex-wrap">
        {/* Entries Count */}
        <div>
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
          {totalItems} entries
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {/* First Page Always */}
          <button
            className={`px-3 py-1 border rounded ${currentPage === 1
                ? "bg-red-600 text-white"
                : "bg-transparent dark:text-white"
              }`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>

          {/* Left Dots */}
          {currentPage > 3 && (
            <span className="px-2 flex items-center">...</span>
          )}

          {/* Dynamic Middle Pages */}
          {Array.from({ length: 3 }, (_, i) => {
            const pageNumber = currentPage - 1 + i;
            if (pageNumber > 1 && pageNumber < totalPages) {
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1 border rounded ${currentPage === pageNumber
                      ? "bg-red-600 text-white"
                      : "bg-transparent dark:text-white"
                    }`}
                >
                  {pageNumber}
                </button>
              );
            }
            return null;
          })}

          {/* Right Dots */}
          {currentPage < totalPages - 2 && (
            <span className="px-2 flex items-center">...</span>
          )}

          {/* Last Page Always */}
          {totalPages > 1 && (
            <button
              className={`px-3 py-1 border rounded ${currentPage === totalPages
                  ? "bg-red-600 text-white"
                  : "bg-transparent dark:text-white"
                }`}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </button>
          )}

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SizesTable;
