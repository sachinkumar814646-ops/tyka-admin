import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Button from "../../components/ui/Button";
import MultiSelect from "../../components/common/MultiSelect.jsx";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";
export default function AddBundle() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState("true");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const today = dayjs().startOf("day");
  const [mainProduct, setMainProduct] = useState("");

  const [bundleProducts, setBundleProducts] = useState([]);

  const [selectedMainVariant, setSelectedMainVariant] = useState("");

  const [bundleVariants, setBundleVariants] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);
  useEffect(() => {
    let total = 0;

    // Main Product
    if (mainProduct) {
      const product = products.find((p) => p.id === Number(mainProduct));

      if (product) {
        total += Number(product.selling_price || product.price || 0);
      }
    }

    // Bundle Products
    bundleProducts.forEach((id) => {
      const product = products.find((p) => p.id === Number(id));

      if (product) {
        total += Number(product.selling_price || product.price || 0);
      }
    });

    setOriginalPrice(total.toFixed(2));
  }, [mainProduct, bundleProducts, products]);
  const handleOfferPriceChange = (e) => {
    const offer = Number(e.target.value || 0);
    const original = Number(originalPrice || 0);

    setOfferPrice(e.target.value);

    if (original > 0) {
      const discountPercentage = ((original - offer) / original) * 100;

      setDiscount(discountPercentage.toFixed(2));
    } else {
      setDiscount("0");
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem("token");

      const firstResponse = await fetch(
        `https://tyka.premierhostings.com/beta/api/products?perPage=100&page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const firstData = await firstResponse.json();

      const lastPage = firstData.meta.last_page;

      const requests = [];

      for (let page = 2; page <= lastPage; page++) {
        requests.push(
          fetch(
            `https://tyka.premierhostings.com/beta/api/products?perPage=100&page=${page}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ).then((res) => res.json()),
        );
      }

      const responses = await Promise.all(requests);

      const allProducts = [
        ...firstData.data,
        ...responses.flatMap((item) => item.data || []),
      ];

      setProducts(allProducts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // -----------------------
      // Create Bundle
      // -----------------------
      const bundleResponse = await fetch(
        "https://tyka.premierhostings.com/beta/api/bundles",
        {
          method: "POST",
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
        },
      );

      const bundleData = await bundleResponse.json();

      if (
        !bundleResponse.ok ||
        (!bundleData.success && !bundleData.data?.id && !bundleData.id)
      ) {
        toast.error(bundleData.message || "Failed to create bundle.");
        return;
      }

      const bundleId = bundleData.data?.id || bundleData.id;

      // -----------------------
      // Save Bundle Items (Single API)
      // -----------------------

      const payload = {
        product_bundle_id: bundleId,
        items: bundleProducts.map((productId) => ({
          product_id: productId,
          product_variant_id: bundleVariants[productId].selectedVariant,
          quantity: 1,
        })),
      };

      console.log(payload);

      const itemResponse = await fetch(
        "https://tyka.premierhostings.com/beta/api/bundle-items",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const itemData = await itemResponse.json();

      if (!itemResponse.ok || !itemData.success) {
        throw new Error(itemData.message || "Failed to save bundle items.");
      }

      toast.success("Bundle created successfully!");

      setTimeout(() => {
        navigate("/bundles");
      }, 1500);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  const handleBundleProducts = (selected) => {
    if (selected.length > 5) {
      toast.error("Maximum 5 products allowed.");
      return;
    }

    setBundleProducts(selected);

    const variants = {};

    selected.forEach((id) => {
      const product = products.find((p) => p.id === id);

      if (product) {
        variants[id] = {
          product,
          selectedVariant: "",
        };
      }
    });

    setBundleVariants(variants);
  };
  const handleDiscountChange = (e) => {
    const percentage = Number(e.target.value || 0);
    const original = Number(originalPrice || 0);

    setDiscount(e.target.value);

    const offer = original - (original * percentage) / 100;

    setOfferPrice(offer.toFixed(2));
  };

  return (
    <div className="max-w-5xl mx-auto dark:bg-gray-900 shadow-md rounded-xl p-6 mt-6 dark:text-white border-2 border-gray-300 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 dark:text-white text-textColor border-b-2 border-gray-300 dark:border-gray-700">
        Add Bundles
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-6">
          {loadingProducts ? (
            <p className="text-lg text-gray-500">Loading products...</p>
          ) : (
            <MultiSelect
              label="Bundle Products (Max 5)"
              placeholder="Search products..."
              options={products.filter((p) => p.id !== Number(mainProduct))}
              value={bundleProducts}
              onChange={handleBundleProducts}
              max={5}
            />
          )}
        </div>

        {/* ── Variant Selector Cards ── */}
        {Object.keys(bundleVariants || {}).map((pid) => (
          <div key={pid} className="border rounded-lg p-4 mt-4">
            {/* Product Header */}
            <div className="flex items-center gap-4 border-b pb-3 mb-4">
              <img
                src={bundleVariants[pid]?.product?.default_image}
                alt={bundleVariants[pid]?.product?.name}
                className="w-20 h-20 rounded-lg border object-contain"
              />

              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {bundleVariants[pid]?.product?.name}
                </h4>

                <div className="flex items-center gap-6 mt-2 text-sm">
                  <p>
                    <span className="font-medium">Price :</span> ₹
                    {bundleVariants[pid]?.product?.price}
                  </p>

                  <p>
                    <span className="font-medium">Selling :</span> ₹
                    {bundleVariants[pid]?.product?.selling_price}
                  </p>
                </div>
              </div>
            </div>

            {/* Variants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              {(bundleVariants[pid]?.product?.variants || [])
                .filter((variant) => Number(variant.stock) > 0)
                .map((variant) => {
                  const isSelected =
                    bundleVariants[pid].selectedVariant == variant.id;

                  return (
                    <label
                      key={variant.id}
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
                            setBundleVariants((prev) => ({
                              ...prev,
                              [pid]: {
                                ...prev[pid],
                                selectedVariant: variant.id,
                              },
                            }));
                          }}
                          className="w-5 h-5 accent-indigo-600 shrink-0"
                        />

                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm shrink-0"
                          style={{
                            background: variant.color?.code_2
                              ? `linear-gradient(135deg, ${variant.color.code} 50%, ${variant.color.code_2} 50%)`
                              : variant.color?.code || "#ffffff",
                          }}
                        />

                        <div className="min-w-0 mb-0">
                          <p className="font-semibold text-gray-800 mb-0 truncate">
                            {variant.color?.name}
                          </p>

                          <p className="text-sm text-gray-500 mb-0">
                            Size : {variant.size?.name}
                          </p>
                          <p
                            className={`text-sm font-medium mb-0 ${
                              variant.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            Stock : {variant.stock}
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
            </div>
          </div>
        ))}

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

        <div>
          <label className="block text-sm font-medium mb-1">
            Original Price
          </label>

          <input
            type="number"
            step="0.01"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="0.00"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Discount</label>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>

            <CustomDatePicker
              name="start_date"
              label="Start Date"
              value={startDate}
              onChange={(value) => setStartDate(value)}
              minDate={today}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>

            <CustomDatePicker
              name="end_date"
              label="End Date"
              value={endDate}
              onChange={(value) => setEndDate(value)}
              minDate={today}
            />
          </div>
        </div>
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

        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Save Bundle"}
        </Button>
      </form>

      <ToastContainer />
    </div>
  );
}
