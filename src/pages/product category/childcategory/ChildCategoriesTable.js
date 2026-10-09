import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash2, Plus } from "lucide-react";
import Button from "../../../components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Input from "../../../components/ui/Input";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/Card";
import PermissionGuard from "../../../components/auth/PermissionGuard";

const ChildCategoriesTable = () => {
  const [headCategories, setHeadCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [areAllOnPageSelected, setAreAllOnPageSelected] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;
  const [currentPage, setPage] = useState(pageFromUrl);
  const perpageFromUrl = parseInt(queryParams.get("per_page"));
  const [entriesPerPage, setEntriesPerPage] = useState(perpageFromUrl || 10);
  const [lastPage, setLastPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [sortDir] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ Fetch all pages helper
  const fetchAllPages = async (url) => {
    try {
      let allData = [];
      let page = 1;
      let lastPage = 1;

      do {
        const res = await axios.get(`${url}?page=${page}`);
        allData = [...allData, ...(res.data.data || [])];
        lastPage = res.data.meta.last_page;
        page++;
      } while (page <= lastPage);

      return allData;
    } catch (err) {
      console.error("Error fetching all pages:", err);
      return [];
    }
  };

  // ✅ Fetch data
  const fetchData = async (page = 1, perPage = 10, search = "") => {
    try {
      const [headData, parentData, childRes] = await Promise.all([
        fetchAllPages(
          "https://tyka.premierhostings.com/beta/api/product-categories"
        ),
        fetchAllPages(
          "https://tyka.premierhostings.com/beta/api/product-sub-categories"
        ),
        axios.get(
          `https://tyka.premierhostings.com/beta/api/product-child-categories?page=${page}&perPage=${perPage}&search=${search}&sortDir=${sortDir}`
        ),
      ]);

      setHeadCategories(headData || []);
      setParentCategories(parentData || []);
      setChildCategories(childRes.data.data || []);
      setLastPage(childRes.data.meta.last_page);
      setTotalEntries(childRes.data.meta.total);
      setSelectedChildren([]);
      setAreAllOnPageSelected(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories from API.");
    }
  };

  // ✅ Trigger fetch when query params change
  useEffect(() => {
    fetchData(currentPage, entriesPerPage, searchTerm);
  }, [currentPage, entriesPerPage, searchTerm]);

  const handleSelectAllCategories = () => {
    if (areAllOnPageSelected) {
      setSelectedChildren([]);
    } else {
      setSelectedChildren(childCategories.map((c) => c.id));
    }
    setAreAllOnPageSelected(!areAllOnPageSelected);
  };

  const handleSelectCategory = (id) => {
    if (selectedChildren.includes(id)) {
      setSelectedChildren(selectedChildren.filter((cid) => cid !== id));
    } else {
      setSelectedChildren([...selectedChildren, id]);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(
        `https://tyka.premierhostings.com/beta/api/product-child-categories/${id}`
      );
      fetchData(currentPage, entriesPerPage, searchTerm);
      toast.success("Child category deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete child category.");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedChildren.map((id) =>
          axios.delete(
            `https://tyka.premierhostings.com/beta/api/product-child-categories/${id}`
          )
        )
      );
      fetchData(currentPage, entriesPerPage, searchTerm);
      setSelectedChildren([]);
      setAreAllOnPageSelected(false);
      toast.success("Selected child categories deleted successfully!");
    } catch (err) {
      toast.error("Bulk delete failed.");
      console.error(err);
    }
  };

  return (
    <div className="overflow-x-auto p-2">
      {/* Header */}
      <CardHeader className="space-y-4">
        <div className="flex flex-col space-y-2">
          <CardTitle className="text-lg sm:text-xl">Child Categories</CardTitle>
          <CardDescription className="text-sm">
            Manage your lowest-level product categories
          </CardDescription>
        </div>
        <div className="flex flex-col justify-end sm:flex-row gap-3 w-full">
          {selectedChildren.length > 0 && (
            <PermissionGuard permission="bulk_delete_child_categories">
              <Button
                className="flex-shrink-0 w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white"
                onClick={handleBulkDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Bulk Delete ({selectedChildren.length})
              </Button>
            </PermissionGuard>
          )}
          <PermissionGuard permission="create_child_categories">
            <Button
              className="flex-shrink-0 w-full sm:w-auto"
              onClick={() => navigate(`/add-childcategory`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Child Category</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </PermissionGuard>
        </div>
      </CardHeader>

      {/* Show per page + Search */}
      <div className="flex justify-between items-center flex-wrap gap-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded px-2 py-1 dark:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 "
            
            
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-lg font-semibold">entries</span>
        </div>
        <div className="flex items-center px-2 py-1">
          <Input
            placeholder="Search child categories ..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="border-none p-0 ml-2 bg-transparent focus:ring-0 "
            style={{ width: "300px" }}
          />
        </div>
      </div>

      {/* Table */}
      <Table className="min-w-[800px] w-full mt-2">
        <TableHeader>
          <TableRow className="border border-gray-200 ">
            <TableHead className="w-[50px] ">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                checked={
                  childCategories.length > 0 &&
                  selectedChildren.length === childCategories.length
                }
                onChange={handleSelectAllCategories}
              />
            </TableHead>
            <TableHead className="min-w-[150px]">Main Category</TableHead>
            <TableHead className="min-w-[150px]">Parent Category</TableHead>
            <TableHead className="min-w-[150px]">Child Category Name</TableHead>
            <TableHead className="min-w-[150px]">Slug</TableHead>
            <TableHead className="min-w-[100px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {childCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                No child categories found.
              </TableCell>
            </TableRow>
          ) : (
            childCategories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    checked={selectedChildren.includes(cat.id)}
                    onChange={() => handleSelectCategory(cat.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {headCategories.find((h) => h.id === cat.product_category_id)
                    ?.name || "N/A"}
                </TableCell>
                <TableCell className="font-medium">
                  {parentCategories.find(
                    (p) => p.id === cat.product_subcategory_id
                  )?.name || "N/A"}
                </TableCell>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="font-medium text-gray-500">
                  {cat.slug}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <PermissionGuard permission="edit_child_categories">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(
                            `/edit-childcategory/${cat.id}?page=${currentPage}&per_page=${entriesPerPage}`
                          )
                        }
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permission="delete_child_categories">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCategory(cat.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </PermissionGuard>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Bottom Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-t-2 border-b-2">
        <div className="text-lg font-semibold text-gray-600 dark:text-white">
          Showing{" "}
          {totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to{" "}
          {currentPage * entriesPerPage > totalEntries
            ? totalEntries
            : currentPage * entriesPerPage}{" "}
          of {totalEntries} entries
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            size="sm"
            disabled={currentPage === lastPage}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChildCategoriesTable;
