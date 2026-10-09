import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import RichTextEditor from "../../../components/common/RichTextEditor";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

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
const EditParentCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");

  const [headCategories, setHeadCategories] = useState([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [headCategoryId, setHeadCategoryId] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loader state
  const [categoryImage, setCategoryImage] = useState(null);
  const [banners, setBanners] = useState([
    {
      type: "main",
      image: null,
      preview: "",
    },
  ]);

  // Fetch head categories and existing parent category data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // Fetch head categories
        const headsRes = await fetch(
          "https://tyka.premierhostings.com/beta/api/product-categories",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const headsData = await headsRes.json();
        setHeadCategories(headsData.data || []);

        // Fetch existing parent category
        const parentRes = await fetch(
          `https://tyka.premierhostings.com/beta/api/product-sub-categories/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!parentRes.ok) throw new Error("Failed to fetch category");

        const parentData = await parentRes.json();
        const cat = parentData.data;

        setName(cat.name || "");
        setSlug(cat.slug || "");
        setDescription(cat.description || "");
        setHeadCategoryId(cat.product_category_id?.toString() || "");
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load category data");
      }
    };

    fetchData();
  }, [id, token]);

  // Auto-generate slug on name change
  useEffect(() => {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setSlug(generatedSlug);
  }, [name]);

  const validateForm = () => {
    if (!headCategoryId) {
      toast.error("Please select a Head Category");
      return false;
    }
    if (!/^[A-Za-z\s]+$/.test(name.trim())) {
      toast.error("Name should only contain letters and spaces");
      return false;
    }
    if (
      !description ||
      description.trim() === "" ||
      description === "<p><br></p>"
    ) {
      toast.error("Description cannot be empty");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

      Swal.fire({
        title: "Updating Category...",
        text: "Please wait while we update the category.",
        allowOutsideClick: false,
        background: "#ffff",
        color: "#dc2626",
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
        product_category_id: Number(headCategoryId),
        name: name.trim(),
        slug,
        description,
        category_id: Number(headCategoryId),
        category_image: categoryImage
          ? await fileToBase64(categoryImage)
          : null,
        banners: bannerPayload,
      };

      const res = await fetch(
        `https://tyka.premierhostings.com/beta/api/product-sub-categories/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Update failed");

      Swal.close();
      toast.success("Parent Category updated successfully!");
      setLoading(false);

      setTimeout(() => navigate("/parentcategory"), 1500);
    } catch (err) {
      setLoading(false);
      Swal.close();
      console.error("Update error:", err);
      toast.error("Failed to update the category");
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
    <div className="max-w-3xl mx-auto p-6 dark:text-white">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-2xl font-bold mb-6">Edit Parent Category</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 dark:bg-gray-800 rounded-lg p-6"
      >
        {/* Head Category */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="headCategory" className="sm:w-40 font-medium">
            Head Category
          </label>
          <select
            id="headCategory"
            value={headCategoryId}
            onChange={(e) => setHeadCategoryId(e.target.value)}
            className="flex-1 border rounded-md p-2"
            required
          >
            <option value="">Select a Head Category</option>
            {headCategories.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="name" className="sm:w-40 font-medium">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
            required
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label htmlFor="slug" className="sm:w-40 font-medium">
            Slug
          </label>
          <Input
            id="slug"
            value={slug}
            readOnly
            className="flex-1 bg-gray-100"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="description" className="sm:w-40 font-medium pt-2">
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
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/parentcategory")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditParentCategory;
