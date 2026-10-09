"use client";

import { useEffect, useRef } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const ProductVariationTab = ({
  sizes = [],
  colors = [],
  formData,
  setFormData,
  tableData,
  setTableData,
  updateData,
}) => {
  const inputRefs = useRef({});

  // Convert sizes/colors to proper arrays
  const sampleSizes = Array.isArray(sizes)
    ? sizes
    : Object.entries(sizes).map(([id, label]) => ({
        id: Number(id),
        label,
        name: label,
      }));

  const sampleColors = Array.isArray(colors)
    ? colors.map((c) => ({
        id: c.id,
        name: c.name,
        hexa_code: c.hexa_code || "#ccc",
        hexa_code_2: c.hexa_code_2 || "#ccc",
      }))
    : Object.entries(colors).map(([id, c]) => ({
        id: Number(id),
        name: c.name,
        hexa_code: c.hexa_code || "#ccc",
        hexa_code_2: c.hexa_code_2 || "#ccc",
      }));

  const getColorById = (id) => sampleColors.find((c) => c.id === Number(id));

  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const handleSelectChange = (field, selectedValues) => {
    const numericValues = selectedValues.map((v) => Number(v));

    setFormData((prev) => ({
      ...prev,
      [field]: numericValues,
      ...(field === "sizes" &&
      !numericValues.includes(Number(prev.default_size))
        ? { default_size: "" }
        : {}),
      ...(field === "colors" &&
      !numericValues.includes(Number(prev.default_color))
        ? { default_color: "" }
        : {}),
    }));
  };

  useEffect(() => {
    const selectors = ["#sizes", "#colors"];

    selectors.forEach((selector) => {
      const $el = $(selector);
      $el.select2({
        placeholder: "Select options",
        allowClear: true,
        width: "100%",
      });

      $el.on("change", function () {
        const field = $(this).attr("id");
        const values = $(this).val() || [];
        const numericValues = values.map((v) => Number(v));

        if (!arraysEqual(numericValues, formData[field])) {
          handleSelectChange(field, numericValues);
        }
      });
    });

    return () => {
      selectors.forEach((selector) => {
        const $el = $(selector);
        if ($el.data("select2")) {
          $el.select2("destroy");
          $el.off("change");
        }
      });
    };
  }, [formData]);

  useEffect(() => {
    const selectors = ["#sizes", "#colors"];
    selectors.forEach((selector) => {
      const $el = $(selector);
      const field = selector.slice(1);

      const stringValues = formData[field].map(String);
      if (!arraysEqual($el.val() || [], stringValues)) {
        $el.off("change");
        $el.val(stringValues).trigger("change.select2");
        $el.on("change", function () {
          const values = ($(this).val() || []).map(Number);
          handleSelectChange(field, values);
        });
      }
    });
  }, [formData.sizes, formData.colors]);

  // 🟢 FIXED: Build structured data for saving images
  const buildStructuredData = () => {
    const result = [];

    formData.colors.forEach((color_id) => {
      formData.sizes.forEach((size_id) => {
        const stock = tableData[`${color_id}_${size_id}_qty`] || 0;
        const imageFiles = tableData[`${color_id}_image_files`] || [];

        result.push({
          color_id: Number(color_id),
          size_id: Number(size_id),
          stock: Number(stock),
          default_image: imageFiles.length > 0 ? imageFiles[0] : null,
          images: imageFiles, // ✅ real File[] objects (not URLs)
        });
      });
    });

    return result;
  };

  useEffect(() => {
    if (updateData) {
      const structuredData = buildStructuredData();
      const color_ids = formData.colors.map((id) => Number(id));
      const size_ids = formData.sizes.map((id) => Number(id));

      updateData(
        structuredData,
        Number(formData.default_size),
        Number(formData.default_color),
        color_ids,
        size_ids
      );
    }
  }, [formData, tableData]);

  const setDefault = (field, value) => {
    if (field === "size") {
      setFormData((prev) => ({ ...prev, default_size: value }));
    } else if (field === "color") {
      setFormData((prev) => ({ ...prev, default_color: value }));
    }
  };

  const handleInputChange = (color_id, size_id, stock) => {
    setTableData((prev) => ({
      ...prev,
      [`${color_id}_${size_id}_qty`]: stock,
    }));
  };

  // 🟢 FIXED: Store both Files & Preview URLs
  const handleImageChange = (color_id, files) => {
    const newFiles = Array.from(files);
    const previews = newFiles.map((file) => URL.createObjectURL(file));

    setTableData((prev) => ({
      ...prev,
      [`${color_id}_image_files`]: [
        ...(prev[`${color_id}_image_files`] || []),
        ...newFiles,
      ],
      [`${color_id}_image_previews`]: [
        ...(prev[`${color_id}_image_previews`] || []),
        ...previews,
      ],
    }));
  };

  return (
    <div className="max-w-full p-6 dark:bg-transparent text-gray-900 dark:text-white">
      {/* Size Selector */}
      <div className="mb-6">
        <label htmlFor="sizes" className="block text-sm font-medium mb-2">
          Size
        </label>
        <select id="sizes" multiple>
          {sampleSizes.map((size) => (
            <option key={size.id} value={size.id}>
              {size.name || size.label}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.sizes.map((size_id) => {
            const sizeObj = sampleSizes.find((s) => s.id === Number(size_id));
            if (!sizeObj) return null;
            return (
              <div
                key={size_id}
                className="flex gap-2 items-center bg-gray-100 dark:bg-gray-800 p-2 rounded"
              >
                <span>{sizeObj.label || sizeObj.name}</span>
                <button
                  onClick={() => setDefault("size", sizeObj.id)}
                  className={`text-xs px-2 py-0.5 rounded ${
                    formData.default_size === sizeObj.id
                      ? "bg-red-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {formData.default_size === sizeObj.id
                    ? "Default"
                    : "Make Default"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Color Selector */}
      <div className="mb-6">
        <label htmlFor="colors" className="block text-sm font-medium mb-2">
          Color
        </label>
        <select id="colors" multiple>
          {sampleColors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.colors.map((color_id) => {
            const color = getColorById(color_id);
            if (!color) return null;
            return (
              <div
                key={color_id}
                className="flex gap-2 items-center bg-gray-100 dark:bg-gray-800 p-2 rounded"
              >
                <span
                  className="inline-block w-4 h-4 rounded-full border"
                  style={{
                    background: color.hexa_code_2
                      ? `linear-gradient(135deg, ${color.hexa_code} 50%, ${color.hexa_code_2} 50%)`
                      : color.hexa_code,
                  }}
                ></span>
                <span>{color.name}</span>
                <button
                  onClick={() => setDefault("color", color.id)}
                  className={`text-xs px-2 py-0.5 rounded ${
                    formData.default_color === color.id
                      ? "bg-red-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {formData.default_color === color.id
                    ? "Default"
                    : "Make Default"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Matrix Table */}
      {formData.sizes.length > 0 && formData.colors.length > 0 && (
        <div className="overflow-x-auto border rounded shadow-sm">
          <table className="min-w-full table-fixed">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">Color / Size</th>
                {formData.sizes.map((size_id) => {
                  const sizeObj = sampleSizes.find(
                    (s) => s.id === Number(size_id)
                  );
                  return (
                    <th key={size_id} className="px-3 py-2 text-center">
                      {sizeObj?.name}
                    </th>
                  );
                })}
                <th className="px-3 py-2 text-center">Images</th>
              </tr>
            </thead>
            <tbody>
              {formData.colors.map((color_id) => {
                const color = getColorById(color_id);
                return (
                  <tr key={color_id}>
                    <td className="px-3 py-2 font-medium flex items-center gap-2">
                      <span
                        className="inline-block w-4 h-4 rounded-full border"
                        style={{
                          background: color.hexa_code_2
                            ? `linear-gradient(135deg, ${color.hexa_code} 50%, ${color.hexa_code_2} 50%)`
                            : color.hexa_code,
                        }}
                      ></span>
                      {color.name}
                    </td>

                    {formData.sizes.map((size_id) => {
                      if (!inputRefs.current[color_id])
                        inputRefs.current[color_id] = {};
                      return (
                        <td
                          key={`${color_id}_${size_id}`}
                          className="px-2 py-1"
                        >
                          <input
                            type="number"
                            min={0}
                            className="w-full text-center border rounded"
                            value={
                              tableData[`${color_id}_${size_id}_qty`] || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                color_id,
                                size_id,
                                e.target.value
                              )
                            }
                          />
                        </td>
                      );
                    })}

                    <td className="px-2 py-1 min-w-[250px]">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(color_id, e.target.files)
                        }
                        className="block w-full text-sm"
                      />
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(tableData[`${color_id}_image_previews`] || []).map(
                          (img, i) => (
                            <img
                              key={i}
                              src={img || "/placeholder.svg"}
                              alt="preview"
                              className="w-12 h-12 object-cover rounded"
                            />
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductVariationTab;
