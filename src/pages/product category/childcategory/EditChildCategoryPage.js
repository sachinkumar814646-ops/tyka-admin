import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2

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

const EditChildCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  const per_page = searchParams.get("per_page") || 10;

  const [headCategories, setHeadCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [filteredParentCategories, setFilteredParentCategories] = useState([]);
  const [categoryImage, setCategoryImage] = useState(null);

  const [selectedHeadId, setSelectedHeadId] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [banners, setBanners] = useState([
    {
      type: "main",
      image: null,
      preview: "",
    },
  ]);

  // Helper to fetch all paginated data
  const fetchAllPages = async (url) => {
    let allData = [];
    let page = 1;
    let lastPage = 1;

    try {
      do {
        const res = await axios.get(`${url}?page=${page}`);
        allData = [...allData, ...(res.data.data || [])];
        lastPage = res.data.meta.last_page;
        page++;
      } while (page <= lastPage);
    } catch (err) {
      console.error("Error fetching all pages:", err);
    }

    return allData;
  };

  // Fetch head categories, all parent categories, and child data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headsRes = await axios.get(
          "https://tyka.premierhostings.com/beta/api/product-categories"
        );
        const heads = headsRes.data?.data || [];

        // Fetch all parent categories across all pages
        const parents = await fetchAllPages(
          "https://tyka.premierhostings.com/beta/api/product-sub-categories"
        );

        const childRes = await axios.get(
          `https://tyka.premierhostings.com/beta/api/product-child-categories/${id}`
        );
        const childData = childRes.data?.data;

        setHeadCategories(heads);
        setParentCategories(parents);

        if (childData) {
          const headId = childData.parent_category.id?.toString() || "";
          const parentId = childData.child_category.id?.toString() || "";

          setSelectedHeadId(headId);
          setParentCategoryId(parentId);

          const filtered = parents.filter(
            (p) => p.product_category_id?.toString() === headId
          );
          setFilteredParentCategories(filtered);

          setName(childData.name || "");
          setSlug(childData.slug || "");
          setDescription(childData.description || "");
        }
      } catch (error) {
        toast.error("Failed to load data.");
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [id]);

  // Update filtered parents when selectedHeadId changes
  useEffect(() => {
    if (selectedHeadId && parentCategories.length > 0) {
      const filtered = parentCategories.filter(
        (p) => p.product_category_id?.toString() === selectedHeadId
      );
      setFilteredParentCategories(filtered);

      if (!filtered.some((p) => p.id.toString() === parentCategoryId)) {
        setParentCategoryId("");
      }
    } else {
      setFilteredParentCategories([]);
      setParentCategoryId("");
    }
  }, [selectedHeadId, parentCategories]);

  // Auto-generate slug from name
  useEffect(() => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
  }, [name]);

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!selectedHeadId) newErrors.head = "Please select a head category.";
    if (!parentCategoryId)
      newErrors.parent = "Please select a parent category.";
    if (!name.trim()) newErrors.name = "Name is required.";
    else if (!nameRegex.test(name))
      newErrors.name = "Name should only contain letters and spaces.";
    if (!slug.trim()) newErrors.slug = "Slug is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((err) => toast.error(err));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const bannerPayload = [];

    for (const banner of banners) {
      if (banner.image) {
        bannerPayload.push({
          type: banner.type,
          image: await fileToBase64(banner.image),
        });
      }
    }

    const updatedChild = {
      product_category_id: selectedHeadId,
      product_subcategory_id: parentCategoryId,
      name,
      slug,
      description,
      category_id: selectedHeadId,
      category_image: categoryImage
        ? await fileToBase64(categoryImage)
        : null,
      banners: bannerPayload,
    };

    try {
      Swal.fire({
        title: "Updating Category...",
        text: "Please wait while we update the category.",
        allowOutsideClick: false,
        background: "#000",
        color: "#dc2626",
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.put(
        `https://tyka.premierhostings.com/beta/api/product-child-categories/${id}`,
        updatedChild
      );

      Swal.close();
      toast.success("Child category updated successfully!");
      setTimeout(
        () => navigate(`/childcategory?page=${page}&per_page=${per_page}`),
        1500
      );
    } catch (error) {
      Swal.close();
      toast.error("Failed to update child category.");
      console.error("Update error:", error);
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
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Edit Child Category</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 dark:bg-gray-800 rounded-lg p-6"
      >
        {/* Head Category */}
        <div>
          <label
            htmlFor="headCategory"
            className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Head Category <span className="text-red-500">*</span>
          </label>
          <select
            id="headCategory"
            value={selectedHeadId}
            onChange={(e) => setSelectedHeadId(e.target.value)}
            className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 ${errors.head ? "border-red-500" : ""
              }`}
          >
            <option value="">Select a Head Category</option>
            {headCategories.map((head) => (
              <option key={head.id} value={head.id.toString()}>
                {head.name}
              </option>
            ))}
          </select>
        </div>

        {/* Parent Category */}
        <div>
          <label
            htmlFor="parentCategory"
            className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Parent Category <span className="text-red-500">*</span>
          </label>
          <select
            id="parentCategory"
            value={parentCategoryId}
            onChange={(e) => setParentCategoryId(e.target.value)}
            className={`w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:border-gray-600 ${errors.parent ? "border-red-500" : ""
              }`}
            disabled={!selectedHeadId || filteredParentCategories.length === 0}
          >
            <option value="">Select a Parent Category</option>
            {filteredParentCategories.map((parent) => (
              <option key={parent.id} value={parent.id.toString()}>
                {parent.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="childCategoryName"
            className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="childCategoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${errors.name ? "border-red-500" : ""} w-full`}
          />
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Slug <span className="text-red-500">*</span>
          </label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={`${errors.slug ? "border-red-500" : ""} w-full`}
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description
          </label>
          <RichTextEditor value={description} onChange={setDescription} />
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
        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(`/childcategory?page=${page}&per_page=${per_page}`)
            }
            className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            Update
          </Button>
        </div>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default EditChildCategory;
