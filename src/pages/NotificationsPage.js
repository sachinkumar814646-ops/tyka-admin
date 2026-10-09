import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import formatNotificationDate from "../lib/formatNotificationDate";

const API_BASE = "https://tyka.premierhostings.com/beta/api";

// 🔑 Helper function to attach token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ✅ API sometimes returns meta values as arrays: ["230","230"]
// Take the first element and force it to a real number.
const num = (v, fallback = 0) => {
  const raw = Array.isArray(v) ? v[0] : v;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
};

// ✅ Normalize the whole meta object once, so the rest of the
// component only ever deals with plain numbers (fixes "230230").
const normalizeMeta = (meta = {}) => ({
  ...meta,
  current_page: num(meta.current_page, 1),
  last_page: num(meta.last_page, 1),
  per_page: num(meta.per_page, 0),
  total: num(meta.total, 0),
  from: num(meta.from, 0),
  to: num(meta.to, 0),
});

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pageFromUrl = Number(searchParams.get("page")) || 1;

  // Fetch Notifications
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/notifications?page=${page}`,
        getAuthHeaders(),
      );
      const data = res.data.data || [];
      setNotifications(data);
      setPagination(normalizeMeta(res.data.meta)); // ✅ normalized here
      updateCounts(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const updateCounts = (data) => {
    const unread = data.filter((n) => !n.read_at).length;
    const read = data.filter((n) => n.read_at).length;
    setUnreadCount(unread);
    setReadCount(read);
  };

  // MARK SINGLE AS READ
  const markAsRead = async (id) => {
    try {
      await axios.get(`${API_BASE}/mark-as-read/${id}`, getAuthHeaders());
      toast.success("Notification marked as read", { autoClose: 2000 });
      fetchNotifications(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  // MARK ALL / SELECTED AS READ
  const markAllAsRead = async () => {
    try {
      const payload = { _method: "POST" };

      // ✅ Send ids only when something is actually selected,
      // otherwise the backend marks everything as read.
      if (selectedNotifications.length > 0) {
        payload.ids = selectedNotifications;
      }

      await axios.post(
        `${API_BASE}/mark-as-all-read`,
        payload,
        getAuthHeaders(),
      );

      toast.success(
        selectedNotifications.length > 0
          ? "Selected notifications marked as read"
          : "All notifications marked as read",
        { autoClose: 2000 },
      );

      setSelectedNotifications([]);
      fetchNotifications(currentPage);
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as read");
    }
  };

  // DELETE SINGLE NOTIFICATION
  const deleteNotification = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this notification?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(
            `${API_BASE}/notifications/${id}`,
            { _method: "DELETE" },
            getAuthHeaders(),
          );
          Swal.fire(
            "Deleted!",
            "The notification has been deleted.",
            "success",
          );
          fetchNotifications(currentPage); // ✅ stay on the same page
        } catch (err) {
          console.error("❌ Delete failed:", err);
          Swal.fire("Error", "Failed to delete notification.", "error");
        }
      }
    });
  };

  // BULK DELETE
  const bulkDelete = async () => {
    if (selectedNotifications.length === 0) {
      toast.warning("Please select notifications to delete");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete selected notifications?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete all!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(
            `${API_BASE}/notification/bulk-delete`,
            {
              ids: selectedNotifications,
              _method: "POST",
            },
            getAuthHeaders(),
          );

          setSelectedNotifications([]);
          fetchNotifications(currentPage);

          Swal.fire(
            "Deleted!",
            "Selected notifications have been deleted.",
            "success",
          );
        } catch (err) {
          console.error("❌ Bulk delete failed:", err);
          Swal.fire("Error", "Failed to delete notifications.", "error");
        }
      }
    });
  };

  // VIEW NOTIFICATION
  const handleView = (notification) => {
    if (!notification) return;
    let id;
    if (notification.url) {
      const parts = notification.url.split("/");
      const lastPart = parts[parts.length - 1];
      if (!isNaN(lastPart)) id = lastPart;
    }
    if (!id && notification.request_id) id = notification.request_id;

    if (
      notification.url?.includes("/admin/orders") ||
      notification.data?.type === "order_placed"
    ) {
      navigate(`/view-orders/${id}`);
    } else if (
      notification.url?.includes("/admin/products") ||
      notification.data?.type === "product"
    ) {
      navigate(`/view-product/${id}`);
    } else if (
      notification.url?.includes("/admin/users") ||
      notification.data?.type?.toLowerCase().includes("user")
    ) {
      navigate(`/view-user/${id}`);
    } else if (notification.url) {
      window.open(notification.url, "_blank");
    }
  };

  // BULK SELECT
  const toggleSelect = (id) => {
    if (selectedNotifications.includes(id)) {
      setSelectedNotifications(selectedNotifications.filter((x) => x !== id));
    } else {
      setSelectedNotifications([...selectedNotifications, id]);
    }
  };

  useEffect(() => {
    setCurrentPage(pageFromUrl);
    fetchNotifications(pageFromUrl);
  }, [pageFromUrl]);

  // ✅ Always a clean number now
  const totalPages = pagination.last_page || 1;

  // PAGINATION
  const handlePageChange = (page) => {
    const p = num(page, 0);
    if (!p || p < 1 || p > totalPages || p === currentPage) return;

    setCurrentPage(p);
    navigate(`/notification?page=${p}`);
  };

  // ✅ Built from a Set, so duplicates ("230230") are impossible
  // and every entry is guaranteed to be within 1..totalPages.
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages]);

    // window around the current page
    for (let p = currentPage - 1; p <= currentPage + 1; p++) {
      if (p >= 1 && p <= totalPages) pages.add(p);
    }

    // near the start
    if (currentPage <= 4) {
      [2, 3, 4, 5].forEach((p) => {
        if (p <= totalPages) pages.add(p);
      });
    }

    // near the end
    if (currentPage >= totalPages - 3) {
      for (let p = totalPages - 4; p < totalPages; p++) {
        if (p > 1) pages.add(p);
      }
    }

    const sorted = [...pages].sort((a, b) => a - b);

    // insert "..." wherever there is a gap
    return sorted.flatMap((p, i) =>
      i > 0 && p - sorted[i - 1] > 1 ? ["...", p] : [p],
    );
  };

  return (
    <div className="w-full max-w-6xl py-10 px-2 border rounded-md shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold dark:text-white">Notifications</h1>
        <div className="flex gap-2 items-center">
          {/* <span className="px-3 py-1 bg-red-500 text-white rounded-full">
            Unread: {unreadCount}
          </span>
          <span className="px-3 py-1 bg-gray-500 text-white rounded-full">
            Read: {readCount}
          </span> */}
          <button
            onClick={markAllAsRead}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {selectedNotifications.length > 0
              ? "Mark Selected Read"
              : "Mark All Read"}
          </button>
          <button
            onClick={bulkDelete}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete Selected
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications available</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              /* ✅ the old version had a // comment inside this template
                 literal, which React emitted as literal class names */
              className={`p-3 gap-6 border rounded shadow flex justify-between items-start ${
                n.read_at
                  ? "bg-gray-100 dark:bg-gray-500 dark:text-black"
                  : "dark:bg-gray-900 dark:text-white"
              }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-2 cursor-pointer"
                  checked={selectedNotifications.includes(n.id)}
                  onChange={() => toggleSelect(n.id)}
                />
                <div>
                  <h3 className="text-md">{n.head}</h3>
                  <p className="text-sm">{n.body}</p>
                  <span className="text-xs text-gray-500">
                    {formatNotificationDate(n.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {n.url && (
                  <button
                    onClick={() => handleView(n)}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    View
                  </button>
                )}
                {!n.read_at && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-sm bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Mark Read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {(pagination?.links?.length > 0 || totalPages > 1) && (
        <div className="flex items-center justify-between mt-6 gap-6 w-full px-2">
          {/* Showing */}
          <div className="text-sm text-gray-600 whitespace-nowrap">
            Showing <span className="font-medium">{pagination.from || 0}</span>{" "}
            to <span className="font-medium">{pagination.to || 0}</span> of{" "}
            <span className="font-medium">{pagination.total || 0}</span>{" "}
            notifications
          </div>

          {/* Pagination */}
          <div className="flex items-center gap-1 whitespace-nowrap">
            {/* Previous */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border text-sm bg-white text-black border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              « Previous
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`dots-${index}`}
                    className="px-2 py-1.5 text-gray-500"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    currentPage === page
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-black border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded border text-sm bg-white text-black border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Next »
            </button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default NotificationsPage;
