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

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [offerPrice, setOfferPrice] = useState("");
    const [discount, setDiscount] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [status, setStatus] = useState("true");
    const [loading, setLoading] = useState(false);
    const [bundleItem, setBundleItem] = useState([]);

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingBundle, setLoadingBundle] = useState(true);

    const [bundleProducts, setBundleProducts] = useState([]);
    const [bundleVariants, setBundleVariants] = useState({});

    // Keep track of original bundle items so we can delete them on save
    const [originalItemIds, setOriginalItemIds] = useState([]);

    // ─── Fetch all products (paginated) ──────────────────────────────────────
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
                }
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
                        }
                    ).then((res) => res.json())
                );
            }

            const responses = await Promise.all(requests);

            const allProducts = [
                ...firstData.data,
                ...responses.flatMap((item) => item.data || []),
            ];

            setProducts(allProducts);
            return allProducts;
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingProducts(false);
        }
    };

    // ─── Fetch existing bundle and pre-populate fields ────────────────────────
    const fetchBundle = async (allProducts) => {
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

            const bundleData = await bundleRes.json();
            const itemsData = await itemsRes.json();

            console.log("Bundle:", bundleData);
            console.log("Bundle Items:", itemsData.data.items);
            console.log("products", allProducts);

            const bundle = bundleData.data || bundleData;
            const items = itemsData.data.items || [];

            // Bundle Details
            setName(bundle.name || "");
            setDescription(bundle.description || "");
            setOriginalPrice(bundle.original_price || "");
            setOfferPrice(bundle.offer_price || "");
            setDiscount(bundle.discount || "");
            setStatus(
                bundle.status === true || bundle.status === 1 ? "true" : "false"
            );
            setBundleItem(itemsData);
            if (bundle.start_date) {
                setStartDate(dayjs(bundle.start_date));
            }

            if (bundle.end_date) {
                setEndDate(dayjs(bundle.end_date));
            }

            // Store original bundle item ids
            setOriginalItemIds(items.map((item) => item.id));

            // Selected Product IDs
            const selectedProductIds = items.map((item) => Number(item.product?.id));
            setBundleProducts(selectedProductIds);

            // Restore selected variants
            const variants = {};

            items.forEach((item) => {
                const productId = Number(item.product?.id);
                const variantId = Number(item.variant?.id);

                const product = allProducts.find((p) => p.id === productId);

                if (product) {
                    variants[productId] = {
                        product,
                        selectedVariant: variantId,
                        quantity: item.quantity || 1,
                    };
                }
            });

            setBundleVariants(variants);
        } catch (err) {
            console.error("fetchBundle error:", err);
            toast.error("Failed to load bundle data.");
        } finally {
            setLoadingBundle(false);
        }
    };

    // ─── Bootstrap: load products first, then bundle ─────────────────────────
    useEffect(() => {
        (async () => {
            const allProducts = await fetchProducts();
            console.log("allproducts", allProducts);
            debugger
            await fetchBundle(allProducts);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // ─── Auto-calculate original price when selections change ─────────────────
    useEffect(() => {
        if (loadingProducts || loadingBundle) return; // don't recalculate while loading

        let total = 0;
        bundleProducts.forEach((pid) => {
            const product = products.find((p) => p.id === Number(pid));
            if (product) {
                total += Number(product.selling_price || product.price || 0);
            }
        });
        setOriginalPrice(total.toFixed(2));
    }, [bundleProducts, products, loadingProducts, loadingBundle]);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleOfferPriceChange = (e) => {
        const offer = Number(e.target.value || 0);
        const original = Number(originalPrice || 0);
        setOfferPrice(e.target.value);
        if (original > 0) {
            setDiscount((((original - offer) / original) * 100).toFixed(2));
        } else {
            setDiscount("0");
        }
    };

    const handleDiscountChange = (e) => {
        const percentage = Number(e.target.value || 0);
        const original = Number(originalPrice || 0);
        setDiscount(e.target.value);
        setOfferPrice((original - (original * percentage) / 100).toFixed(2));
    };

    const handleBundleProducts = (selected) => {
        if (selected.length > 5) {
            toast.error("Maximum 5 products allowed.");
            return;
        }
        setBundleProducts(selected);

        const variants = {};
        selected.forEach((pid) => {
            const product = products.find((p) => p.id === pid);
            if (product) {
                // Preserve previously selected variant if product was already in bundle
                variants[pid] = {
                    product,
                    selectedVariant: bundleVariants[pid]?.selectedVariant || "",
                };
            }
        });
        setBundleVariants(variants);
    };

    // ─── Submit (PUT bundle + delete old items + POST new items) ─────────────
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
            if (!bundleVariants[productId]?.selectedVariant) {
                toast.error(
                    `Please select a variant for ${bundleVariants[productId]?.product?.name}.`
                );
                return;
            }
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            // 1️⃣ Update the bundle
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
                    offer_price: offerPrice,
                    discount: discount || null,
                    start_date: startDate ? startDate.format("YYYY-MM-DD") : null,
                    end_date: endDate ? endDate.format("YYYY-MM-DD") : null,
                    status: status === "true",
                }),
            });

            const bundleData = await bundleResponse.json();

            if (
                !bundleResponse.ok ||
                (!bundleData.success &&
                    !bundleData.data?.id &&
                    !bundleData.id)
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
                    product_variant_id:
                        bundleVariants[productId].selectedVariant,
                    quantity: 1,
                })),
            };

            console.log(payload);
            const id = bundleItem.data.id;

            const itemResponse = await fetch(
                `https://tyka.premierhostings.com/beta/api/bundle-items/${id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const itemData = await itemResponse.json();

            if (!itemResponse.ok || !itemData.success) {
                throw new Error(itemData.message || "Failed to save bundle items.");
            }

            toast.success("Bundle updated successfully!");
            setTimeout(() => navigate("/bundles"), 1500);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    if (loadingBundle || loadingProducts) {
        return (
            <div className="max-w-5xl mx-auto p-6 mt-6">
                <p className="text-lg text-gray-500">Loading bundle...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto dark:bg-gray-900 shadow-md rounded-xl p-6 mt-6 dark:text-white border-2 border-gray-300 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 dark:text-white text-textColor border-b-2 border-gray-300 dark:border-gray-700">
                Edit Bundle
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* ── Product Multi-Select ── */}
                <div className="grid gap-6">
                    <MultiSelect
                        label="Bundle Products (Max 5)"
                        placeholder="Search products..."
                        options={products}
                        value={bundleProducts}
                        onChange={handleBundleProducts}
                        max={5}
                    />
                </div>

                {/* ── Variant Selector Cards ── */}
                {Object.keys(bundleVariants || {}).map((pid) => (
                    <div key={pid} className="border rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-4 border-b pb-3 mb-4 border-2">
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
                                        <span className="font-medium">Price :</span>{" "}
                                        ₹{bundleVariants[pid]?.product?.price}
                                    </p>
                                    <p>
                                        <span className="font-medium">Selling :</span>{" "}
                                        ₹{bundleVariants[pid]?.product?.selling_price}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {(bundleVariants[pid]?.product?.variants || []).map((variant) => {
                            const isSelected =
                                bundleVariants[pid].selectedVariant == variant.id;

                            return (
                                <label
                                    key={variant.id}
                                    className={`
                    flex items-center justify-between
                    p-4 mb-3 rounded-xl
                    border transition-all duration-200
                    cursor-pointer
                    ${isSelected
                                            ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200"
                                            : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-4">
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
                                            className="w-5 h-5 accent-indigo-600"
                                        />

                                        <div
                                            className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-sm"
                                            style={{
                                                background: variant.color?.code_2
                                                    ? `linear-gradient(135deg, ${variant.color.code} 50%, ${variant.color.code_2} 50%)`
                                                    : variant.color?.code || "#ffffff",
                                            }}
                                        />

                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {variant.color?.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Size : {variant.size?.name}
                                            </p>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
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
                ))}

                {/* ── Bundle Name ── */}
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

                {/* ── Description ── */}
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

                {/* ── Original Price ── */}
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

                {/* ── Offer Price ── */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Offer Price <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={offerPrice}
                        onChange={handleOfferPriceChange}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="0.00"
                    />
                </div>

                {/* ── Discount ── */}
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

                {/* ── Dates ── */}
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

                {/* ── Status ── */}
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
                    {loading ? "Updating..." : "Update Bundle"}
                </Button>
            </form>

            <ToastContainer />
        </div>
    );
}
