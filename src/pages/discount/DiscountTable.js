// DiscountTable.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Input from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/Dropdown";
import Button from "../../components/ui/Button";
import { Edit, MoreVertical, Trash2, Plus,ChevronLeft, ChevronRight  } from "lucide-react";
import Swal from "sweetalert2";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";
import PermissionGuard from "../../components/auth/PermissionGuard";

const DiscountTable = () => {
  const navigate = useNavigate();
  const [discounts, setDiscounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const token = localStorage.getItem("token");

  const fetchDiscounts = async () => {
    try {
      const res = await axios.get(
        `https://tyka.premierhostings.com/beta/api/discounts?page=${currentPage}&perPage=${entriesPerPage}&search=${searchTerm}&sortDir=desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let dataArray = [];
      if (Array.isArray(res.data)) {
        dataArray = res.data;
      } else if (Array.isArray(res.data?.data)) {
        dataArray = res.data.data;
      }
      setDiscounts(dataArray);

      if (res.data.meta) {
        setMeta(res.data.meta)
        setTotalPages(res.data.meta.last_page || 1);
        setTotalItems(res.data.meta.total || dataArray.length);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
      setDiscounts([]);
      setTotalPages(1);
      setTotalItems(0);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [currentPage, entriesPerPage, searchTerm]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this discount!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://tyka.premierhostings.com/beta/api/discounts/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire("Deleted!", "Discount has been deleted.", "success");
          fetchDiscounts();
        } catch (error) {
          console.error("Delete Error:", error);
          Swal.fire("Error!", "Failed to delete discount.", "error");
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      Swal.fire("No selection", "Please select at least one discount.", "info");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${selectedIds.length} discount(s)!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // ✅ Use the new bulk delete API
          await axios.post(
            "https://tyka.premierhostings.com/beta/api/discount/bulk-delete",
            { ids: selectedIds },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          Swal.fire(
            "Deleted!",
            `${selectedIds.length} discount(s) deleted.`,
            "success"
          );
          setSelectedIds([]);
          fetchDiscounts();
        } catch (error) {
          console.error("Bulk Delete Error:", error);
          Swal.fire("Error!", "Failed to delete discounts.", "error");
        }
      }
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === discounts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(discounts.map((d) => d.id));
    }
  };

  return (
    <div className="w-full">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-between items-center">
          <div className="flex flex-col space-y-2 sm:flex-1">
            <CardTitle className="text-xl sm:text-xl">Discounts</CardTitle>
            <CardDescription className="text-sm">
              Manage your product discounts
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <PermissionGuard permission="bulk_delete_discounts">
                <Button
                  className="flex-shrink-0 w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Bulk Delete ({selectedIds.length})
                </Button>
              </PermissionGuard>
            )}
            <PermissionGuard permission="create_brands">
              <Button
                className="flex-shrink-0 w-full sm:w-auto bg-red-500 hover:bg-red-800 text-white mr-0"
                onClick={() => navigate("/discounts/add")}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Discount</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </CardHeader>

      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex items-center gap-2 text-sm ml-6">
                <label
        htmlFor="usersPerPage"
        className="text-lg font-medium text-gray-700"
      >
        Show
      </label>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded p-1 dark:bg-gray-700"
          >
            {[10, 20, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <span className="text-lg text-gray-700 font-semibold">entries</span>
        </div>

        <div className="flex items-center px-3 py-2 flex-1 max-w-xs sm:max-w-sm">
          <Input
            placeholder="Search discount..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border-none p-0 ml-2 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-w-0"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="min-w-[900px] w-full px-2">
          <TableHeader>
            <TableRow className="text-center" >
              <TableHead className="text-center">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    discounts.length > 0 &&
                    selectedIds.length === discounts.length
                  }
                />
              </TableHead>
              <TableHead className="text-center">Discount Name</TableHead>
              <TableHead className="text-center">Amount</TableHead>
              <TableHead className="text-center">Start Date <span className="mx-1 text-gray-500">→</span>End Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {discounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No discounts found.
                </TableCell>
              </TableRow>
            ) : (
              discounts.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(discount.id)}
                      onChange={() => toggleSelect(discount.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {discount.name}
                      </span>

                      <span
                        className={`inline-flex items-center justify-center w-fit mx-auto px-2.5 py-1 rounded-full text-xs font-medium ${
                          discount.type?.toLowerCase() === "percentage"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        }`}
                      >
                        {discount.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {discount.type === "PERCENTAGE" ? "%" : "₹"}
                    {discount.amount}
                  </TableCell>
                  <TableCell className="text-center">
                    {discount.start_date && discount.end_date ? (
                      <span className="text-sm">
                        {new Date(discount.start_date).toLocaleDateString("en-GB")}{" "}
                        <span className="mx-1 text-gray-500">→</span>
                        {new Date(discount.end_date).toLocaleDateString("en-GB")}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        discount.active
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {discount.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        align="end"
                        sideOffset={5}
                        className="z-[9999] w-36 bg-white border-2 rounded-md"
                      >
                        <PermissionGuard permission="edit_discounts">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/discounts/edit/${discount.id}`)
                            }
                            className="flex items-center justify-center py-1 text-yellow-500 text-lg border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </PermissionGuard>
                        <PermissionGuard permission="delete_discounts">
                          <DropdownMenuItem
                            onClick={() => handleDelete(discount.id)}
                            className="flex items-center justify-center py-1 text-lg border text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4 " /> Delete
                          </DropdownMenuItem>
                        </PermissionGuard>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

          {/* Pagination */}
      {meta && (
<div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-2 mt-2 border-t-2 border-b-2">
          <div className="text-sm md:text-base font-semibold text-gray-600 dark:text-white ml-3">
            Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total ?? 0} entries
          </div>
          <div className="flex justify-between items-center mt-4 gap-2">
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="bg-red-500 text-white cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
                        {/* First Page */}
                        <Button
                          size="sm"
                          variant={meta.current_page === 1 ? "default" : "outline"}
                          onClick={() => setTotalPages(1)}
                        >
                          1
                        </Button>
            
                        {/* Left ellipsis */}
                        {meta.current_page > 3 && <span className="px-2">...</span>}
            
                        {/* Middle Pages */}
                        {Array.from({ length: 3 }, (_, i) => {
                          const pageNumber = meta.current_page - 1 + i;
                          if (pageNumber > 1 && pageNumber < meta.last_page) {
                            return (
                              <Button
                                key={pageNumber}
                                size="sm"
                                variant={
                                  meta.current_page === pageNumber ? "default" : "outline"
                                }
                                onClick={() => setTotalPages(pageNumber)}
                              >
                                {pageNumber}
                              </Button>
                            );
                          }
                          return null;
                        })}
            
                        {/* Right ellipsis */}
                        {meta.current_page < meta.last_page - 2 && (
                          <span className="px-2">...</span>
                        )}
            
                        {/* Last Page */}
                        {meta.last_page > 1 && (
                          <Button
                            size="sm"
                            variant={
                              meta.current_page === meta.last_page ? "default" : "outline"
                            }
                            onClick={() => setTotalPages(meta.last_page)}
                          >
                            {meta.last_page}
                          </Button>
                        )}
            <Button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
              className="bg-red-500 text-white cursor-pointer"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          </div>
          )}
    </div>
  );
};

export default DiscountTable;
