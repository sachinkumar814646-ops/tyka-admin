import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2"; // ✅ Added missing import
import RichTextEditor from "../../../components/common/RichTextEditor"; // adjust path
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { ToastContainer } from "react-toastify";

const API_BASE =
  "https://tyka.premierhostings.com/beta/api/product-categories";
const bannerTypes = [
  "main",
  "promotion",
  "offer",
  "collection",
];

export default function EditHeadCategoryPage() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loader state added
const [categoryFile, setCategoryFile] = useState(null);
const [categoryPreview, setCategoryPreview] = useState("");
const [categoryType, setCategoryType] = useState("");
const [categoryImagePreview, setCategoryImagePreview] = useState("");
const [videoPreview, setVideoPreview] = useState("");
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Load existing category data
  useEffect(() => {
    if (!id) return;

    axios
      .get(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.data;

        setName(data.name || "");
        setSlug(data.slug || "");
        setDescription(data.description || "");

        if (data.category_image) {
  setCategoryImagePreview(data.category_image);
  setCategoryType("image");
}

if (data.video) {
  setVideoPreview(data.video);
  setCategoryType("video");
}

        setBanners(
          (data.banners || []).map((banner) => ({
            id: banner.id,
            type: banner.banner_type,
            image: null,
            preview: banner.image,
          }))
        );
      })
      .catch((err) => {
        toast.error("Failed to load category");
        console.error(err.response?.data || err.message);
      });
  }, [id, token]);

  // Auto-generate slug from name, but allow manual edits as well
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
    return toast.error(
      "Category name can only contain letters, spaces, and hyphens."
    );
  }

  if (!name.trim()) {
    return toast.error("Please enter a category name");
  }

  if (!slug.trim()) {
    return toast.error("Slug cannot be empty.");
  }

  if (!token) {
    return toast.error("No token found. Please login again.");
  }

  try {
    setLoading(true);

    Swal.fire({
      title: "Updating Category...",
      text: "Please wait...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const formData = new FormData();

    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description || "");
    formData.append("category_id", "");

    // Image / Video
    if (categoryFile) {
      if (categoryType.startsWith("image/")) {
        formData.append("category_image", categoryFile);
      } else {
        formData.append("video", categoryFile);
      }
    }

    // Banners
    banners.forEach((banner, index) => {
      formData.append(`banners[${index}][id]`, banner.id || "");
      formData.append(`banners[${index}][type]`, banner.type);

      if (banner.image instanceof File) {
        formData.append(`banners[${index}][image]`, banner.image);
      }
    });

    // Laravel PUT with multipart/form-data
    formData.append("_method", "PUT");

    // Debug
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axios.post(
      `${API_BASE}/${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Swal.close();

    toast.success(response.data.message || "Category updated successfully!");

    setTimeout(() => {
      navigate("/headcategory");
    }, 800);
  } catch (error) {
    Swal.close();

    console.error(error.response?.data);

    if (error.response?.status === 422) {
      const errors = error.response.data.errors;

      if (errors) {
        Object.values(errors).forEach((messages) => {
          messages.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error(error.response.data.message);
      }
    } else {
      toast.error(
        error.response?.data?.message || "Something went wrong."
      );
    }
  } finally {
    setLoading(false);
  }
};
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

const handleCategoryImage = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setCategoryFile(file);
  setCategoryPreview(URL.createObjectURL(file));
  setCategoryType(file.type);
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
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-5 dark:text-white">
          Edit Main Category
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
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block mb-1 font-medium dark:text-gray-300"
            >
              Slug
            </label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Auto-generated slug"
              readOnly
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
              value={description}
              initialContent={description}
              onChange={setDescription}
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Category Image
            </label>

<input
  type="file"
  accept="image/*,.mp4,.mov,.avi,.mkv,.webm"
  onChange={handleCategoryImage}
/>

{categoryType === "image" && categoryImagePreview && (
  <img
    src={categoryImagePreview}
    className="h-40 rounded"
    alt=""
  />
)}

{categoryType === "video" && videoPreview && (
  <video
    src={videoPreview}
    controls
    className="h-60 w-full rounded"
  />
)}
          </div>
          <div className="space-y-5">

            <div className="flex justify-between">
              <h3 className="font-semibold text-lg">
                Banners
              </h3>

              <Button
                type="button"
                onClick={addBanner}
              >
                + Add Banner
              </Button>
            </div>

            {banners.map((banner, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-4"
              >
                <h4 className="text-lg font-semibold text-gray-700 dark:text-white">
                  Banner {index + 1}
                </h4>

                {/* Banner Type */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Banner Type
                  </label>

                  <select
                    value={banner.type}
                    onChange={(e) => handleBannerTypeChange(index, e.target.value)}
                    className="w-full border rounded-lg p-2"
                  >
                    {bannerTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Banner Image */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
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
                      alt={`Banner ${index + 1}`}
                      className="mt-3 h-full w-full rounded border object-contain"
                    />
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => removeBanner(index)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/headcategory")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}
