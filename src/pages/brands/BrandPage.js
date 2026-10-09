import React, { useState, useEffect } from "react";
import { Plus, Upload, Trash2, Search } from "lucide-react";
import BrandTable from "../../pages/brands/BrandTable";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import PermissionGuard from "../../components/auth/PermissionGuard";

const BrandPage = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate();

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(
          "https://tyka.premierhostings.com/beta/api/product-brands"
        );
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setBrands(data.data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  // Filter brands based on search term
  useEffect(() => {
    const filtered = brands.filter(
      (brand) =>
        brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [brands, searchTerm]);

  const handleSelectBrand = (brandId, isSelected) => {
    if (isSelected) {
      setSelectedBrands([...selectedBrands, brandId]);
    } else {
      setSelectedBrands(selectedBrands.filter((id) => id !== brandId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedBrands(filteredBrands.map((brand) => brand.id));
    } else {
      setSelectedBrands([]);
    }
  };
  // BrandPage.js

  const handleDelete = async (id) => {
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
          await axios.delete(
            `https://tyka.premierhostings.com/beta/api/brands/delete/${id}`
          );

          setBrands((prev) => prev.filter((brand) => brand.id !== id));

          Swal.fire("Deleted!", "Brand hardtrttgs been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the brand.", "error");
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedBrands.length === 0) {
      Swal.fire("Info", "No brands selected.", "info");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${selectedBrands.length} selected brands?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(
          "https://tyka.premierhostings.com/beta/api/product-brand/bulk-delete",
          { ids: selectedBrands }
          // {
          //   headers: {
          //     Authorization: `Bearer ${token}`, // agar auth required ho
          //   },
          // }
        );

        // fresh list reload karne ke liye
        setBrands();
        setSelectedBrands([]);

        Swal.fire("Deleted!", "Selected brands have been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete selected brands.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 ">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">
        Brand Management
      </h1>
      <div className="max-w-7xl mx-auto rounded-lg shadow-sm border-2">
        {/* Header */}
        <div className="py-3 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Brands
              </h1>
              <p className="text-gray-600 mt-1">Manage your brand</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <PermissionGuard permission="bulk_delete_brands">
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedBrands.length === 0}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <Trash2 size={16} className="mr-2" />
                  Bulk Delete ({selectedBrands.length})
                </button>
              </PermissionGuard>
              <PermissionGuard permission="create_brands">
                <button
                  onClick={() => navigate("/add-brands")}
                  className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Add Brand
                </button>
              </PermissionGuard>
            </div>
          </div>
        </div>

        {/* Table */}
        <BrandTable
          brands={filteredBrands}
          selectedBrands={selectedBrands}
          onSelectBrand={handleSelectBrand}
          onSelectAll={handleSelectAll}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default BrandPage;
