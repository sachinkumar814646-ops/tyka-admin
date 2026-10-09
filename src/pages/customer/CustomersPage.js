"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import axios from "axios";
import Swal from "sweetalert2";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Eye,
  Ban,
  CheckCircle,
  DollarSign,
  Pencil,
  ChevronRight,
  IndianRupee,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";
// import { useNavigate } from "react-router-dom";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { useNavigate, useLocation } from "react-router-dom";

const CustomersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(pageFromUrl);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortDir, setSortDir] = useState("desc");
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [detailedCustomer, setDetailedCustomer] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const token = localStorage.getItem("token");
  // Fetch customers list (with pagination, search, sort)

  // Update URL whenever page changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("page", page);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [page]);

  // Fetch customers whenever page, perPage, searchTerm, or sortDir changes
  useEffect(() => {
    fetchCustomers();
  }, [page, entriesPerPage, searchTerm, sortDir]);

  // const fetchCustomers = async () => {
  //   try {
  //     const query = new URLSearchParams({
  //       page,
  //       perPage: entriesPerPage,
  //       search: searchTerm,
  //       sortDir,
  //     }).toString();

  //     const res = await fetch(
  //       `https://tyka.premierhostings.com/beta/api/customers?${query}`,
  //       { cache: "no-store" }
  //     );
  //     const data = await res.json();
  //     console.log("dataatattata", data);
  //     if (data.success) {
  //       setCustomers(data.data);
  //       setMeta(data.meta);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching customers:", err);
  //   }
  // };

  const fetchCustomers = async () => {
    try {
      const query = new URLSearchParams({
        page,
        perPage: entriesPerPage,
        search: searchTerm,
        sortDir,
      }).toString();
      console.log("sdfdfgd", searchTerm);
      debugger;
      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/customers?${query}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add this line
            "Content-Type": "application/json",
          },
          cache: "no-store",
        },
      );

      const data = await res.json();
      console.log("dataatattata", data);

      if (data.success) {
        setCustomers(data.data);
        setMeta(data.meta);
      } else {
        setCustomers([]);
        setMeta(null);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  // Fetch detailed customer info with orders
  const fetchCustomerDetails = async (customerId) => {
    try {
      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/customers/${customerId}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (data.success) {
        setDetailedCustomer(data.data);
      } else {
        setDetailedCustomer(null);
      }
    } catch (err) {
      console.error("Error fetching customer details:", err);
      setDetailedCustomer(null);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, entriesPerPage, searchTerm, sortDir]);

  useEffect(() => {
    if (viewingCustomer) {
      fetchCustomerDetails(viewingCustomer.id);
    } else {
      setDetailedCustomer(null);
    }
  }, [viewingCustomer]);

  // Toggle status locally (mock)
  // Toggle status with API call
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1; // flip status

      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/users/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ Token add
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await res.json();
      console.log("Status API Response:", data);

      if (data.success) {
        // Update state after success
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
        );
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status");
    }
  };
  const handleSelectCustomer = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(customers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("Warning", "Please select customers to delete", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Selected customers will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(
          "https://tyka.premierhostings.com/beta/api/customer/bulk-delete",
          { ids: selectedIds },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        Swal.fire("Deleted!", "Selected customers deleted.", "success");
        setSelectedIds([]);
        fetchCustomers(); // Reload customer list
      } catch (error) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  // Stats
  const stats = {
    total: meta?.total || 0,
    active: customers.filter((c) => c.status === 1).length,
    blocked: customers.filter((c) => c.status === 0).length,
    avgOrder: (0).toFixed(2),
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, searchTerm]);

  // Optional: debounce search (prevents too many API calls when typing)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers();
    }, 500); // wait 500ms after typing stops

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, page]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setPage(1); // reset page
      fetchCustomers(); // manually trigger search
    }
  };
  // Custom Pagination
  const getPageNumbers = () => {
    if (!meta) return [];
    const totalPages = meta.last_page;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-4">
        {/* Header */}
        <div className="w-full max-w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Customer Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage customer accounts and view order history
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { key: "total", title: "Total Customers", icon: Users },
            { key: "active", title: "Active Customers", icon: UserCheck },
            { key: "blocked", title: "Blocked Customers", icon: UserX },
            // { key: "avgOrder", title: "Avg. Order Value", icon: IndianRupee },
          ].map((stat) => (
            <Card key={stat.key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {stat.key === "avgOrder"
                    ? `₹${stats[stat.key]}`
                    : stats[stat.key]}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Customers</CardTitle>
            </div>
            <div className="" style={{ marginLeft: "830px" }}>
              <PermissionGuard permission="bulk_delete_customers">
                <Button variant="destructive" onClick={bulkDelete}>
                  Bulk Delete
                </Button>
              </PermissionGuard>
            </div>

            {/* Top controls: show entries & search */}
            <div className="flex justify-between items-center mt-4 w-full max-w-full dark:text-white">
              <div>
                Show{" "}
                <select
                  className="border p-1 rounded bg-transparent text-sm"
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>{" "}
                entries
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  onKeyDown={handleSearchKeyDown} // 👈 Add this
                  className="text-sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll} // function aayega niche
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                        />
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        {customer.name}
                      </TableCell>
                      <TableCell
                        className="max-w-[100px] sm:max-w-[150px] md:max-w-[200px] truncate"
                        title={customer.email}
                      >
                        {customer.email}
                      </TableCell>

                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === 1 ? "success" : "inactive"
                          }
                        >
                          {customer.status === 1 ? "Active" : "Blocked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* View Button */}
                          <PermissionGuard permission="view_customers">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingCustomer(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>

                          {/* Edit Button */}
                          {/* Edit Button */}
                          <PermissionGuard permission="edit_customers">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/customers/edit/${customer.id}?page=${page}&per_page=${entriesPerPage}`,
                                )
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>

                          {/* Status Toggle Button */}
                          <PermissionGuard permission="block_customers">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleStatus(customer.id, customer.status)
                              }
                            >
                              {customer.status === 1 ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination and info */}
            {meta && (
              <div className="flex justify-between items-center mt-4 dark:text-white">
                <div>
                  Showing {meta.from || 0} to {meta.to || 0} of{" "}
                  {meta.total || 0} entries
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* First Page Always */}
                  <button
                    className={`px-3 py-1 border rounded ${
                      page === 1
                        ? "bg-red-600 text-white"
                        : "bg-transparent dark:text-white"
                    }`}
                    onClick={() => setPage(1)}
                  >
                    1
                  </button>

                  {/* Left dots */}
                  {page > 3 && (
                    <span className="px-2 flex items-center">...</span>
                  )}

                  {/* Dynamic Middle Pages */}
                  {Array.from({ length: 3 }, (_, i) => {
                    const pageNumber = page - 1 + i;
                    if (pageNumber > 1 && pageNumber < meta.last_page) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`px-3 py-1 border rounded ${
                            page === pageNumber
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

                  {/* Right dots */}
                  {page < meta.last_page - 2 && (
                    <span className="px-2 flex items-center">...</span>
                  )}

                  {/* Last Page Always */}
                  {meta.last_page > 1 && (
                    <button
                      className={`px-3 py-1 border rounded ${
                        page === meta.last_page
                          ? "bg-red-600 text-white"
                          : "bg-transparent dark:text-white"
                      }`}
                      onClick={() => setPage(meta.last_page)}
                    >
                      {meta.last_page}
                    </button>
                  )}

                  {/* Next Button */}
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(p + 1, meta.last_page))
                    }
                    disabled={page === meta.last_page}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Customer Dialog */}
        <Dialog
          open={!!viewingCustomer}
          onOpenChange={() => setViewingCustomer(null)}
        >
          <DialogContent className="dark:text-white">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {detailedCustomer ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <p>
                  <strong>Name:</strong> {detailedCustomer.name}
                </p>
                <p>
                  <strong>Email:</strong> {detailedCustomer.email}
                </p>
                <p>
                  <strong>Phone:</strong> {detailedCustomer.phone}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {detailedCustomer.status === 1 ? "Active" : "Blocked"}
                </p>

                {/* Addresses */}
                <div>
                  <strong>Addresses:</strong>
                  {detailedCustomer.address &&
                  detailedCustomer.address?.data.length > 0 ? (
                    detailedCustomer.address?.data.map((address, index) => (
                      <div
                        key={index}
                        className="space-y-1 mt-2 p-3 border border-gray-300 rounded-lg shadow-sm"
                      >
                        <div>
                          <strong>Address {index + 1}:</strong>
                        </div>
                        <div>
                          <strong>Street:</strong> {address.street}
                        </div>
                        <div>
                          <strong>Apartment/Suite:</strong>{" "}
                          {address.apartment_suite || "N/A"}
                        </div>
                        <div>
                          <strong>City:</strong>{" "}
                          {address.city.name || "Unknown City"}
                        </div>
                        <div>
                          <strong>State/Province:</strong>{" "}
                          {address.state.name || "Unknown State"}
                        </div>
                        <div>
                          <strong>Zipcode:</strong> {address.zipcode}
                        </div>
                        <div>
                          <strong>Country:</strong>{" "}
                          {address.country.name || "Unknown Country"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No addresses available</div>
                  )}
                </div>
              </div>
            ) : (
              <div>Loading customer details...</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomersPage;
