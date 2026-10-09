"use client";

import { useEffect, useState } from "react";
import { Eye, X, ChevronLeft, ChevronRight, Search } from "lucide-react";

const ActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  });

  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = async (page = 1) => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.append("page", page);

      // Send date filters to API
      if (fromDate) {
        params.append("from_date", fromDate);
      }

      if (toDate) {
        params.append("to_date", toDate);
      }

      const response = await fetch(
        `https://tyka.premierhostings.com/beta/api/activity-logs?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activity logs");
      }

      const json = await response.json();

      setActivityLogs(json?.data?.data || []);

      setPagination({
        current_page: json?.data?.current_page || 1,
        last_page: json?.data?.last_page || 1,
        total: json?.data?.total || 0,
        per_page: json?.data?.per_page || 20,
      });
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleFilter = () => {
    fetchLogs(1);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");

    // Fetch without filters
    setTimeout(() => {
      fetchLogs(1);
    }, 0);
  };

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.last_page ||
      page === pagination.current_page
    ) {
      return;
    }

    fetchLogs(page);
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "—";
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  const renderChanges = (log) => {
    const oldData = log.old && typeof log.old === "object" ? log.old : {};

    const newData = log.new && typeof log.new === "object" ? log.new : {};

    const keys = Array.from(
      new Set([...Object.keys(oldData), ...Object.keys(newData)]),
    );

    if (!keys.length) {
      return (
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          No changes recorded.
        </div>
      );
    }

    const STORAGE_URL = "https://tyka.premierhostings.com/beta/storage/";

    const isImagePath = (value) => {
      if (typeof value !== "string" || !value.trim()) return false;

      return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(value.trim());
    };

    const getImageUrl = (value) => {
      if (!value) return "";

      // Already full URL
      if (/^https?:\/\//i.test(value)) {
        return value;
      }

      // Relative storage path
      return `${STORAGE_URL}${value.replace(/^\/+/, "")}`;
    };

    const renderValue = (value) => {
      if (isImagePath(value)) {
        return (
          <img
            src={getImageUrl(value)}
            alt="Changed"
            className="h-20 w-20 rounded-lg border border-gray-200 bg-white object-contain p-1"
          />
        );
      }

      return formatValue(value);
    };

    return (
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold">Field</th>

              <th className="px-4 py-3 text-left font-semibold">Old Value</th>

              <th className="px-4 py-3 text-left font-semibold">New Value</th>
            </tr>
          </thead>

          <tbody>
            {keys.map((key) => (
              <tr key={key} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-medium">{key}</td>

                <td className="px-4 py-3 align-top">
                  <div className="max-w-[300px] whitespace-pre-wrap break-words rounded-md bg-red-50 p-2 text-xs text-red-700">
                    {renderValue(oldData[key])}
                  </div>
                </td>

                <td className="px-4 py-3 align-top">
                  <div className="max-w-[300px] whitespace-pre-wrap break-words rounded-md bg-green-50 p-2 text-xs text-green-700">
                    {renderValue(newData[key])}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className=" max-w-full w-12/12 rounded-xl border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Activity Logs</h2>

              <p className="text-sm text-muted-foreground">
                Complete history of system activity
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">
                {pagination.total}
              </span>
            </div>
          </div>

          {/* Date Filters */}
          {/* <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <label className="mb-1 block text-sm font-medium">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">To Date</label>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              onClick={handleFilter}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              Filter
            </button>

            <button
              type="button"
              onClick={clearFilter}
              disabled={loading}
              className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Clear
            </button>
          </div> */}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-5 py-3 text-left">Module</th>

                <th className="px-5 py-3 text-left">Event</th>

                <th className="px-5 py-3 text-left">Date</th>

                <th className="px-5 py-3 text-center">View</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    Loading activity logs...
                  </td>
                </tr>
              ) : activityLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                activityLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b last:border-b-0 hover:bg-muted/30"
                  >
                    {/* MODULE + ACTION */}
                    <td className="px-3 py-2 ">
                      <div className="flex flex-col gap-2">
                        {/* Module */}
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-1">
                            Module
                          </div>

                          <span className="inline-flex w-fit rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {log.module || "—"}
                          </span>
                        </div>

                        {/* Action */}
                        <div>
                          <div className="text-xs font-semibold text-gray-500 mb-1">
                            Action
                          </div>

                          <span className="font-medium text-gray-900">
                            {log.action || "—"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="px-3 py-2 ">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`w-fit rounded-full px-3 py-1 text-sm font-medium capitalize ${
                            log.event === "created"
                              ? "bg-green-100 text-green-700"
                              : log.event === "updated"
                                ? "bg-blue-100 text-blue-700"
                                : log.event === "deleted"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {log.event || " "}
                        </span>
                      </div>
                    </td>

                    {/* OPERATION / RECORD */}
                    {/* <td className="px-3 py-1 ">
                      {typeof log.record_name === "string" &&
                      /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(
                        log.record_name,
                      ) ? (
                        <img
                          src={log.record_name}
                          alt="Record"
                          className="h-full w-24 rounded-lg object-contain p-1"
                        />
                      ) : (
                        <span className="font-medium text-gray-700">
                          #{log.record_name || "—"}
                        </span>
                      )}
                    </td> */}

                    {/* PERFORMED BY + DATE + TIME */}
                    <td className="px-3 py-2 ">
                      <div className="flex flex-col gap-3">
                        {/* Performed By */}
                        <div>
                          <div className="mb-1 text-xs font-semibold text-gray-500">
                            Performed By
                          </div>
                          <span className="font-medium text-gray-900">
                            {log.performed_by || "—"}
                          </span>
                        </div>

                        {/* Date */}
                        <div>
                          <div className="text-xs font-semibold text-gray-500">
                            Date
                          </div>
                          <span className="text-sm text-gray-700">
                            {log.date
                              ? new Date(log.date).toLocaleDateString("en-IN")
                              : "—"}
                          </span>
                        </div>

                        {/* Time */}
                        <div>
                          <div className="text-xs font-semibold text-gray-500">
                            Time
                          </div>
                          <span className="text-sm text-gray-700">
                            {log.date
                              ? new Date(log.date).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* VIEW */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-background transition hover:bg-muted"
                        title="View changes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.last_page > 1 && (
          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Page{" "}
              <span className="font-medium text-foreground">
                {pagination.current_page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {pagination.last_page}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                type="button"
                disabled={pagination.current_page === 1}
                onClick={() => handlePageChange(pagination.current_page - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const current = pagination.current_page;
                  const last = pagination.last_page;

                  const pages = [];

                  // Always show first page
                  pages.push(1);

                  // Left ellipsis
                  if (current > 3) {
                    pages.push("left-ellipsis");
                  }

                  // Pages around current page
                  const start = Math.max(2, current - 1);
                  const end = Math.min(last - 1, current + 1);

                  for (let page = start; page <= end; page++) {
                    pages.push(page);
                  }

                  // Right ellipsis
                  if (current < last - 2) {
                    pages.push("right-ellipsis");
                  }

                  // Always show last page
                  if (last > 1) {
                    pages.push(last);
                  }

                  return pages.map((page, index) => {
                    if (page === "left-ellipsis" || page === "right-ellipsis") {
                      return (
                        <span
                          key={`${page}-${index}`}
                          className="flex h-9 min-w-9 items-center justify-center px-2 text-sm text-muted-foreground"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        className={`h-9 min-w-9 rounded-md px-3 text-sm transition ${
                          page === current
                            ? "bg-primary text-primary-foreground"
                            : "border hover:bg-muted"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Next */}
              <button
                type="button"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => handlePageChange(pagination.current_page + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Changes Modal */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-background shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex shrink-0 items-center justify-end p-3">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            </div>

            {/* Modal Header */}
            <div className="shrink-0 border-b p-3">
              <h2 className="text-lg font-semibold">{selectedLog.action}</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {selectedLog.module} · Record #{selectedLog.record_id}
              </p>
            </div>

            {/* Log Information */}
            <div className="grid shrink-0 gap-4 border-b p-3 sm:grid-cols-3">
              <div>
                <p className="mb-0 text-xs text-muted-foreground">
                  Record Name / Module
                </p>
                <p className="mt-1 font-medium capitalize">
                  {selectedLog.record_name} / {selectedLog.module}
                </p>
              </div>
              <div>
                <p className="mb-0 text-xs text-muted-foreground">
                  Event / ( Performed By : )
                </p>
                <p className="mt-1 font-medium">
                  {selectedLog.event}({selectedLog.performed_by})
                </p>
              </div>

              <div>
                <p className="mb-0 text-xs text-muted-foreground">Date :</p>
                <p className="mt-1 font-medium">{selectedLog.date}</p>
              </div>
            </div>

            {/* Existing Changes */}
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {/* Variant Stock Changes */}
              {selectedLog.variant_changes &&
                selectedLog.variant_changes.length > 0 && (
                  <div className="shrink-0 border-b p-3">
                    <h3 className="mb-4 font-semibold">
                      Variant Stock Changes :
                    </h3>

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left">Color Name</th>
                            <th className="px-4 py-3 text-left">Size Name</th>
                            <th className="px-4 py-3 text-right">Old Stock</th>
                            <th className="px-4 py-3 text-right">New Stock</th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedLog.variant_changes.map((variant) => (
                            <tr
                              key={variant.variant_id}
                              className="border-b last:border-b-0"
                            >
                              <td className="px-4 py-3">
                                {variant.color_name ?? "—"}
                              </td>

                              <td className="px-4 py-3">
                                {variant.size_name ?? "—"}
                              </td>

                              <td className="px-4 py-3 text-right">
                                <span className="inline-flex rounded-md bg-red-50 px-2.5 py-1 font-semibold text-red-700">
                                  {variant.old_stock}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <span className="inline-flex rounded-md bg-green-50 px-2.5 py-1 font-semibold text-green-700">
                                  {variant.new_stock}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              <h3 className="mb-4 font-semibold">Changes :</h3>

              {renderChanges(selectedLog)}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 justify-end border-t p-4">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityLogs;
