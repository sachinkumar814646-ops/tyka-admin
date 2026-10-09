"use client";
import React, { useState } from "react";

const ImagesTab = ({ data = {}, updateData }) => {
  const [formData, setFormData] = useState({
    default_image: data.default_image || null, // file or url
    images: Array.isArray(data.images) ? data.images : [], // files or urls
  });

  const [previews, setPreviews] = useState({
    default_image: data.default_image || "",
    images: Array.isArray(data.images) ? data.images : [],
  });

  const [dragActive, setDragActive] = useState(false);

  // Sync with parent using backend keys
  const syncWithParent = (newData, newPreviews) => {
    setFormData(newData);
    setPreviews(newPreviews);
    updateData({
      default_image: newData.default_image,
      images: newData.images,
    });
  };

  // Main image
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);

    syncWithParent(
      { ...formData, default_image: file },
      { ...previews, default_image: preview }
    );
  };

  // Additional images
  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = [...formData.images, ...files];
    const newPreviews = [
      ...previews.images,
      ...files.map((file) => URL.createObjectURL(file)),
    ];

    syncWithParent(
      { ...formData, images: newFiles },
      { ...previews, images: newPreviews }
    );
  };

  const removeMainImage = () =>
    syncWithParent(
      { ...formData, default_image: null },
      { ...previews, default_image: "" }
    );

  const removeAdditionalImage = (index) => {
    const newFiles = [...formData.images];
    const newPreviews = [...previews.images];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    syncWithParent(
      { ...formData, images: newFiles },
      { ...previews, images: newPreviews }
    );
  };

  // Drag & drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (["dragenter", "dragover"].includes(e.type)) setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e, isMain = false) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!e.dataTransfer.files.length) return;

    if (isMain) {
      const file = e.dataTransfer.files[0];
      const preview = URL.createObjectURL(file);
      syncWithParent(
        { ...formData, default_image: file },
        { ...previews, default_image: preview }
      );
    } else {
      const files = Array.from(e.dataTransfer.files);
      const newFiles = [...formData.images, ...files];
      const newPreviews = [
        ...previews.images,
        ...files.map((file) => URL.createObjectURL(file)),
      ];
      syncWithParent(
        { ...formData, images: newFiles },
        { ...previews, images: newPreviews }
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="shadow-md rounded-lg overflow-hidden">
        <div className="md:p-8 p-4 space-y-8">
          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
              Main Product Image
            </label>
            <div
              className={`dropzone flex flex-col items-center justify-center p-6 border ${
                dragActive ? "border-red-500" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, true)}
            >
              {previews.default_image ? (
                <div className="relative w-full max-w-xs mx-auto">
                  <img
                    src={previews.default_image}
                    alt="Main"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeMainImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 rounded-full text-white hover:bg-red-700"
                  >
                    X
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Drag & drop your main image here or select
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-white">
              Additional Product Images
            </label>
            <div
              className={`dropzone flex flex-col items-center justify-center p-6 border ${
                dragActive ? "border-red-500" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, false)}
            >
              <p className="text-sm text-gray-500">
                Drag & drop multiple images here
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAdditionalImagesChange}
                className="mt-2"
              />
            </div>

            {previews.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {previews.images.map((url, i) => (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      alt={`Product ${i + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(i)}
                      className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full px-2"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JSON Output (for debugging) */}
      <pre className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
        {JSON.stringify(
          {
            default_image: formData.default_image
              ? formData.default_image.name || "URL"
              : null,
            images: formData.images.map((img) => img.name || "URL"),
          },
          null,
          2
        )}
      </pre>
    </div>
  );
};

export default ImagesTab;
