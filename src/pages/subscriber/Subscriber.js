import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

const SubscribersTable = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // agar auth chahiye

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, perPage, searchTerm]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/subscribers?page=${currentPage}&perPage=${perPage}&search=${searchTerm}&sortDir=desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        let filtered = data.data;
        if (searchTerm) {
          filtered = filtered.filter(
            (s) =>
              s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setSubscribers(filtered);
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setTotalItems(data.meta.total || filtered.length);
        }
      } else {
        setSubscribers([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Error fetching subscribers:", err);
      setSubscribers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // single delete
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this subscriber?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await fetch(
          `https://tyka.premierhostings.com/beta/api/subscribers/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        fetchSubscribers();
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
        Swal.fire("Deleted!", "Subscriber has been deleted.", "success");
      } catch {
        Swal.fire("Error!", "Failed to delete subscriber.", "error");
      }
    }
  };

  // bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("Info", "No subscribers selected.", "info");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${selectedIds.length} subscribers?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `https://tyka.premierhostings.com/beta/api/subscriber/bulk-delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: selectedIds }),
          }
        );

        // Check status
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("Bulk delete failed:", errorData);
          Swal.fire(
            "Error!",
            errorData.message || "Failed to delete subscribers.",
            "error"
          );
          return; // stop here if error
        }

        const data = await res.json();
        console.log("Bulk delete response:", data);

        // Success only if backend confirms
        fetchSubscribers();
        setSelectedIds([]);
        Swal.fire("Deleted!", "Subscribers deleted successfully.", "success");
      } catch (err) {
        console.error("Bulk delete error:", err);
        Swal.fire("Error!", "Something went wrong with bulk delete.", "error");
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const idsOnPage = subscribers.map((s) => s.id);
      setSelectedIds([...new Set([...selectedIds, ...idsOnPage])]);
    } else {
      const idsOnPage = subscribers.map((s) => s.id);
      setSelectedIds(selectedIds.filter((id) => !idsOnPage.includes(id)));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + subscribers.length, totalItems);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold dark:text-white">Subscribers</h1>
        <div className="flex gap-2">
          <button
            onClick={handleBulkDelete}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Delete Selected
          </button>
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
                  subscribers.length > 0 &&
                  subscribers.every((s) => selectedIds.includes(s.id))
                }
              />
            </th>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Subscribed At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">
                Loading subscribers...
              </td>
            </tr>
          ) : subscribers.length > 0 ? (
            subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-100 dark:text-white">
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => handleSelectRow(s.id)}
                  />
                </td>
                <td className="p-2 border">{s.id}</td>
                <td className="p-2 border">{s.name}</td>
                <td className="p-2 border">{s.email}</td>
                <td className="p-2 border">
                  <span
                    className={
                      s.status === "SUBSCRIBED"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {s.status}
                  </span>
                </td>
                <td className="p-2 border">{s.subscribed_at}</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-4 text-gray-500">
                No subscribers found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination and info */}
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

export default SubscribersTable;
