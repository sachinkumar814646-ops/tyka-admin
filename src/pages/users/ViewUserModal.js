"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Shield,
  VenusAndMars,
  Users,
  ArrowLeft,
  Eye,
} from "lucide-react";
import ActivityLogModal from "../../components/common/ActivityLogModal";

export default function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const [showLogs, setShowLogs] = useState(false);
  // ✅ page and per_page URL params
  const initialPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const initialPerPage = Number.parseInt(
    searchParams.get("per_page") || "10",
    10,
  );
  const [page] = useState(initialPage);
  const [entriesPerPage] = useState(initialPerPage);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `https://tyka.premierhostings.com/beta/api/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        );

        setUser(res.data.data);
        console.log(res.data);
      } catch (error) {
        toast.error("Failed to load user details");
        console.error(error);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
        {/* Header Skeleton */}
        <div className="h-24 bg-gray-300 dark:bg-gray-700"></div>

        <div className="p-6 flex flex-col md:flex-row gap-8">
          {/* Avatar Skeleton */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-gray-300 dark:bg-gray-700"></div>

            <div className="mt-4 h-6 w-32 rounded bg-gray-300 dark:bg-gray-700"></div>

            <div className="mt-3 h-6 w-20 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          </div>

          {/* Details Skeleton */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
                <div className="h-5 w-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate(`/user?page=${page}&per_page=${entriesPerPage}`)
          }
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          <ArrowLeft size={18} />
          Back to Users
        </button>

        {/* View Log Button */}
        <button
          onClick={() => setShowLogs(true)} // change route as needed
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          <Eye size={18} />
          View Log
        </button>
        <ActivityLogModal
          open={showLogs}
          onClose={() => setShowLogs(false)}
          endpoint={`orders/${id}`}
        />
      </div>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-600 p-6">
          <h1 className="text-3xl font-bold text-white">User Details</h1>
          <p className="text-red-100 mt-1">
            View complete information about the user.
          </p>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-red-500 shadow-lg bg-gray-100 dark:bg-gray-800">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <User size={70} className="text-gray-400" />
                </div>
              )}
            </div>

            <h2 className="mt-4 text-xl font-bold dark:text-white">
              {user.name}
            </h2>

            <span
              className={`mt-2 px-4 py-1 rounded-full text-sm mb-0 font-semibold ${
                String(user.status) === "1"
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              }`}
            >
              {String(user.status) === "1" ? "Active" : "Inactive"}
            </span>
          </div>

          {/* User Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-center gap-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border">
              <User className="text-red-600" size={24} />
              <div>
                <p className="text-sm mb-0 text-gray-500">Full Name</p>
                <p className="font-semibold dark:text-white mb-0">
                  {user.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border">
              <Mail className="text-red-500" size={24} />
              <div>
                <p className="text-sm mb-0 text-gray-500">Email</p>
                <p className="font-semibold dark:text-white mb-0">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border">
              <Phone className="text-green-500" size={24} />
              <div>
                <p className="text-sm mb-0 text-gray-500">Phone</p>
                <p className="font-semibold dark:text-white mb-0">
                  {user.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border">
              <VenusAndMars className="text-pink-500" size={24} />
              <div>
                <p className="text-sm mb-0 text-gray-500">Gender</p>
                <p className="font-semibold dark:text-white mb-0">
                  {user.gender || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border">
              <Shield className="text-yellow-500" size={24} />
              <div>
                <p className="text-sm mb-0 text-gray-500">Role</p>
                <p className="font-semibold dark:text-white mb-0">
                  {user.roles?.[0]?.role_name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 border">
              <Users className="text-indigo-500" size={24} />
              <div>
                <p className="text-sm mb-0 text-gray-500">User Type</p>
                <p className="font-semibold dark:text-white mb-0">
                  {user.user_type || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
