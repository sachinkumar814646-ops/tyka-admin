"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
} from "lucide-react";
import axios from "axios";

const StockAlertPage = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedProductIds, setExpandedProductIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  const fetchStockAlerts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://tyka.premierhostings.com/beta/api/inventory/alerts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page,
            perPage: itemsPerPage,
            search: searchTerm,
          },
        }
      );

      setProducts(res.data.data || []);
      setMeta(res.data.meta || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockAlerts();
  }, [page, itemsPerPage, searchTerm]);

  // Toggle product accordion
  const toggleExpand = (id) => {
    setExpandedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const getPagination = () => {
    const current = meta.current_page || 1;
    const last = meta.last_page || 1;

    const pages = [];

    // First 2 pages
    pages.push(1);
    if (last > 1) pages.push(2);

    // Left ellipsis
    if (current > 4) pages.push("left-ellipsis");

    // Current page ±1
    for (
      let i = Math.max(3, current - 1);
      i <= Math.min(last - 2, current + 1);
      i++
    ) {
      if (!pages.includes(i)) pages.push(i);
    }

    // Right ellipsis
    if (current < last - 3) pages.push("right-ellipsis");

    // Last 2 pages
    if (last > 2 && !pages.includes(last - 1)) pages.push(last - 1);
    if (!pages.includes(last)) pages.push(last);

    return pages;
  };

  return (
    <div className="space-y-4 px-4 py-6">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Stock Alerts</h1>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2">
            <CardTitle>Low Stock Products</CardTitle>
            <CardDescription>
              Click on a row to view variant details
            </CardDescription>
          </div>
          <div className="flex justify-between items-center">

            <div className="flex gap-2 items-center">
              <label className="text-sm ml-4">Show</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Search:</label>
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-black text-white">
                  <TableHead>Product</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Alert Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : products.length > 0 ? (
                  products.map((item) => (
                    <TableRow key={item.variant_id}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(item.hexa_code || item.hexa_code_2) && (
                            <span
                              className="inline-block w-6 h-6 rounded-full border"
                              style={{
                                background: item.hexa_code_2
                                  ? `linear-gradient(135deg, ${item.hexa_code} 50%, ${item.hexa_code_2} 50%)`
                                  : item.hexa_code,
                              }}
                            />
                          )}

                          <span>{item.color || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.size}</TableCell>

                      <TableCell
                        className={
                          item.stock === 0
                            ? "text-red-600 font-semibold"
                            : item.stock <= 5
                              ? "text-yellow-600 font-semibold"
                              : "text-green-600 font-semibold"
                        }
                      >
                        {item.stock}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${item.alert_type === "Out of Stock"
                            ? "bg-red-100 text-red-700"
                            : item.alert_type === "Low Stock"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {item.alert_type}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No products found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t-2 pt-3">

            <div className="text-lg text-gray-500 ">
              Showing {meta.from ?? 0} to {meta.to ?? 0} of {meta.total ?? 0} entries
            </div>

            <div className="flex items-center gap-2">
              <Button
                disabled={meta.current_page === 1}
                onClick={() => setPage(meta.current_page - 1)}
              >
                Previous
              </Button>

              {getPagination().map((item, index) =>
                typeof item === "string" ? (
                  <span key={index} className="px-2">
                    ...
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={item === meta.current_page ? "default" : "outline"}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </Button>
                )
              )}

              <Button
                disabled={meta.current_page === meta.last_page}
                onClick={() => setPage(meta.current_page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAlertPage;
