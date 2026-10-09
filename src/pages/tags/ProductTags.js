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
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import PermissionGuard from "../../components/auth/PermissionGuard";

const ProductTagsPage = () => {
  const navigate = useNavigate();
  const [productTags, setProductTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [meta, setMeta] = useState(null);
  const [lastPage, setLastPage] = useState(1);

  const token = localStorage.getItem("token");

  // Fetch product tags from API
  const fetchTags = async () => {
    try {
      const res = await axios.get(
        `https://tyka.premierhostings.com/beta/api/tags?page=${page}&perPage=${itemsPerPage}&search=${searchTerm}&sortDir=desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Tag List API Response:", res.data);
      setProductTags(res.data.data || []);
      if (res.data.meta) {
        setMeta(res.data.meta)
        setTotalItems(res.data.meta.total || 0);
        setLastPage(res.data.meta.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching tags:", error.response || error);
      setProductTags([]);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [page, itemsPerPage, searchTerm]);

  // Delete single tag
  const deleteTag = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This tag will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://tyka.premierhostings.com/beta/api/tags/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire("Deleted!", "The tag has been deleted.", "success");
          fetchTags();
        } catch (error) {
          console.error("Error deleting tag:", error.response || error);
          Swal.fire("Error", "Failed to delete the tag.", "error");
        }
      }
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedTags.length === 0) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedTags.length} tags.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Promise.all(
            selectedTags.map((id) =>
              axios.delete(
                `https://tyka.premierhostings.com/beta/api/tags/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
            )
          );
          Swal.fire("Deleted!", "Selected tags have been deleted.", "success");
          setSelectedTags([]);
          fetchTags();
        } catch (error) {
          console.error("Bulk delete error:", error.response || error);
          Swal.fire("Error", "Failed to delete selected tags.", "error");
        }
      }
    });
  };

  const areAllOnPageSelected =
    productTags.length > 0 &&
    productTags.every((tag) => selectedTags.includes(tag.id));

  const handleSelectAllTags = (e) => {
    if (e.target.checked) {
      const idsOnPage = productTags.map((tag) => tag.id);
      setSelectedTags((prev) => [...new Set([...prev, ...idsOnPage])]);
    } else {
      const idsOnPage = productTags.map((tag) => tag.id);
      setSelectedTags((prev) => prev.filter((id) => !idsOnPage.includes(id)));
    }
  };

  const handleSelectTag = (id) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-4">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Product Tags</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Product Tags</CardTitle>
              <CardDescription>Manage your product tags</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedTags.length > 0 && (
                <PermissionGuard permission="bulk_delete_product_tags">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete ({selectedTags.length})
                  </Button>
                </PermissionGuard>
              )}
              <PermissionGuard permission="create_product_tags">
                <Button onClick={() => navigate("/add-tag")}>
                  <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
              </PermissionGuard>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2">
      <label
        htmlFor="usersPerPage"
        className="text-lg font-medium text-gray-700"
      >
        Show
      </label>

      <select
        id="itemsPerPage"
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(Number(e.target.value));
          setPage(1);
        }}
        className="border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {[10, 20, 50, 100].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>

      <span className="text-lg text-gray-700 font-semibold">entries</span>
    </div>
            <div className="flex items-center px-0 py-2">
              <Input
                placeholder="Search tags ..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="border-none ml-2"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border p-2">
                  <TableHead className="border-r-2 text-center">
                    <input
                      type="checkbox"
                      checked={areAllOnPageSelected}
                      onChange={handleSelectAllTags}
                    />
                  </TableHead>
                  <TableHead className=" border-r-2 text-center" >Tags Name</TableHead>
                  <TableHead className=" border-r-2 text-center">Status</TableHead>
                  <TableHead className=" border-r-2 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-center">
                {productTags.length > 0 ? (
                  productTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => handleSelectTag(tag.id)}
                        />
                      </TableCell>
                      <TableCell className="text-center">{tag.name}</TableCell>
                      <TableCell className="text-center" >
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            tag.status === true
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {tag.status === true ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <PermissionGuard permission="edit_product_tags">
                            <Button
                              onClick={() => navigate(`/edit-tag/${tag.id}`)}
                              variant="outline"
                              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 dark:border-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                            >
                              <Edit size={18} />
                            </Button>
                          </PermissionGuard>

                          <PermissionGuard permission="delete_product_tags">
                            <Button
                              variant="outline"
                              onClick={() => deleteTag(tag.id)}
                              className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No Product Tags found
                    </TableCell>
                  </TableRow>
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
                          onClick={() => setLastPage(1)}
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
                                onClick={() => setLastPage(pageNumber)}
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
                            onClick={() => setLastPage(meta.last_page)}
                          >
                            {meta.last_page}
                          </Button>
                        )}
            <Button
              disabled={page === lastPage || lastPage === 0}
              onClick={() => setPage(page + 1)}
              className="bg-red-500 text-white cursor-pointer"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductTagsPage;
