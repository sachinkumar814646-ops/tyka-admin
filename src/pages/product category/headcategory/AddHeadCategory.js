import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2"; // ✅ SweetAlert2 import
import RichTextEditor from "../../../components/common/RichTextEditor"; // adjust path
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import "react-toastify/dist/ReactToastify.css";

const API_BASE =
  "https://tyka.premierhostings.com/beta/api/product-categories";

const bannerTypes = [
  "main",
  "promotion",
  "offer",
  "collection",
];

export default function AddHeadCategoryPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loader state added
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [selectedBannerType, setSelectedBannerType] = useState("main");
  const [categoryImage, setCategoryImage] = useState(null);
  const [banners, setBanners] = useState([
    {
      type: "main",
      image: null,
      preview: "",
    },
  ]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);

      reader.onerror = (error) => reject(error);
    });
  };
  // const handleBannerChange = (e) => {
  //   const file = e.target.files[0];

  //   if (!file) return;

  //   setBannerImages((prev) => ({
  //     ...prev,
  //     [selectedBannerType]: file,
  //   }));

  //   setBannerPreview(URL.createObjectURL(file));
  // };

  // Auto-generate slug from name
  useEffect(() => {
    if (name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    } else {
      setSlug("");
    }
  }, [name]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const namePattern = /^[A-Za-z\s-]+$/;
    if (!namePattern.test(name.trim())) {
      toast.error(
        "Category name can only contain letters, spaces, and hyphens."
      );
      return;
    }
    try {
      setLoading(true); // ✅ Fix: Loader state use
      Swal.fire({
        title: "Saving Product...",
        text: "Please wait while we save your product.",
        allowOutsideClick: false,
        background: "#ffff", // 🖤 Black background
        color: "#dc2626", // ❤️ Red text
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const bannerPayload = [];

      for (const banner of banners) {
        if (banner.image) {
          bannerPayload.push({
            type: banner.type,
            image: await fileToBase64(banner.image),
          });
        }
      }

      const payload = {
        name,
        slug,
        description,
        category_id: null,
        category_image: categoryImage
          ? await fileToBase64(categoryImage)
          : null,
        banners: bannerPayload,
      };

      const response = await axios.post(
        API_BASE,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.close(); // ✅ Loader Close
      setLoading(false); // ✅ Stop loader
      console.log("API Response:", response.data);

      toast.success("Category added successfully!");
      setTimeout(() => navigate("/headcategory"), 800);
    } catch (error) {
      Swal.close(); // ✅ Close Loader on Error
      setLoading(false); // ✅ Stop loader
      toast.error("Failed to add category");
      console.error("Error Response:", error.response?.data || error.message);
    }
  };

  const handleBannerTypeChange = (index, value) => {
    const updated = [...banners];
    updated[index].type = value;
    setBanners(updated);
  };

  const handleBannerImageChange = (index, file) => {
    if (!file) return;

    const updated = [...banners];
    updated[index].image = file;
    updated[index].preview = URL.createObjectURL(file);

    setBanners(updated);
  };

  const addBanner = () => {
    setBanners([
      ...banners,
      {
        type: "main",
        image: null,
        preview: "",
      },
    ]);
  };

  const removeBanner = (index) => {
    setBanners(banners.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen p-6 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto  dark:bg-gray-800 p-6 rounded-lg border-2">
        <h1 className="text-2xl font-bold mb-5 dark:text-white border-b-2">
          Main Head Category
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block mb-1 font-medium dark:text-gray-300"
            >
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
              className="dark:text-white"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block mb-1 font-medium dark:text-white"
            >
              Slug
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto-generated slug"
              required
              className="dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block mb-1 font-medium dark:text-gray-300"
            >
              Description
            </label>
            <RichTextEditor
              initialContent={description}
              onChange={setDescription}
            />
          </div>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Banners</h3>

              <Button
                type="button"
                onClick={addBanner}
                className="bg-green-600 hover:bg-green-700"
              >
                + Add More Banner
              </Button>
            </div>

            {banners.map((banner, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-4"
              >
                <div>
                  <label className="block mb-2 font-medium">
                    Banner Type
                  </label>

                  <select
                    value={banner.type}
                    onChange={(e) =>
                      handleBannerTypeChange(index, e.target.value)
                    }
                    className="w-full border rounded-lg p-2"
                  >
                    {bannerTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium">
                    Banner Image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleBannerImageChange(index, e.target.files[0])
                    }
                    className="block w-full border rounded-lg p-2"
                  />

                  {banner.preview && (
                    <img
                      src={banner.preview}
                      alt=""
                      className="mt-3 h-40 rounded border object-cover"
                    />
                  )}
                </div>

                {banners.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeBanner(index)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t-2 pt-2">
            <Button
              className="dark:text-white"
              type="button"
              variant="outline"
              onClick={() => navigate("/headcategory")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={loading} // ✅ Disable when loading
            >
              {loading ? "Saving..." : "Add Category"}
            </Button>
          </div>
        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}
