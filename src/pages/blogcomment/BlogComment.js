import React, { useState, useEffect } from "react";
import { Trash2, Edit2 } from "lucide-react";
import Swal from "sweetalert2";

const BlogCommentsTable = () => {
  const [comments, setComments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchComments();
  }, [currentPage, perPage, searchTerm]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/post-comment?page=${currentPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        let filtered = data.data;
        if (searchTerm) {
          filtered = filtered.filter(
            (c) =>
              (c.guest_name &&
                c.guest_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())) ||
              (c.guest_email &&
                c.guest_email
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())) ||
              (c.body &&
                c.body.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        setComments(filtered);
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setTotalItems(data.meta.total || filtered.length);
        }
      } else {
        setComments([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
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
      text: "You want to delete this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `https://tyka.premierhostings.com/beta/api/post-comment/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Delete failed");
        fetchComments();
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
        Swal.fire("Deleted!", "Comment has been deleted.", "success");
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error!", "Failed to delete comment.", "error");
      }
    }
  };

  // bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("Info", "No comments selected.", "info");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${selectedIds.length} comments?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `https://tyka.premierhostings.com/beta/api/post-comment/bulk-delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: selectedIds }),
          }
        );
        if (!res.ok) throw new Error("Bulk delete failed");
        fetchComments();
        setSelectedIds([]);
        Swal.fire("Deleted!", "Comments deleted successfully.", "success");
      } catch (err) {
        console.error("Bulk delete error:", err);
        Swal.fire("Error!", "Failed to delete comments.", "error");
      }
    }
  };
  const handleStatusUpdate = async (id, newStatus) => {
    console.log("Updating status:", id, newStatus);

    const result = await Swal.fire({
      title: "Update Status?",
      text: `Change status to ${newStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `https://tyka.premierhostings.com/beta/api/blog-comment/${id}`, // 👈 direct API
          {
            method: "POST", // ya "PUT" agar API doc mein likha ho
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // 👈 token jaruri hai
            },
            body: JSON.stringify({ status: newStatus }), // 👈 backend field name
          }
        );

        if (!res.ok) throw new Error("Status update failed");

        fetchComments(); // table ko refresh karega
        Swal.fire("Updated!", `Status changed to ${newStatus}.`, "success");
      } catch (err) {
        console.error("Status update error:", err);
        Swal.fire("Error!", "Failed to update status.", "error");
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const idsOnPage = comments.map((c) => c.id);
      setSelectedIds([...new Set([...selectedIds, ...idsOnPage])]);
    } else {
      const idsOnPage = comments.map((c) => c.id);
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
        <h1 className="text-3xl font-bold dark:text-white">Blog Comments</h1>
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
            <option value={30}>30</option>
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
                  comments.length > 0 &&
                  comments.every((c) => selectedIds.includes(c.id))
                }
              />
            </th>
            {/* <th className="p-2 border">ID</th> */}
            <th className="p-2 border">Post</th>
            <th className="p-2 border">Guest Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Body</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="9" className="text-center p-4 text-gray-500">
                Loading comments...
              </td>
            </tr>
          ) : comments.length > 0 ? (
            comments.map((c) => (
              <tr key={c.id} className="hover:bg-gray-100 dark:text-white">
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(c.id)}
                    onChange={() => handleSelectRow(c.id)}
                  />
                </td>
                {/* <td className="p-2 border">{c.id}</td> */}
                <td className="p-2 border">
                  {c.post?.data?.[0]?.title || "—"}
                </td>
                <td className="p-2 border">{c.guest_name || "—"}</td>
                <td className="p-2 border">{c.guest_email || "—"}</td>
                <td className="p-2 border">{c.body}</td>
                <td className="p-2 border">
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                    className={`p-1 rounded bg-white border ${c.status === "approved"
                        ? "text-green-600"
                        : c.status === "pending"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>

                <td className="p-2 border">{c.created_at}</td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-500 hover:text-red-700 mr-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center p-4 text-gray-500">
                No comments found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 gap-2 dark:text-white">
        <div>
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
          {totalItems} entries
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`px-3 py-1 border rounded ${currentPage === i + 1
                  ? "bg-red-600 text-white"
                  : "bg-transparent dark:text-white"
                }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

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

export default BlogCommentsTable;
