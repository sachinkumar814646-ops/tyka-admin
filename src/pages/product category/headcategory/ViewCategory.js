import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

const API_BASE =
  "https://tyka.premierhostings.com/beta/api/product-categories";

export default function ViewHeadCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id) return;

    axios
      .get(`${API_BASE}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCategory(res.data.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load category.");
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg font-semibold text-red-600">
          Category not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
                {/* Buttons */}
        <div className="flex justify-start pl-8">
          <button
            onClick={() => navigate("/headcategory")}
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Back
          </button>
        </div>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-2">

        <h1 className="text-3xl font-bold mb-8 text-center">
          View Main Category
        </h1>

        {/* Name */}
        <div className="mb-6">
          <label className="font-semibold text-gray-700">
            Category Name
          </label>

          <div className="mt-2 border rounded-lg p-3 bg-gray-50">
            {category.name}
          </div>
        </div>

        {/* Slug */}
        <div className="mb-6">
          <label className="font-semibold text-gray-700">
            Slug
          </label>

          <div className="mt-2 border rounded-lg p-3 bg-gray-50">
            {category.slug}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="font-semibold text-gray-700">
            Description
          </label>

          <div
            className="mt-2 border rounded-lg p-4 bg-gray-50 prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: category.description || "No Description",
            }}
          />
        </div>

        {/* Category Image */}
        {category.category_image && (
          <div className="mb-8">
            <label className="font-semibold text-gray-700 block mb-3">
              Category Image
            </label>

            <img
              src={category.category_image}
              alt="Category"
              className="w-full max-h-96 object-contain rounded-lg border"
            />
          </div>
        )}

        {/* Video */}
        {category.video && (
          <div className="mb-8">
            <label className="font-semibold text-gray-700 block mb-3">
              Category Video
            </label>

            <video
              src={category.video}
              controls
              className="w-full rounded-lg border"
            />
          </div>
        )}

        {/* Banners */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-5">
            Category Banners
          </h2>

          {category.banners && category.banners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.banners.map((banner) => (
                <div
                  key={banner.id}
                  className="border rounded-lg p-4 shadow-sm"
                >
                  <p className="font-semibold mb-3">
                    Banner Type :
                    <span className="text-red-600 ml-2 capitalize">
                      {banner.banner_type}
                    </span>
                  </p>

                  <img
                    src={banner.image}
                    alt="Banner"
                    className="w-full h-56 object-contain rounded-lg border"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No banners available.
            </p>
          )}
        </div>

        {/* Sub Categories */}
<div className="mb-8">
  <h2 className="text-xl font-bold mb-4">
    Sub Categories
  </h2>

  {category.parent_category && category.parent_category.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Slug</th>
          </tr>
        </thead>

        <tbody>
          {category.parent_category.map((item, index) => (
            <tr key={item.id}>

              <td className="border px-4 py-2">
                {item.name}
              </td>

              <td className="border px-4 py-2">
                {item.slug}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p>No Sub Categories Found.</p>
  )}
</div>

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            onClick={() => navigate("/headcategory")}
            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Back
          </button>
        </div>

      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}