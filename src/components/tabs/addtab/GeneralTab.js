"use client";
import { useEffect, useRef } from "react";
import $ from "jquery";
import "popper.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "bootstrap/dist/css/bootstrap.min.css";
import "summernote/dist/summernote-bs4.css";
import "summernote/dist/summernote-bs4.js";

const GeneralTab = ({ data, updateData }) => {
  const descriptionEditorRef = useRef(null);

  // Initialize Summernote and sync description
  useEffect(() => {
    const $editor = $(descriptionEditorRef.current);

    if (typeof $editor.summernote === "function") {
      $editor.summernote({
        placeholder: "Enter description...",
        tabsize: 2,
        height: 200,
        toolbar: [
          ["style", ["bold", "italic", "underline", "clear"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["insert", ["link", "picture"]],
          ["view", ["codeview"]],
        ],
        callbacks: {
          onChange: function (contents) {
            updateData("description", contents);
          },
          onInit: function () {
            $(".note-editable").css({
              backgroundColor: "transparent",
              color: "#000000",
            });
            // Set initial content
            $editor.summernote("code", data.description || "");
          },
          onFocus: function () {
            $(".note-editable").css({
              backgroundColor: "transparent",
              color: "#000000",
            });
          },
        },
      });
    }

    return () => {
      if ($editor.hasClass("summernote")) {
        $editor.summernote("destroy");
      }
    };
  }, [data.description, updateData]);

  // Generate slug when name changes
  useEffect(() => {
    if (data.name) {
      const generatedSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      if (generatedSlug !== data.slug) {
        updateData("slug", generatedSlug);
      }
    } else if (data.slug) {
      updateData("slug", "");
    }
  }, [data.name, data.slug, updateData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateData(name, type === "checkbox" ? checked : value);
  };

  const handleToggle = (name) => {
    updateData(name, !data[name]);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <form className="shadow-md rounded-lg p-8 bg-transparent dark:text-white">
        {/* Name and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={data.name || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Product name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={data.slug || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Auto-generated slug"
              required
            />
          </div>
        </div>

        {/* Short Description */}
        <div className="mb-6">
          <label
            htmlFor="short_description"
            className="block text-sm font-medium mb-1"
          >
            Short Description
          </label>
          <textarea
            id="short_description"
            name="short_description"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter a short description..."
            value={data.short_description || ""}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description
          </label>
          <textarea
            ref={descriptionEditorRef}
            id="description"
            name="description"
            className="hidden"
          ></textarea>
        </div>

        {/* Video URL */}
        <div className="mb-6">
          <label
            htmlFor="video_url"
            className="block text-sm font-medium mb-1 dark:text-white"
          >
            Video URL
          </label>
          <input
            type="url"
            id="video_url"
            name="video_url"
            value={data.video_url || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="https://example.com/video"
          />
        </div>

        {/* SEO Info */}
        <div className="mb-8 space-y-6">
          <div>
            <label
              htmlFor="meta_title"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Meta Title
            </label>
            <input
              type="text"
              id="meta_title"
              name="meta_title"
              value={data.meta_title || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Meta title for SEO"
            />
          </div>
          <div>
            <label
              htmlFor="meta_description"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={data.meta_description || ""}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Meta description for SEO"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="meta_keywords"
              className="block text-sm font-medium mb-1 dark:text-white"
            >
              Meta Keywords
            </label>
            <input
              type="text"
              id="meta_keywords"
              name="meta_keywords"
              value={data.meta_keywords || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="Comma separated keywords"
            />
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 pb-2 border-b dark:text-white dark:border-gray-700">
            Product Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {[
              ["status", "Status"],
              ["new", "New"],
              ["featured", "Featured"],
              ["top_selling", "Top Selling"],
              ["sale", "On Sale"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center dark:text-white">
                <label className="toggle-button mt-2">
                  <input
                    type="checkbox"
                    name={key}
                    checked={data[key] || false}
                    onChange={() => handleToggle(key)}
                  />
                  <span className="slider"></span>
                </label>
                <span className="toggle-label ml-2">
                  {label}: {data[key] ? "Yes" : "No"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default GeneralTab;
