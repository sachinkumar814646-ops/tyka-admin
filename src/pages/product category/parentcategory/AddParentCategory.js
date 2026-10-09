import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2"; // ✅ Added SweetAlert2
import "react-toastify/dist/ReactToastify.css";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });
};

const bannerTypes = [
  "main",
  "promotion",
  "offer",
  "collection",
];

const AddParentCategory = () => {
  const navigate = useNavigate();
  const [headCategories, setHeadCategories] = useState([]);
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [banners, setBanners] = useState([
    {
      type: "main",
      image: null,
      preview: "",
    },
  ]);

  // ✅ Fetch head categories from API on mount
  useEffect(() => {
    fetch("https://tyka.premierhostings.com/beta/api/product-categories")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch head categories");
        }
        return res.json();
      })
      .then((data) => {
        setHeadCategories(data.data);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Failed to load head categories");
      });
  }, []);

  // ✅ Generate slug from name input
  useEffect(() => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
  }, [name]);

  // ✅ Handle form submit with API call
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Get token from localStorage
    const token = localStorage.getItem("token");

    // ✅ Validate name
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) {
      toast.error("Name should only contain letters and spaces!");
      return;
    }
    const bannerPayload = [];

    for (const banner of banners) {
      if (banner.image) {
        bannerPayload.push({
          type: banner.type,
          image: await fileToBase64(banner.image),
        });
      }
    }
    const form = e.target;
    const payload = {
      product_category_id: form.headCategory.value,
      name,
      slug,
      description,
      category_id: form.headCategory.value,
      category_image: categoryImage
        ? await fileToBase64(categoryImage)
        : null,
      banners: bannerPayload,
    };


    // ✅ Show SweetAlert loader
    Swal.fire({
      title: "Saving Category...",
      text: "Please wait while we save your category.",
      allowOutsideClick: false,
      background: "#ffff",
      color: "#dc2626",
      didOpen: () => {
        Swal.showLoading();
      },
    });

    fetch(
      "https://tyka.premierhostings.com/beta/api/product-sub-categories",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // ✅ Add token if available
        },
        body: JSON.stringify(payload),
      }
    )
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            const message =
              data?.message?.split(".")[0] || "Failed to add parent category";
            throw new Error(message);
          });
        }
        return res.json();
      })
      .then((data) => {
        Swal.close(); // ✅ Close loader

        toast.success("Parent category added successfully!");
        setTimeout(() => {
          navigate("/parentcategory");
        }, 1500);
      })
      .catch((error) => {
        Swal.close(); // ✅ Close loader on error
        console.error("Error:", error);
        toast.error(
          error.message || "An error occurred while adding the parent category."
        );
      });
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
    <div className="max-w-3xl mx-auto p-6 dark:text-white">
      {/* Heading */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add Parent Category</h1>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 dark:bg-gray-800 rounded-lg p-6"
      >
        {/* Head Category */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label
            htmlFor="headCategory"
            className="sm:w-40 font-medium text-gray-700 dark:text-gray-300"
          >
            Head Category
          </label>
          <select
            id="headCategory"
            name="headCategory"
            className="flex-1 border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">Select a Head Category</option>
            {headCategories.map((head) => (
              <option key={head.id} value={head.id}>
                {head.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label
            htmlFor="parentCategoryName"
            className="sm:w-40 font-medium text-gray-700 dark:text-gray-300"
          >
            Name
          </label>
          <Input
            id="parentCategoryName"
            name="parentCategoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label
            htmlFor="slug"
            className="sm:w-40 font-medium text-gray-700 dark:text-gray-300"
          >
            Slug
          </label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            readOnly
            className="flex-1 bg-gray-100 dark:bg-gray-700"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label
            htmlFor="description"
            className="sm:w-40 font-medium text-gray-700 dark:text-gray-300 pt-2"
          >
            Description
          </label>
          <div className="flex-1">
            <RichTextEditor value={description} onChange={setDescription} />
          </div>
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
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/parentcategory")}
          >
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddParentCategory;
