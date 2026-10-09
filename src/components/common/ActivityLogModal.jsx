import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const ActivityLogModal = ({ open, onClose, endpoint }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";

    if (typeof value === "boolean") {
      return value ? "True" : "False";
    }

    if (value === 1) return "True";
    if (value === 0) return "False";

    return String(value);
  };

  const fetchLogs = async () => {
    const token = localStorage.getItem("authtoken");
    if (!endpoint) return;

    try {
      setLoading(true);

      const response = await fetch(
        `https://tyka.premierhostings.com/beta/api/${endpoint}/logs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setLogs(data.data || []);
      } else {
        setLogs([]);
      }
    } catch (error) {
      console.error("Log Fetch Error:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open, endpoint]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold">Activity Logs</h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">

          {loading ? (
            <div className="text-center py-10">
              Loading...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No Activity Logs Found.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg shadow-sm mb-6"
              >
                {/* Log Header */}
                <div className="bg-gray-100 px-4 py-3 flex justify-between flex-wrap">
                  <div>
                    <p className="font-semibold">
                      {log.action}
                    </p>

                    <p className="text-sm text-gray-600">
                      By: {log.performed_by}
                    </p>
                  </div>

                  <div className="text-sm text-gray-500">
                    {log.date}
                  </div>
                </div>

                {/* Changes Table */}
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-3 py-2 text-left">
                        Field
                      </th>
                      <th className="border px-3 py-2 text-left">
                        Old Value
                      </th>
                      <th className="border px-3 py-2 text-left">
                        New Value
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.keys({
                      ...(log.old || {}),
                      ...(log.new || {}),
                    }).map((key) => (
                      <tr key={key}>
                        <td className="border px-3 py-2 capitalize">
                          {key.replace(/_/g, " ")}
                        </td>

                        <td className="border px-3 py-2">
                          {formatValue(log.old?.[key])}
                        </td>

                        <td className="border px-3 py-2">
                          {formatValue(log.new?.[key])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogModal;