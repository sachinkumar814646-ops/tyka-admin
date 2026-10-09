"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Plus,
  Pencil,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import PermissionGuard from "../../components/auth/PermissionGuard";

const CurrenciesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currencies, setCurrencies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);

  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(initialPage);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    if (page !== currentPage) {
      searchParams.set("page", page);
      setSearchParams(searchParams, { replace: true });
    }
  }, [page, searchParams, setSearchParams]);

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setPage(1);
      searchParams.set("page", "1");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchTerm]);

  const fetchCurrencies = async () => {
    try {
      const res = await axios.get(
        "https://tyka.premierhostings.com/beta/api/bundles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            perPage: itemsPerPage,
            page,
            search: searchTerm || undefined,
          },
        },
      );
      console.log("response", res);
      debugger;

      const data = res.data.data || [];
      const meta = res.data.meta || {};

      setCurrencies(data);
      setTotalPages(meta.last_page || 1);
      setTotalItems(meta.total || 0);
      setStartIndex(meta.from ? meta.from - 1 : 0);
      setEndIndex(meta.to || 0);
    } catch (error) {
      console.error("Error fetching bundles:", error.response || error);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, [page, itemsPerPage, searchTerm]);

  const deleteCurrency = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This Bundle will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://tyka.premierhostings.com/beta/api/bundles/${id}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          Swal.fire("Deleted!", "The Bundle has been deleted.", "success");
          fetchCurrencies();
        } catch (error) {
          console.error("Error deleting bundle:", error.response || error);
          Swal.fire("Error", "Failed to delete the bundle.", "error");
        }
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedCurrencies.length === 0) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedCurrencies.length} currencies.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(
            `https://tyka.premierhostings.com/beta/api/currency/bundles`,
            { ids: selectedCurrencies },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          Swal.fire(
            "Deleted!",
            "Selected bundles have been deleted.",
            "success",
          );
          setSelectedCurrencies([]);
          fetchCurrencies();
        } catch (error) {
          console.error("Bulk delete error:", error.response || error);
          Swal.fire("Error", "Failed to delete selected bundles.", "error");
        }
      }
    });
  };

  const areAllOnPageSelected =
    currencies.length > 0 &&
    currencies.every((currency) => selectedCurrencies.includes(currency.id));

  const handleSelectAllCurrencies = (e) => {
    const idsOnPage = currencies.map((currency) => currency.id);
    if (e.target.checked) {
      setSelectedCurrencies((prev) => [...new Set([...prev, ...idsOnPage])]);
    } else {
      setSelectedCurrencies((prev) =>
        prev.filter((id) => !idsOnPage.includes(id)),
      );
    }
  };

  const handleSelectCurrency = (id) => {
    setSelectedCurrencies((prev) =>
      prev.includes(id)
        ? prev.filter((currencyId) => currencyId !== id)
        : [...prev, id],
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-4">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Bundles</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Bundles</CardTitle>
              <CardDescription>Manage your bundles</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedCurrencies.length > 0 && (
                <PermissionGuard permission="bulk_delete_currency">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete ({selectedCurrencies.length})
                  </Button>
                </PermissionGuard>
              )}
              <PermissionGuard permission="create_currency">
                <Button onClick={() => navigate("/add-bundle")}>
                  <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
              </PermissionGuard>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <label>Show</label>
              <select
                className="mb-2 border dark:bg-slate-600"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label>entries</label>
            </div>
            <div className="flex items-center px-0 py-2">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-none ml-2"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={areAllOnPageSelected}
                      onChange={handleSelectAllCurrencies}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.length > 0 ? (
                  currencies.map((currency) => (
                    <TableRow key={currency.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedCurrencies.includes(currency.id)}
                          onChange={() => handleSelectCurrency(currency.id)}
                        />
                      </TableCell>
                      <TableCell>{currency.name}</TableCell>
                      <TableCell>
                        {currency.status === true || currency.status === 1 ? (
                          <span className="text-green-500 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <PermissionGuard permission="edit_currency">
                          <button
                            onClick={() =>
                              navigate(
                                `/show-bundle/${currency.id}?page=${page}&per_page=${itemsPerPage}`,
                              )
                            }
                            className="text-blue-500 mr-3"
                          >
                            <Eye size={18} />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="edit_currency">
                          <button
                            onClick={() =>
                              navigate(
                                `/edit-bundle/${currency.id}?page=${page}&per_page=${itemsPerPage}`,
                              )
                            }
                            className="text-blue-500 mr-3"
                          >
                            <Pencil size={18} />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="edit_currency">
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => deleteCurrency(currency.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No Bundles found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 flex-wrap gap-2 dark:text-white">
            <div>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
              {totalItems} entries
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Previous Button */}
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="bg-red-500 text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              {/* First Page */}
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

              {/* Left Dots */}
              {page > 3 && <span className="px-2 flex items-center">...</span>}

              {/* Dynamic Middle Pages */}
              {Array.from({ length: 3 }, (_, i) => {
                const pageNumber = page - 1 + i;
                if (pageNumber > 1 && pageNumber < totalPages) {
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

              {/* Right Dots */}
              {page < totalPages - 2 && (
                <span className="px-2 flex items-center">...</span>
              )}

              {/* Last Page */}
              {totalPages > 1 && (
                <button
                  className={`px-3 py-1 border rounded ${
                    page === totalPages
                      ? "bg-red-600 text-white"
                      : "bg-transparent dark:text-white"
                  }`}
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
                </button>
              )}

              {/* Next Button */}
              <Button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="bg-red-500 text-white disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrenciesPage;
