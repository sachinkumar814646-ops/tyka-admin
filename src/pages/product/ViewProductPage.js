"use client";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle, Eye } from "lucide-react";
import ActivityLogModal from "../../components/common/ActivityLogModal";
import Badge from "../../components/ui/Badge";
import axios from "axios";

export default function ViewProductPage() {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(queryParams.get("page")) || 1;
  const perpageFromUrl = parseInt(queryParams.get("per_page")) || 1;

  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://tyka.premierhostings.com/beta/api/products/${id}`,
        );
        const productData = res.data.data;

        setProduct(productData);
      } catch (err) {
        setError("Error fetching product");
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const renderArray1 = (arr) => {
    if (!arr || arr.length === 0) return "null";
    return arr.map((item) => item.name || "null").join(", ");
  };

  const renderArray = (arr) =>
    Array.isArray(arr) && arr.length > 0
      ? arr.map((item) => item.name || "null").join(", ")
      : "null";

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-10 text-gray-400">No product found</div>
    );
  }

  return (
    <div className="p-4 sm:p-6 ">
      {/* Back Button */}
      <div className=" max-w-6xl mx-auto w-full flex items-center justify-between mb-6">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate(`/products?page=${pageFromUrl}&per_page=${perpageFromUrl}`)
          }
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* View Log Button */}
        <button
          onClick={() => setShowLogs(true)} // change route as needed
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          <Eye size={18} />
          View Log
        </button>
        <ActivityLogModal
          open={showLogs}
          onClose={() => setShowLogs(false)}
          endpoint={`products/${id}`}
        />
      </div>

      {/* Product Details */}
      <div className="max-w-6xl mx-auto w-full dark:bg-transparent shadow-lg p-4 sm:p-6 dark:text-white overflow-x-auto">
        <h1 className="text-3xl font-bold mb-4 break-words">
          {product.name || "null"}
        </h1>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Default Image */}
          <div className="lg:w-2/5 flex justify-start">
            {product.default_image ? (
              <img
                src={product.default_image}
                alt="Default"
                className="w-full h-96 h-full object-contain rounded-lg border shadow"
              />
            ) : (
              <div className="w-64 h-64 border rounded-lg flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="lg:w-3/5 overflow-x-auto">
            <table className="w-full border border-gray-200 dark:border-gray-700 table-auto">
              <tbody>
                {/* Normal Fields */}
                <tr>
                  <td className="border px-4 py-2 font-semibold w-1/4">Slug</td>
                  <td className="border px-4 py-2 break-words">
                    {product.slug || "null"}
                  </td>
                </tr>

                <tr>
                  <td className="border px-4 py-2 font-semibold">Status</td>
                  <td className="border px-4 py-2">
                    <Badge
                      color={product.status ? "success" : "danger"}
                      size="sm"
                    >
                      {product.status ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>

                {/* Boolean Fields */}
                <tr>
                  <td className="border px-4 py-2 font-semibold">New</td>
                  <td className="border px-4 py-2">
                    {product.new ? (
                      <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-red-600 font-medium">
                        <XCircle className="w-5 h-5" />
                        No
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold">Featured</td>
                  <td className="border px-4 py-2">
                    {product.featured ? (
                      <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-red-600 font-medium">
                        <XCircle className="w-5 h-5" />
                        No
                      </span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold">
                    Top Selling
                  </td>
                  <td className="border px-4 py-2">
                    {product.top_selling ? (
                      <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-red-600 font-medium">
                        <XCircle className="w-5 h-5" />
                        No
                      </span>
                    )}
                  </td>
                </tr>

                <tr>
                  <td className="border px-4 py-2 font-semibold">Sale</td>
                  <td className="border px-4 py-2">
                    {product.sale ? (
                      <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-red-600 font-medium">
                        <XCircle className="w-5 h-5" />
                        No
                      </span>
                    )}
                  </td>
                </tr>

                {/* ---- Pricing ---- */}
                <tr>
                  <td className="border px-4 py-2 font-semibold">SKU</td>
                  <td className="border px-4 py-2">{product.sku || "null"}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold">HSN</td>
                  <td className="border px-4 py-2">{product.hsn || "null"}</td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold">Pricing</td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Cost:
                        </span>{" "}
                        <span>{product.price ?? "null"}</span>
                      </div>

                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Selling:
                        </span>{" "}
                        <span>{product.selling_price ?? "null"}</span>
                      </div>

                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          Discount:
                        </span>{" "}
                        <span>
                          {product.discount?.name
                            ? `${parseInt(product.discount.name)}%`
                            : "null"}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold">GST</td>
                  <td className="border px-4 py-2">
                    {product.gst_inclusive
                      ? "Inclusive"
                      : product.gst_inclusive === false
                        ? "Exclusive"
                        : "null"}
                  </td>
                </tr>

                {/* ---- Relations ---- */}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 mt-6">
          <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Product Dimensions
          </h2>
        </div>
        <table className="w-full border border-gray-200 dark:border-gray-700">
          <tbody>
            <tr>
              <td className="border px-4 py-2 font-semibold">Weight</td>
              <td className="border px-4 py-2">
                {product.weight != null
                  ? Number(product.weight).toFixed(2)
                  : "null"}
              </td>
            </tr>

            <tr>
              <td className="border px-4 py-2 font-semibold">
                Length × Width × Height
              </td>
              <td className="border px-4 py-2">
                {product.length != null
                  ? Number(product.length).toFixed(2)
                  : "null"}{" "}
                ×{" "}
                {product.width != null
                  ? Number(product.width).toFixed(2)
                  : "null"}{" "}
                ×{" "}
                {product.height != null
                  ? Number(product.height).toFixed(2)
                  : "null"}
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <div className="flex items-center gap-3 mb-4 mt-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Product Information
            </h2>
          </div>

          <table className="w-full border border-gray-200 dark:border-gray-700">
            <tbody>
              <tr>
                <td className="border px-4 py-2 font-semibold">Season</td>
                <td className="border px-4 py-2">
                  {product.season?.name || "null"}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-2 font-semibold">Fabric</td>
                <td className="border px-4 py-2">
                  {product.fabric?.name || "null"}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-2 font-semibold">Brand</td>
                <td className="border px-4 py-2">
                  {product.brand?.name || "null"}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center gap-3 mb-4 mt-6">
            <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Categories & Tags
            </h2>
          </div>

          <table className="w-full border border-gray-200 dark:border-gray-700">
            <tbody>
              <tr>
                <td className="border px-4 py-2 font-semibold">Tags</td>
                <td className="border px-4 py-2">
                  {Array.isArray(product.tags) && product.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag.id} color="success">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">null</span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-2 font-semibold">
                  Head Categories
                </td>
                <td className="border px-4 py-2">
                  {Array.isArray(product.head_categories) &&
                  product.head_categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.head_categories.map((category) => (
                        <Badge key={category.id} color="primary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">null</span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-2 font-semibold">
                  Parent Categories
                </td>
                <td className="border px-4 py-2">
                  {Array.isArray(product.parent_categories) &&
                  product.parent_categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.parent_categories.map((category) => (
                        <Badge key={category.id} color="primary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">null</span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-2 font-semibold">
                  Child Categories
                </td>
                <td className="border px-4 py-2">
                  {Array.isArray(product.child_categories) &&
                  product.child_categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.child_categories.map((category) => (
                        <Badge key={category.id} color="primary">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">null</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center gap-3 mb-4 mt-6">
            <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Product Description
            </h2>
          </div>

          <table className="w-full border border-gray-200 dark:border-gray-700">
            <tbody>
              <tr>
                <td className="border px-4 py-2 font-semibold w-1/4">
                  Short Description
                </td>
                <td className="border px-4 py-2 break-words">
                  <div
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: product.short_description || "null",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td className="border px-4 py-2 font-semibold w-1/4">
                  Description
                </td>
                <td className="border px-4 py-2 break-words">
                  <div
                    className="prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{
                      __html: product.description || "null",
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          {/* More Fields */}
          <tr>
            <td className="border px-4 py-2 font-semibold">Video URL</td>
            <td className="border px-4 py-2 break-words">
              {product.video_url || "null"}
            </td>
          </tr>
        </div>

        <div className="mb-3 mt-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            SEO Information
          </h3>
          <p className="text-sm p-0 text-gray-500 dark:text-gray-400">
            Search Engine Optimization Details
          </p>
        </div>

        <table className="w-full border border-gray-200 dark:border-gray-700">
          <tbody>
            <tr>
              <td className="border px-4 py-2 font-semibold">Meta Title</td>
              <td className="border px-4 py-2">
                {product.meta_title || "null"}
              </td>
            </tr>

            <tr>
              <td className="border px-4 py-2 font-semibold">
                Meta Description
              </td>
              <td className="border px-4 py-2">
                {product.meta_description || "null"}
              </td>
            </tr>

            <tr>
              <td className="border px-4 py-2 font-semibold">Meta Keywords</td>
              <td className="border px-4 py-2">
                {product.meta_keywords || "null"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Second Table (Variants) */}
        {Array.isArray(product.variants) && product.variants.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <h2 className="text-3xl font-semibold mb-4">Variants</h2>
            <table className="w-full border border-gray-200 dark:border-gray-700 table-auto rounded-xl">
              <thead>
                <tr>
                  <th className="border px-2 py-1 bg-black text-white">Size</th>
                  <th className="border px-2 py-1 bg-black text-white">
                    Color
                  </th>
                  <th className="border px-2 py-1 bg-black text-white">
                    Stock
                  </th>
                  <th className="border px-2 py-1 bg-black text-white">
                    Status
                  </th>
                  <th className="border px-2 py-1 bg-black text-white">
                    Images
                  </th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map((v) => (
                  <tr key={v.id}>
                    <td className="border px-2 py-1">
                      {v.size?.name || v.size_name || v.size_id || "null"}
                    </td>
                    <td className="border px-2 py-1">
                      <div className="flex items-center gap-2">
                        {(v.color_code || v.color_code_2) && (
                          <span
                            className="inline-block w-6 h-6 rounded-full border"
                            style={{
                              background: v.color_code_2
                                ? `linear-gradient(135deg, ${v.color_code} 50%, ${v.color_code_2} 50%)`
                                : v.color_code,
                            }}
                          />
                        )}
                        {v.color_name || v.color?.name || "null"}
                      </div>
                    </td>
                    <td className="border px-2 py-1">{v.stock || "null"}</td>
                    <td className="border py-1 px-2">
                      {v.status === 1 ? (
                        <Badge
                          color="success"
                          className="px-4 py-2 text-xl font-semibold rounded-lg"
                        >
                          Active (Default)
                        </Badge>
                      ) : (
                        <Badge
                          color="danger"
                          className="px-4 py-2 text-sm font-semibold rounded-lg"
                        >
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="px-2 py-1 flex flex-wrap gap-2">
                      {v.variant_images && v.variant_images.length > 0
                        ? v.variant_images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.path}
                              alt={`Image ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded border"
                            />
                          ))
                        : "null"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {product.related_products > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-cyan-600 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Related Products
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {product.related_products.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all p-2"
                >
                  <img
                    src={item.default_image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg border object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>

                    <p className="text-sm text-gray-500 p-0 m-0">{item.slug}</p>

                    <p className="text-red-600 font-semibold">
                      ₹ {item.price ?? "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {product.Review?.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-cyan-600 rounded-full"></div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reviews
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.Review.map((review) => (
                <div
                  key={review.id}
                  className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all p-3"
                >
                  {/* Rating */}
                  <div className="flex items-center mb-1 gap-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      ({review.rating_value}/5)
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span
                          key={index}
                          className={
                            index < Number(review.rating_value)
                              ? "text-yellow-400 text-xl"
                              : "text-gray-300 text-xl"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    {review.rating_title || "Review"}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-6">
                    {review.rating_desc || "No review description"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
