import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Button from "../../components/ui/Button";
import MultiSelect from "../../components/common/MultiSelect.jsx";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const BASE_URL = "https://tyka.premierhostings.com/beta/api";

export default function EditBundle() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────
  // Bundle fields
  // ─────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [discount, setDiscount] = useState("");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [status, setStatus] = useState("true");

  // ─────────────────────────────────────────────────────────────
  // Loading states
  // ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);

  // Bundle loading is independent from products loading
  const [loadingBundle, setLoadingBundle] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // ─────────────────────────────────────────────────────────────
  // Products
  // ─────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);

  // Selected product IDs
  const [bundleProducts, setBundleProducts] = useState([]);

  // Product + selected variant + quantity
  const [bundleVariants, setBundleVariants] = useState({});

  // Original bundle items from API
  const [bundleItems, setBundleItems] = useState([]);

  // Used to prevent price overwrite during initial bundle load
  const [isPriceInitialized, setIsPriceInitialized] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Fetch bundle first
  // ─────────────────────────────────────────────────────────────
  const fetchBundle = async () => {
    try {
      setLoadingBundle(true);

      const token = localStorage.getItem("token");

      const [bundleRes, itemsRes] = await Promise.all([
        fetch(`${BASE_URL}/bundles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${BASE_URL}/bundle-items/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!bundleRes.ok) {
        throw new Error("Failed to fetch bundle.");
      }

      if (!itemsRes.ok) {
        throw new Error("Failed to fetch bundle items.");
      }

      const bundleData = await bundleRes.json();
      const itemsData = await itemsRes.json();

      console.log("Bundle API:", bundleData);
      console.log("Bundle Items API:", itemsData);

      const bundle = bundleData?.data || bundleData;

      const items =
        itemsData?.data?.items || itemsData?.data || itemsData?.items || [];

      // ─────────────────────────────────────────────
      // Bundle details
      // ─────────────────────────────────────────────
      setName(bundle?.name || "");
      setDescription(bundle?.description || "");

      setOriginalPrice(
        bundle?.original_price !== null && bundle?.original_price !== undefined
          ? String(bundle.original_price)
          : "",
      );

      setOfferPrice(
        bundle?.offer_price !== null && bundle?.offer_price !== undefined
          ? String(bundle.offer_price)
          : "",
      );

      setDiscount(
        bundle?.discount !== null && bundle?.discount !== undefined
          ? String(bundle.discount)
          : "",
      );

      setStatus(
        bundle?.status === true ||
          bundle?.status === 1 ||
          bundle?.status === "1" ||
          bundle?.status === "true"
          ? "true"
          : "false",
      );

      if (bundle?.start_date) {
        setStartDate(dayjs(bundle.start_date));
      } else {
        setStartDate(null);
      }

      if (bundle?.end_date) {
        setEndDate(dayjs(bundle.end_date));
      } else {
        setEndDate(null);
      }

      // Price has now been initialized from backend
      setIsPriceInitialized(true);

      // ─────────────────────────────────────────────
      // Save raw bundle items
      // ─────────────────────────────────────────────
      setBundleItems(items);

      // ─────────────────────────────────────────────
      // Extract selected product IDs
      // ─────────────────────────────────────────────
      const selectedProductIds = items
        .map((item) => {
          return Number(
            item?.product?.id ||
              item?.product_id ||
              item?.product?.product_id ||
              0,
          );
        })
        .filter(Boolean);

      console.log("Selected Product IDs:", selectedProductIds);

      setBundleProducts(selectedProductIds);

      // ─────────────────────────────────────────────
      // Store selected variant + quantity
      // Product object will be attached AFTER products load
      // ─────────────────────────────────────────────
      const variants = {};

      items.forEach((item) => {
        const productId = Number(
          item?.product?.id ||
            item?.product_id ||
            item?.product?.product_id ||
            0,
        );

        const variantId = Number(
          item?.variant?.id ||
            item?.product_variant_id ||
            item?.variant_id ||
            0,
        );

        if (!productId) return;

        variants[productId] = {
          product: item?.product || null,
          selectedVariant: variantId || "",
          quantity: Number(item?.quantity || 1),
        };
      });

      setBundleVariants(variants);

      console.log("Initial Bundle Variants:", variants);
    } catch (error) {
      console.error("fetchBundle error:", error);

      toast.error(error.message || "Failed to load bundle data.");
    } finally {
      setLoadingBundle(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Fetch products AFTER bundle has loaded
  // ─────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);

      const token = localStorage.getItem("token");

      // First page
      const firstResponse = await fetch(
        `${BASE_URL}/products?perPage=100&page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!firstResponse.ok) {
        throw new Error("Failed to fetch products.");
      }

      const firstData = await firstResponse.json();

      const lastPage = Number(firstData?.meta?.last_page || 1);

      const firstProducts = firstData?.data || [];

      // Remaining pages
      const requests = [];

      for (let page = 2; page <= lastPage; page++) {
        requests.push(
          fetch(`${BASE_URL}/products?perPage=100&page=${page}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(async (res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch products page ${page}`);
            }

            return res.json();
          }),
        );
      }

      const responses = requests.length > 0 ? await Promise.all(requests) : [];

      const allProducts = [
        ...firstProducts,
        ...responses.flatMap((item) => item?.data || []),
      ];

      console.log("All Products:", allProducts);

      setProducts(allProducts);

      // ─────────────────────────────────────────────
      // Attach complete product objects to selected bundle products
      // ─────────────────────────────────────────────
      setBundleVariants((previous) => {
        const updated = { ...previous };

        Object.keys(updated).forEach((pid) => {
          const productId = Number(pid);

          const product = allProducts.find((p) => Number(p?.id) === productId);

          if (product) {
            updated[pid] = {
              ...updated[pid],
              product,
            };
          }
        });

        return updated;
      });

      return allProducts;
    } catch (error) {
      console.error("fetchProducts error:", error);

      toast.error(error.message || "Failed to load products.");

      return [];
    } finally {
      setLoadingProducts(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // IMPORTANT:
  //
  // 1. Bundle loads first
  // 2. Once bundle loading is finished
  // 3. Products start loading
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      await fetchBundle();

      if (!mounted) return;

      await fetchProducts();
    };

    loadData();

    return () => {
      mounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─────────────────────────────────────────────────────────────
  // Recalculate original price ONLY when product selection changes
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loadingBundle) return;
    if (!isPriceInitialized) return;

    // Don't calculate until products are available
    if (loadingProducts) return;

    let total = 0;

    bundleProducts.forEach((pid) => {
      const product = products.find((p) => Number(p?.id) === Number(pid));

      if (product) {
        total += Number(product?.selling_price || product?.price || 0);
      }
    });

    setOriginalPrice(total.toFixed(2));
  }, [
    bundleProducts,
    products,
    loadingBundle,
    loadingProducts,
    isPriceInitialized,
  ]);

  // ─────────────────────────────────────────────────────────────
  // Offer price change
  // ─────────────────────────────────────────────────────────────
  const handleOfferPriceChange = (e) => {
    const value = e.target.value;

    const offer = Number(value || 0);
    const original = Number(originalPrice || 0);

    setOfferPrice(value);

    if (original > 0) {
      const calculatedDiscount = ((original - offer) / original) * 100;

      setDiscount(Math.max(0, calculatedDiscount).toFixed(2));
    } else {
      setDiscount("0");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Discount change
  // ─────────────────────────────────────────────────────────────
  const handleDiscountChange = (e) => {
    let value = e.target.value;

    let percentage = Number(value || 0);

    if (percentage > 100) {
      percentage = 100;
      value = "100";
    }

    if (percentage < 0) {
      percentage = 0;
      value = "0";
    }

    const original = Number(originalPrice || 0);

    setDiscount(value);

    if (original > 0) {
      const calculatedOffer = original - (original * percentage) / 100;

      setOfferPrice(calculatedOffer.toFixed(2));
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Product selection
  // ─────────────────────────────────────────────────────────────
  const handleBundleProducts = (selected) => {
    if (selected.length > 5) {
      toast.error("Maximum 5 products allowed.");
      return;
    }

    const normalizedSelected = selected.map(Number);

    setBundleProducts(normalizedSelected);

    setBundleVariants((previous) => {
      const variants = {};

      normalizedSelected.forEach((pid) => {
        const product = products.find((p) => Number(p?.id) === Number(pid));

        const previousItem = previous?.[pid];

        variants[pid] = {
          product: product || previousItem?.product || null,

          selectedVariant: previousItem?.selectedVariant || "",

          quantity: previousItem?.quantity || 1,
        };
      });

      return variants;
    });
  };

  // ─────────────────────────────────────────────────────────────
  // Check whether bundle items changed
  // ─────────────────────────────────────────────────────────────
  const hasItemsChanged = (existingItems, currentProducts, currentVariants) => {
    if (existingItems.length !== currentProducts.length) {
      return true;
    }

    for (const pid of currentProducts) {
      const selectedVariantId = Number(
        currentVariants?.[pid]?.selectedVariant || 0,
      );

      const selectedQty = Number(currentVariants?.[pid]?.quantity || 1);

      const existingItem = existingItems.find(
        (item) =>
          Number(item?.product?.id || item?.product_id || 0) === Number(pid),
      );

      if (!existingItem) {
        return true;
      }

      const existingVariantId = Number(
        existingItem?.variant?.id ||
          existingItem?.product_variant_id ||
          existingItem?.variant_id ||
          0,
      );

      const existingQty = Number(existingItem?.quantity || 1);

      if (existingVariantId !== selectedVariantId) {
        return true;
      }

      if (existingQty !== selectedQty) {
        return true;
      }
    }

    return false;
  };

  // ─────────────────────────────────────────────────────────────
  // Bulk delete bundle items
  // ─────────────────────────────────────────────────────────────
  const bulkDeleteItems = async (ids, token) => {
    if (!ids || ids.length === 0) {
      return;
    }

    const response = await fetch(`${BASE_URL}/bundle-item/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ids,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to delete existing bundle items.",
      );
    }

    return data;
  };

  // ─────────────────────────────────────────────────────────────
  // Create bundle items
  // ─────────────────────────────────────────────────────────────
  const createBundleItems = async (
    bundleId,
    currentProducts,
    currentVariants,
    token,
  ) => {
    const items = currentProducts.map((pid) => {
      const item = currentVariants?.[pid];

      return {
        product_id: Number(pid),
        product_variant_id: Number(item?.selectedVariant),
        quantity: Number(item?.quantity || 1),
      };
    });

    const payload = {
      product_bundle_id: bundleId,
      items,
    };

    console.log("Create Bundle Items Payload:", payload);

    const response = await fetch(`${BASE_URL}/bundle-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to save bundle items.");
    }

    return data;
  };

  // ─────────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("Bundle name is required.");
      return;
    }

    if (!offerPrice) {
      toast.error("Offer price is required.");
      return;
    }

    if (bundleProducts.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }

    for (const productId of bundleProducts) {
      if (!bundleVariants?.[productId]?.selectedVariant) {
        toast.error(
          `Please select a variant for ${
            bundleVariants?.[productId]?.product?.name || "selected product"
          }.`,
        );

        return;
      }
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // ─────────────────────────────────────────
      // Step 1: Update bundle
      // ─────────────────────────────────────────
      const bundleResponse = await fetch(`${BASE_URL}/bundles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,

          original_price: originalPrice || null,

          offer_price: offerPrice || 0,

          discount: discount || null,

          start_date: startDate ? startDate.format("YYYY-MM-DD") : null,

          end_date: endDate ? endDate.format("YYYY-MM-DD") : null,

          status: status === "true",
        }),
      });

      const bundleData = await bundleResponse.json();

      if (
        !bundleResponse.ok ||
        (!bundleData.success && !bundleData.data?.id && !bundleData.id)
      ) {
        throw new Error(bundleData.message || "Failed to update bundle.");
      }

      const bundleId = bundleData?.data?.id || bundleData?.id || id;

      // ─────────────────────────────────────────
      // Step 2: Check items
      // ─────────────────────────────────────────
      const itemsChanged = hasItemsChanged(
        bundleItems,
        bundleProducts,
        bundleVariants,
      );

      // No item changes
      if (!itemsChanged) {
        toast.success("Bundle updated successfully!");

        setTimeout(() => {
          navigate("/bundles");
        }, 1500);

        return;
      }

      // ─────────────────────────────────────────
      // Step 3: Delete old items
      // ─────────────────────────────────────────
      const existingIds = bundleItems.map((item) => item?.id).filter(Boolean);

      if (existingIds.length > 0) {
        await bulkDeleteItems(existingIds, token);
      }

      // ─────────────────────────────────────────
      // Step 4: Create new items
      // ─────────────────────────────────────────
      await createBundleItems(bundleId, bundleProducts, bundleVariants, token);

      toast.success("Bundle updated successfully!");

      setTimeout(() => {
        navigate("/bundles");
      }, 1500);
    } catch (error) {
      console.error("Update bundle error:", error);

      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Initial bundle loading screen
  //
  // Products are NOT required here.
  // Bundle data can render first.
  // ─────────────────────────────────────────────────────────────
  if (loadingBundle) {
    return (
      <div className="max-w-5xl mx-auto p-6 mt-6">
        <div className="border rounded-xl bg-white dark:bg-gray-900 p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />

            <p className="text-lg text-gray-500">Loading bundle details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto dark:bg-gray-900 shadow-md rounded-xl p-6 mt-6 dark:text-white border-2 border-gray-300 dark:border-gray-700">
      {/* ─────────────────────────────────────────── */}
      {/* Header */}
      {/* ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b-2 border-gray-300 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold dark:text-white text-textColor">
          Edit Bundle
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ───────────────────────────────────────── */}
        {/* Product Multi Select */}
        {!loadingProducts && (
          <>
            <div className="grid gap-6">
              <MultiSelect
                label="Bundle Products (Max 5)"
                placeholder="Search products..."
                options={products}
                value={bundleProducts}
                onChange={handleBundleProducts}
                max={5}
                disabled={false}
              />
            </div>

            {/* Selected Products / Variants */}
            {Object.keys(bundleVariants || {}).map((pid) => {
              const item = bundleVariants?.[pid];
              const product = item?.product;

              if (!product) {
                return null;
              }

              return (
                <div key={pid} className="border rounded-lg p-4 mt-4">
                  {/* Product Header */}
                  <div className="flex items-center gap-4 border-b pb-3 mb-4">
                    <img
                      src={product?.default_image}
                      alt={product?.name || "Product"}
                      className="w-20 h-20 rounded-lg border object-contain bg-white"
                    />

                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {product?.name}
                      </h4>

                      <div className="flex items-center gap-6 mt-2 text-sm">
                        <p>
                          <span className="font-medium">Price :</span> ₹
                          {product?.price || 0}
                        </p>

                        <p>
                          <span className="font-medium">Selling :</span> ₹
                          {product?.selling_price || 0}
                        </p>

                        <p>
                          <span className="font-medium">Quantity :</span>{" "}
                          {item?.quantity || 1}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Variants */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                    {(product?.variants || [])
                      .filter((variant) => Number(variant?.stock) > 0)
                      .map((variant) => {
                        const isSelected =
                          Number(item?.selectedVariant) === Number(variant?.id);

                        return (
                          <label
                            key={variant?.id}
                            className={`
                      flex items-center justify-between
                      p-2 rounded-md
                      border transition-all duration-200
                      cursor-pointer
                      ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
                      }
                    `}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="radio"
                                name={`variant-${pid}`}
                                checked={isSelected}
                                onChange={() => {
                                  setBundleVariants((previous) => ({
                                    ...previous,
                                    [pid]: {
                                      ...previous[pid],
                                      selectedVariant: variant?.id,
                                    },
                                  }));
                                }}
                                className="w-5 h-5 accent-indigo-600 shrink-0"
                              />

                              <div
                                className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm shrink-0"
                                style={{
                                  background: variant?.color?.code_2
                                    ? `linear-gradient(135deg, ${variant.color.code} 50%, ${variant.color.code_2} 50%)`
                                    : variant?.color?.code || "#ffffff",
                                }}
                              />

                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 mb-0 truncate">
                                  {variant?.color?.name}
                                </p>

                                <p className="text-sm text-gray-500 mb-0">
                                  Size : {variant?.size?.name}
                                </p>

                                <p className="text-sm font-medium text-green-600 mb-0">
                                  Stock : {variant?.stock}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 ml-2">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            )}
                          </label>
                        );
                      })}

                    {(product?.variants || []).filter(
                      (variant) => Number(variant?.stock) > 0,
                    ).length === 0 && (
                      <p className="text-red-500 text-sm col-span-full">
                        No variants available in stock.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {loadingProducts && (
          <div className="flex items-center gap-2 py-4 text-gray-500">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
            Loading products...
          </div>
        )}

        {/* ───────────────────────────────────────── */}
        {/* Bundle Name */}
        {/* ───────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Bundle Name <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter bundle name"
          />
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Description */}
        {/* ───────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter description"
          />
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Original Price */}
        {/* ───────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Original Price
          </label>

          <input
            type="number"
            step="0.01"
            value={originalPrice}
            readOnly
            className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
            placeholder="0.00"
          />
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Discount */}
        {/* ───────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium mb-1">Discount (%)</label>

          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={discount}
            onChange={handleDiscountChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Offer Price */}
        {/* ───────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium mb-1">Offer Price</label>

          <input
            type="number"
            step="0.01"
            value={offerPrice}
            onChange={handleOfferPriceChange}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="0.00"
          />
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Dates */}
        {/* ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>

            <CustomDatePicker
              name="start_date"
              label="Start Date"
              value={startDate}
              onChange={(value) => setStartDate(value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>

            <CustomDatePicker
              name="end_date"
              label="End Date"
              value={endDate}
              onChange={(value) => setEndDate(value)}
            />
          </div>
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Status */}
        {/* ───────────────────────────────────────── */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="true">Active</option>

            <option value="false">Inactive</option>
          </select>
        </div>

        {/* ───────────────────────────────────────── */}
        {/* Submit */}
        {/* ───────────────────────────────────────── */}
        <Button
          type="submit"
          disabled={loading || loadingProducts}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Updating..." : "Update Bundle"}
        </Button>
      </form>

      <ToastContainer />
    </div>
  );
}
