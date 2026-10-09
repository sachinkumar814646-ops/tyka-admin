"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { Plus, Edit, Trash2, MoreVertical } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PermissionGuard from "../../components/auth/PermissionGuard";

const CouponsPage = () => {
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tyka.premierhostings.com/beta/api/coupons?perPage=${entriesPerPage}&page=${page}&search=${searchTerm}`
      );
      const data = await response.json();
      setCoupons(data.data);
      setTotal(data.total || data.data.length);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [entriesPerPage, page, searchTerm]);

  const totalPages = Math.ceil(total / entriesPerPage);

  // Inside CouponsPage component

  // Single Delete with SweetAlert success
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
        const response = await fetch(
          `https://tyka.premierhostings.com/beta/api/coupons/${id}`,
          { method: "DELETE" }
        );
        const resData = await response.json();

        if (resData.success) {
          fetchCoupons();
          setSelectedIds(selectedIds.filter((sid) => sid !== id));
          Swal.fire("Deleted!", "Coupon has been deleted.", "success");
        } else {
          Swal.fire("Error!", "Failed to delete coupon.", "error");
        }
      } catch (error) {
        console.error("Error deleting coupon:", error);
        Swal.fire(
          "Error!",
          "An error occurred while deleting the coupon.",
          "error"
        );
      }
    }
  };

  // Bulk Delete with SweetAlert success
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: `Delete ${selectedIds.length} selected coupons?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          "https://tyka.premierhostings.com/beta/api/coupon/bulk-delete",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selectedIds }),
          }
        );
        const resData = await response.json();

        if (resData.success) {
          setSelectedIds([]);
          fetchCoupons();
          Swal.fire(
            "Deleted!",
            "Selected coupons have been deleted.",
            "success"
          );
        } else {
          Swal.fire("Error!", "Failed to delete selected coupons.", "error");
        }
      } catch (error) {
        console.error("Bulk delete error:", error);
        Swal.fire(
          "Error!",
          "An error occurred while deleting coupons.",
          "error"
        );
      }
    }
  };

  // Pagination numbers with dots
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 2) pages.push(1, 2, 3, "...", totalPages);
      else if (page >= totalPages - 1)
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      else pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    }
    return pages;
  };

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.coupon_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.coupon_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCoupons = filteredCoupons.slice(0, entriesPerPage);

  const areAllOnPageSelected =
    paginatedCoupons.length > 0 &&
    paginatedCoupons.every((coupon) => selectedIds.includes(coupon.id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = paginatedCoupons.map((c) => c.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    } else {
      const allIds = paginatedCoupons.map((c) => c.id);
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    }
  };

  return (
    <div className="w-full max-w-screen overflow-x-hidden">
      <div className="space-y-4 px-4 py-4">
        <h1 className="text-3xl font-bold dark:text-white">Coupons</h1>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-3">
              <CardTitle>Coupons</CardTitle>
              <div className="flex gap-3 flex-wrap">
                <PermissionGuard permission="create_coupons">
                  <Button onClick={() => navigate("/addcoupen")}>
                    <Plus className="mr-2 h-4 w-4" /> Add Coupon
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="bulk_coupons">
                  <Button
                    variant={selectedIds.length > 0 ? "destructive" : "outline"}
                    disabled={selectedIds.length === 0}
                    onClick={handleBulkDelete}
                  >
                    Bulk Delete
                  </Button>
                </PermissionGuard>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border rounded px-2 py-1 dark:bg-slate-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>
              <Input
                placeholder="Search coupons..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="border-none p-0 ml-2 bg-transparent focus:ring-0"
                style={{ width: "300px" }}
              />
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            {loading ? (
              <div>Loading...</div>
            ) : (
              <Table className="min-w-[800px] relative">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <input
                        type="checkbox"
                        checked={areAllOnPageSelected}
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Min Amount</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(coupon.id)}
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedIds([...selectedIds, coupon.id])
                              : setSelectedIds(
                                selectedIds.filter((id) => id !== coupon.id)
                              )
                          }
                        />
                      </TableCell>
                      <TableCell>{coupon.coupon_code}</TableCell>
                      <TableCell>{coupon.coupon_name}</TableCell>
                      <TableCell>{coupon.discount_type}</TableCell>
                      <TableCell>
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}%`
                          : `$${coupon.discount_value}`}
                      </TableCell>
                      <TableCell>
                        {coupon.no_of_uses} / {coupon.no_uses_allowed}
                      </TableCell>
                      <TableCell>₹{coupon.min_amount}</TableCell>
                      <TableCell>{coupon.date_to}</TableCell>
                      {/* ✅ Updated Actions Column */}
                      <TableCell className="p-2  text-center">
                        <PermissionGuard permission="edit_coupons">
                          <button
                            onClick={() =>
                              navigate(`/edit-coupons/${coupon.id}`)
                            }
                            className="text-blue-500 hover:text-blue-700 mr-3"
                          >
                            <Edit size={18} />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="delete_coupons">
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
            <div className="text-sm text-gray-600 dark:text-white ml-3 mb-4">
              Showing {total === 0 ? 0 : (page - 1) * entriesPerPage + 1} to{" "}
              {page * entriesPerPage > total ? total : page * entriesPerPage} of{" "}
              {total} entries
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              {getPageNumbers().map((num, idx) =>
                num === "..." ? (
                  <span key={idx} className="px-2 py-1">
                    ...
                  </span>
                ) : (
                  <Button
                    key={idx}
                    size="sm"
                    variant={page === num ? "default" : "outline"}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </Button>
                )
              )}
              <Button
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CouponsPage;
