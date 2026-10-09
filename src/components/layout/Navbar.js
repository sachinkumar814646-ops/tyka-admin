"use client";

import { useState, useEffect, useRef } from "react";
import {
  PackageX,
  Bell,
  User,
  LogOut,
  Settings,
  Menu,
  CircleUserRound,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import ThemeToggle from "../common/ThemeToggle";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PermissionGuard from "../auth/PermissionGuard";

const API_BASE = "https://tyka.premierhostings.com/beta/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const fetchNotificationCount = async () => {
    try {
      const res = await axios.get(`${API_BASE}/notification-count`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 🔑 agar token lagta hai
        },
      });
      setCount(res.data?.latest_count || 0);
      setNotifications(res.data.data);
    } catch (err) {
      console.error("❌ Failed to fetch notification count:", err);
    }
  };

  useEffect(() => {
    fetchNotificationCount();

    // optional: har 60 sec me refresh karna ho to
    const interval = setInterval(fetchNotificationCount, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-red-200 dark:border-red-800 dark:bg-gray-900 backdrop-blur shadow-sm">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5 dark:text-white" />
          </Button>
          <h1 className="text-lg font-semibold text-red-600">TYKA</h1>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {/* Stock Alert */}
          <div className="relative">
            <PermissionGuard permission="show_out_of_stock">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/stockalert")}
              >
                <PackageX className="h-5 w-5 text-red-600 dark:text-red-400" />
              </Button>
            </PermissionGuard>
          </div>

          <ThemeToggle />

          {/* Notifications */}
          <PermissionGuard permission="show_notification">
            <div className="relative" ref={notificationRef}>
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5 dark:text-white" />

                {count > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 inline-flex items-center justify-center
      rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white
      whitespace-nowrap animate-pulse"
                  >
                    {count}
                  </Badge>
                )}
              </Button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                  <div className="p-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 border-b-2">
                      <h4 className="font-semibold">Notifications</h4>

                      <Badge variant="secondary">{count} new</Badge>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => navigate("/notification")}
                            className="p-2 rounded-lg border bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 transition"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                {/* Notification Heading */}
                                <p className="text-sm font-medium">
                                  {notification.data?.head || "Notification"}
                                </p>

                                {/* Notification Body */}
                                <p className="text-xs text-muted-foreground">
                                  {notification.data?.body || ""}
                                </p>

                                {/* Date & Time */}
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    notification.created_at,
                                  ).toLocaleString()}
                                </p>
                              </div>

                              {/* Unread Indicator */}
                              {!notification.read_at && (
                                <div className="w-2 h-2 bg-red-600 rounded-full mt-1" />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                          No new notifications
                        </p>
                      )}
                    </div>

                    {/* Show All */}
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/notification");
                        }}
                      >
                        Show All
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PermissionGuard>
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User className="h-5 w-5 text-black dark:text-white" />
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full border-2 border-red-500 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-slate-700">
                          {user?.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt={user?.name || "User"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <User className="h-6 w-6 text-gray-500 dark:text-gray-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold mb-0 text-gray-900 dark:text-white truncate">
                            {user?.name || "Admin User"}
                          </p>

                          <p className="text-xs mb-0 text-gray-500 dark:text-gray-400 truncate">
                            {user?.email || "admin@example.com"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setShowUserMenu(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                      >
                        <User className="h-5 w-5 text-red-500" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate("/settings");
                          setShowUserMenu(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                      >
                        <Settings className="h-5 w-5 text-blue-500" />
                        <span>Settings</span>
                      </button>

                      <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/auth/login");
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center px-2 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Login</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate("/auth/signup");
                        setShowUserMenu(false);
                      }}
                      className="flex w-full items-center px-2 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Signup</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
