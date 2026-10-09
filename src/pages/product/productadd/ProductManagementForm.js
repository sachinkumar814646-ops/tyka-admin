"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GeneralTab from "../../../components/tabs/addtab/GeneralTab";
import DataTab from "../../../components/tabs/addtab/DataTab";
import LinksTab from "../../../components/tabs/addtab/LinksTab";
import ImagesTab from "../../../components/tabs/addtab/ImagesTab";
import VariationsTab from "../../../components/tabs/addtab/VariationsTab";

const ProductManagementForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  const [activeTab, setActiveTab] = useState("general");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loader state

  const [productData, setProductData] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    price: "",
    stock: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    status: true,
    new: false,
    featured: false,
    top_selling: false,
    sale: false,
    video_url: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    sku: "",
    hsn: "",
    cost_price: "",
    selling_price: "",
    discount: "",
    gst: "",

    // Product Links Tab Data
    season_id: [],
    fabric_id: [],
    brand_id: [],
    default_image: null,
    images: [],
    tags: [],
    discounts: [],
    head_categories: [],
    parent_categories: [],
    child_categories: [],
    related_products: [],
    variants: [],
    color_ids: [],
    size_ids: [],
  });

  // Fetch product details if editing
  useEffect(() => {
    if (isEditMode === true) {
      fetch(`https://tyka.premierhostings.com/beta/api/products/${id}/edit`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setProductData((prev) => ({
              ...prev,
              ...data,
            }));
          }
        })
        .catch((err) => console.error("❌ Edit Product Error:", err));
    } else {
      fetch(`https://tyka.premierhostings.com/beta/api/products/create`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setProductData((prev) => ({
              ...prev,
              ...data,
            }));
          }
        })
        .catch((err) => console.error("❌ Create Product Error:", err));
    }
  }, [id, isEditMode]);

  const tabs = [
    { id: "general", label: "General" },
    { id: "data", label: "Data" },
    { id: "links", label: "Links" },
    { id: "images", label: "Image" },
    { id: "variations", label: "Variant" },
  ];

  const updateProductData = (field, value) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVariantsUpdate = (
    structuredData,
    default_size,
    default_color,
    color_ids,
    size_ids
  ) => {
    setProductData((prev) => ({
      ...prev,
      variants: structuredData,
      default_size,
      default_color,
      color_ids: color_ids || [],
      size_ids: size_ids || [],
    }));
  };

  // Helper for nested FormData
  const appendFormData = (formData, key, value) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        appendFormData(formData, `${key}[${idx}]`, item);
      });
    } else if (typeof value === "object" && !(value instanceof File)) {
      Object.keys(value).forEach((subKey) => {
        appendFormData(formData, `${key}[${subKey}]`, value[subKey]);
      });
    } else {
      formData.append(key, value);
    }
  };

  const [formData, setFormData] = useState({
    sizes: [],
    colors: [],
    default_size: "",
    default_color: "",
  });

  const [tableData, setTableData] = useState({});

  // This will get updated structured data when variations change
  const handleUpdateData = (
    structuredData,
    defaultSize,
    defaultColor,
    colorIds,
    sizeIds
  ) => {
    handleVariantsUpdate(
      structuredData,
      defaultSize,
      defaultColor,
      colorIds,
      sizeIds
    );
  };

  // ✅ Validate before save
  const validateForm = async () => {
    if (!productData.name || productData.name.trim() === "") {
      toast.error("❌ Product name is required.");
      return false;
    }
    if (!productData.slug || productData.slug.trim() === "") {
      toast.error("❌ Slug is required.");
      return false;
    }
    if (!productData.sku || productData.sku.trim() === "") {
      toast.error("❌ SKU is required.");
      return false;
    }
    if (!productData.status) {
      toast.error("❌ Product status must be Active to save.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setLoading(true); // Show loader

    const formData = new FormData();

    for (const key in productData) {
      const value = productData[key];

      if (["status", "new", "featured", "top_selling", "sale"].includes(key)) {
        formData.append(key, value ? 1 : 0);
      } else if (key === "images" && Array.isArray(value)) {
        value.forEach((item) => {
          if (item instanceof File) {
            formData.append("images[]", item);
          }
        });
      } else if (key === "default_image") {
        if (value instanceof File) {
          formData.append("default_image", value);
        }
      } else {
        appendFormData(formData, key, value);
      }
    }

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await fetch(
        "https://tyka.premierhostings.com/beta/api/products",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ Product saved successfully!");
        setTimeout(() => {
          navigate("/products");
        }, 2200);
      } else {
        if (data?.message) {
          toast.error(`❌ ${data.message}`);
        } else {
          toast.error("❌ Failed to save product. Please check the inputs.");
        }
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      toast.error("❌ An error occurred while saving the product.");
    } finally {
      setLoading(false); // Hide loader
    }
  };

  const getCurrentTabIndex = () =>
    tabs.findIndex((tab) => tab.id === activeTab);

  const goToPreviousTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
  };

  const goToNextTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralTab data={productData} updateData={updateProductData} />;
      case "data":
        return (
          <DataTab
            tags={productData.product_new_tags}
            seasons={productData.seasons}
            fabrics={productData.fabric_types}
            brands={productData.brands}
            discounts={productData.discounts}
            formData={productData}
            updateData={updateProductData}
          />
        );
      case "links":
        return (
          <LinksTab
            categories={productData.new_categories}
            subcategories={productData.sub_catgegories}
            childcategories={productData.child_catgegories}
            products={productData.related_products}
            tags={productData.product_new_tags}
            formData={productData}
            updateData={updateProductData}
          />
        );
      case "images":
        return (
          <ImagesTab
            data={{
              default_image: productData.default_image,
              images: productData.images,
            }}
            updateData={(updated) =>
              setProductData((prev) => ({
                ...prev,
                default_image: updated.default_image,
                images: updated.images,
              }))
            }
          />
        );
      case "variations":
        return (
          <VariationsTab
            sizes={productData.product_sizes}
            colors={productData.product_colors}
            formData={formData}
            setFormData={setFormData}
            tableData={tableData}
            setTableData={setTableData}
            updateData={handleUpdateData}
          />
        );
      default:
        return <GeneralTab data={productData} updateData={updateProductData} />;
    }
  };

  return (
    <div
      className="product-form-container dark:bg-gray-900 dark:text-white bg-transparent"
      style={{
        width: "100%",
        overflowY: "hidden",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        position: "relative",
      }}
    >
      {/* Loader */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              border: "8px solid #f3f3f3",
              borderTop: "8px solid #dc2626",
              borderRadius: "50%",
              width: "70px",
              height: "70px",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      )}

      <div style={{ minWidth: "768px", paddingBottom: "20px" }}>
        <div
          className="dark:text-white"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 10px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
            {isEditMode ? "Edit Product" : "Add Product"}
          </h2>
        </div>

        <hr className="border-gray-300 dark:border-gray-700 mt-0" />

        {/* Tabs */}
        <div
          className="dark:text-white"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 10px 0",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderBottom:
                    activeTab === tab.id
                      ? "3px solid #dc2626"
                      : "3px solid transparent",
                  backgroundColor:
                    activeTab === tab.id ? "#dc2626" : "transparent",
                  color: activeTab === tab.id ? "#fff" : "inherit",
                  fontWeight: activeTab === tab.id ? "bold" : "normal",
                  borderRadius: "5px 5px 0 0",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-gray-300 dark:border-gray-700 mt-0" />

        {/* Tab Content */}
        <div
          className="tab-content dark:text-white"
          style={{ padding: "20px" }}
        >
          {renderTabContent()}
        </div>

        <hr className="border-gray-300 dark:border-gray-700 mt-0" />

        {/* Navigation */}
        <div
          className="form-navigation"
          style={{
            padding: "0 20px 20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={goToPreviousTab}
            disabled={getCurrentTabIndex() === 0}
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "14px",
            }}
          >
            ← Previous
          </button>

          {getCurrentTabIndex() === tabs.length - 1 && (
            <button
              onClick={handleSave}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontWeight: "bold",
                cursor: "pointer",
                marginTop: "14px",
              }}
            >
              Save Product
            </button>
          )}

          <button
            onClick={goToNextTab}
            disabled={getCurrentTabIndex() === tabs.length - 1}
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300 disabled:text-gray-500"
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "14px",
            }}
          >
            Next →
          </button>
        </div>

        <hr className="border-gray-300 dark:border-gray-700 mt-0" />
      </div>
      {/* Toastify Container */}
      <ToastContainer />
    </div>
  );
};

export default ProductManagementForm;
