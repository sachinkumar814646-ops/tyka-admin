"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Package,
  ShoppingBag,
  Palette,
  Ruler,
  Hash,
  Percent,
  IndianRupee,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

const ShowBundle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const response = await axios.get(
          `https://tyka.premierhostings.com/beta/api/bundle-items/${id || 11}`,
        );

        if (response.data?.success) {
          setBundle(response.data.data);
        } else {
          setError("Bundle not found");
        }
      } catch (err) {
        console.error("Failed to fetch bundle:", err);

        setError(
          err.response?.data?.message || "Failed to load bundle details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBundle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading Bundle Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
          <p className="font-semibold text-red-600">
            {error || "Bundle not found"}
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const productBundle = bundle.product_bundle;
  const items = bundle.items || [];

  const originalPrice = Number(productBundle.original_price || 0);

  const offerPrice = Number(productBundle.offer_price || 0);

  const discount = Number(productBundle.discount || 0);

  const saving = originalPrice - offerPrice;

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      {/* =====================================================
          TOP BAR
      ===================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex w-fit items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Package size={18} />
          Bundle ID: #{bundle.id}
        </div>
      </div>

      {/* =====================================================
          BUNDLE DETAILS
      ===================================================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Bundle Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* =====================================================
          LEFT: BUNDLE INFORMATION
      ===================================================== */}
            <div className="lg:col-span-2">
              <div className="h-full rounded-xl border bg-gray-50 p-5 dark:bg-gray-800">
                <div className="flex h-full flex-col justify-center gap-5 sm:flex-row">
                  {/* Bundle Icon */}
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <ShoppingBag size={48} strokeWidth={1.5} />
                  </div>

                  {/* Bundle Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {productBundle.name}
                      </h2>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    </div>

                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      {productBundle.description || "No description available"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {/* Products */}
                      <span className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                        <ShoppingBag size={15} />
                        {items.length} Products
                      </span>

                      {/* Discount */}
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                        <Percent size={15} />
                        {discount}% OFF
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================
          RIGHT: PRICE SUMMARY
      ===================================================== */}
            <div>
              <div className="h-full rounded-xl border bg-gray-50 p-3 dark:bg-gray-800">
                <div className="mb-2 flex items-center gap-2">
                  <IndianRupee size={20} className="text-red-500" />

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Price Summary
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Original Price */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Original Price</span>

                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      ₹{originalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Discount</span>

                    <span className="font-medium text-red-500">
                      - {discount}%
                    </span>
                  </div>

                  {/* Discount Amount */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Discount Amount</span>

                    <span className="font-medium text-green-600">
                      - ₹{saving.toFixed(2)}
                    </span>
                  </div>

                  {/* Final Price */}
                  <div className="border-t pt-2">
                    <div className="flex items-end justify-between gap-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Bundle Offer Price
                      </span>

                      <span className="text-2xl font-bold text-black">
                        ₹{offerPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          BUNDLE PRODUCTS
      ===================================================== */}
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag size={20} />
            Bundle Products
          </CardTitle>

          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
            {items.length} Items
          </span>
        </CardHeader>

        <CardContent>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed py-10 text-center">
              <ShoppingBag size={40} className="mx-auto text-gray-300" />

              <p className="mt-3 text-gray-500">
                No products found in this bundle.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {items.map((item, index) => {
                const product = item.product || {};
                const variant = item.variant || {};

                return (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:border-red-200 hover:shadow-md dark:bg-gray-900"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* =================================================
                          PRODUCT IMAGE
                      ================================================= */}
                      <div className="relative flex h-64 w-full shrink-0 items-center justify-center overflow-hidden bg-gray-100 sm:h-auto sm:w-48 dark:bg-gray-800">
                        {/* Product Number */}
                        <div className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white shadow">
                          {index + 1}
                        </div>

                        {product.default_image ? (
                          <img
                            src={product.default_image}
                            alt={product.name || "Product"}
                            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}

                        {/* Image Fallback */}
                        <div
                          className={`${
                            product.default_image ? "hidden" : "flex"
                          } h-full w-full items-center justify-center`}
                        >
                          <ShoppingBag size={50} className="text-gray-300" />
                        </div>

                        {/* Quantity Badge */}
                        <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700 shadow">
                          Qty: {item.quantity || 0}
                        </span>
                      </div>

                      {/* =================================================
                          PRODUCT DETAILS
                      ================================================= */}
                      <div className="min-w-0 flex-1 px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-0">
                            {product.name || "Unnamed Product"}
                          </h3>

                          <p className="text-lg text-gray-400 mb-0">
                            {product.slug || "-"}
                          </p>
                        </div>

                        {/* Variant Details */}
                        <div className="mt-2 grid grid-cols-1 gap-3">
                          {/* Color */}
                          <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-2 py-1.5 dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <Palette size={17} className="text-gray-400" />

                              <span className="text-sm text-gray-500">
                                Color
                              </span>
                            </div>

                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {variant.color || "-"}
                            </span>
                          </div>

                          {/* Size */}
                          <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-2 py-1.5 dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <Ruler size={17} className="text-gray-400" />

                              <span className="text-sm text-gray-500">
                                Size
                              </span>
                            </div>

                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {variant.size || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          PRICE SUMMARY
      ===================================================== */}
    </div>
  );
};

export default ShowBundle;
