import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import { Edit, Trash2,ChevronLeft, ChevronRight  } from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import PermissionGuard from "../../components/auth/PermissionGuard";

const BrandTable = ({
  selectedBrands = [],
  onSelectBrand = () => { },
  onSelectAll = () => { },
  onDelete = () => { },
  onViewImage = () => { },
}) => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBrands();
  }, [currentPage, entriesPerPage, searchTerm]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/product-brands?page=${currentPage}&perPage=${entriesPerPage}&search=${searchTerm}&sortDir=desc`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        setBrands(data.data);
        if (data.meta) {
          setMeta(data.meta);
          setTotalPages(data.meta.last_page || 1);
          setTotalItems(data.meta.total || data.data.length);
        }
      } else {
        console.error("Unexpected API format:", data);
        setBrands([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(
            `https://tyka.premierhostings.com/beta/api/product-brands/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          fetchBrands();
          onDelete(id);
          Swal.fire("Deleted!", "Brand has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting brand:", error);
          Swal.fire("Error", "Failed to delete brand.", "error");
        }
      }
    });
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="overflow-x-auto rounded-lg p-4">
      {/* Search & Show Entries */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
<div className="dark:text-white">
  <label className="text-lg font-medium text-gray-700 dark:text-white mr-2">
    Show
  </label>

  <select
    value={entriesPerPage}
    onChange={handleEntriesChange}
    className="border border-gray-300 dark:border-slate-500 dark:bg-slate-600 dark:text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
  >
    {[10, 20, 50, 100].map((num) => (
      <option key={num} value={num}>
        {num}
      </option>
    ))}
  </select>

  <span className="text-lg font-semibold text-gray-700 dark:text-white ml-2">
    entries
  </span>
</div>
        <div>
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 rounded px-2 py-1 w-48"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-6 text-center dark:text-white text-gray-500">
          Loading brands...
        </div>
      ) : (
        <table className="min-w-full divide-y">
          <thead className="border">
            <tr className="border">
              <th className="px-3 py-3 border-r-2 text-center">
                <input
                  type="checkbox"
                  className="rounded  border-gray-300 accent-blue-600 focus:ring-blue-500"
                  onChange={(e) => onSelectAll(e.target.checked)}
                  checked={
                    brands.length > 0 && selectedBrands.length === brands.length
                  }
                />
              </th>
              <th className="px-6 py-3 border-r-2 text-center text-sm font-medium capitalize dark:text-white">
                Brand Name
              </th>
              <th className="px-6 py-3 border-r-2 text-center text-sm font-medium capitalize dark:text-white">
                Slug
              </th>
              <th className="px-6 py-3 border-r-2 text-center text-sm font-medium capitalize dark:text-white">
                Status
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium capitalize dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:text-white">
            {brands.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-gray-500 dark:text-white"
                >
                  No brands found.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-3 py-4 text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={(e) =>
                        onSelectBrand(brand.id, e.target.checked)
                      }
                    />
                  </td>

                  <td className="px-6 py-4 text-center">                    
                    <div className="flex items-center justify-center gap-3">
                      <img
                        className="h-12 w-12 rounded-lg object-cover cursor-pointer hover:opacity-80"
                        src={
                          brand.logo ||
                          "/placeholder.svg?height=48&width=48&query=brand-logo"
                        }
                        alt={brand.brand_name}
                        onClick={() => onViewImage(brand.logo)}
                      />
                      <span>{brand.brand_name}</span>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4 truncate max-w-xs text-center"
                    title={brand.slug}
                  >
                    {brand.slug}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${brand.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {brand.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-center">
                    <div className="flex space-x-2">
                      <PermissionGuard permission="create_role">
                        <button
                          onClick={() => navigate(`/edit-brands/${brand.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        >
                          <Edit size={16} />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard permission="create_role">
                        <button
                          onClick={() => handleDeleteClick(brand.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

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

export default BrandTable;
