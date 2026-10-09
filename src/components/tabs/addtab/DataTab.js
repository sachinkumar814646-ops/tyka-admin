"use client";
import React, { useState, useEffect } from "react";
import $ from "jquery";
import "select2";
import "select2/dist/css/select2.min.css";

const DataTab = ({
  tags = [],
  seasons = {},
  fabrics = {},
  brands = {},
  discounts = [],
  formData,
  updateData,
}) => {
  console.log("seasons", tags);
  const [gstType, setGstType] = useState(formData.gstType || "");
  const [gstIncludeValue, setGstIncludeValue] = useState(
    formData.gstIncludeValue || ""
  );
  const [gstExcludeValue, setGstExcludeValue] = useState(
    formData.gstExcludeValue || ""
  );
  const [stock, setStock] = useState(formData.stock || "");
  const [sortOrder, setSortOrder] = useState(formData.sortOrder || "");

  // -------- INIT SELECT2 (runs once) ----------
  useEffect(() => {
    const ids = ["#tags"];
    ids.forEach((id) => {
      $(id)
        .select2({
          placeholder: "Select options",
          allowClear: true,
          width: "100%",
          theme: "default",
        })
        .on("change", function () {
          const field = $(this).attr("id");
          const selectedValues = $(this).val() || [];
          updateData(field, selectedValues);
        });
    });

    // return () => {
    //   ids.forEach((id) => $(id).select2("destroy"));
    // };
  }, []);

  // -------- SYNC formData to select2 ---------
  useEffect(() => {
    $("#tags")
      .val(formData.tags || [])
      .trigger("change.select2");
  }, [formData.tags]);

  // -------- Auto-calculate selling price based on discount_id --------
  useEffect(() => {
    const cost = parseFloat(formData.cost_price) || 0;
    const selectedDiscount = discounts.find(
      (d) => d.id.toString() === formData.discount_id?.toString()
    );
    const discountPercent = selectedDiscount
      ? parseFloat(selectedDiscount.amount)
      : 0;

    const discountAmount = (cost * discountPercent) / 100;
    const sellingPrice = cost - discountAmount;
    updateData("selling_price", sellingPrice.toFixed(2));
  }, [formData.cost_price, formData.discount_id]);

  return (
    <div className="tab-panel text-black dark:text-white">
      {/* SKU + Tags */}
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">SKU *</label>
            <input
              type="text"
              className="form-control bg-transparent text-black dark:text-white"
              value={formData.sku || ""}
              onChange={(e) => updateData("sku", e.target.value)}
              placeholder="Product SKU"
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Tags</label>
            <select id="tags" multiple className="w-full">
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* HSN */}
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">HSN</label>
            <input
              type="text"
              className="form-control bg-transparent text-black dark:text-white"
              value={formData.hsn || ""}
              onChange={(e) => updateData("hsn", e.target.value)}
              placeholder="Product HSN"
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section">
        <h4 className="section-title border-bottom pb-1 dark:text-white dark:border-gray-600">
          Pricing Information
        </h4>
        <div className="row">
          {/* Cost Price */}
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Cost Price</label>
              <input
                type="number"
                className="form-control bg-transparent text-black dark:text-white"
                value={formData.cost_price || ""}
                onChange={(e) => updateData("cost_price", e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Selling Price */}
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Selling Price *</label>
              <input
                type="number"
                className="form-control bg-transparent text-black dark:text-white"
                value={formData.selling_price || ""}
                readOnly
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          {/* Discount Dropdown */}
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">Discount</label>
              <select
                className="form-control bg-transparent text-black dark:text-white"
                value={formData.discount_id || ""}
                onChange={(e) => updateData("discount_id", e.target.value)}
              >
                <option value="">Select Discount</option>
                {discounts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.amount}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GST Type */}
          <div className="col-md-3">
            <div className="form-group">
              <label className="form-label">GST</label>
              <select
                value={gstType}
                onChange={(e) => {
                  setGstType(e.target.value);
                  updateData("gst_type", e.target.value);
                }}
                className="form-control bg-transparent text-black dark:text-white"
              >
                <option value="">Select GST Type</option>
                <option value="include">Include</option>
                <option value="exclude">Exclude</option>
              </select>
            </div>
          </div>

          {/* GST Fields */}
          {gstType === "include" && (
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">GST Include Value</label>
                <input
                  type="number"
                  value={gstIncludeValue}
                  onChange={(e) => {
                    setGstIncludeValue(e.target.value);
                    updateData("gst", e.target.value);
                  }}
                  placeholder="Enter GST include value"
                  className="form-control bg-transparent text-black dark:text-white"
                />
              </div>
            </div>
          )}
          {gstType === "exclude" && (
            <div className="col-md-3">
              <div className="form-group">
                <label className="form-label">GST Exclude Value</label>
                <input
                  type="number"
                  value={gstExcludeValue}
                  onChange={(e) => {
                    setGstExcludeValue(e.target.value);
                    updateData("gstExcludeValue", e.target.value);
                  }}
                  placeholder="Enter GST exclude value"
                  className="form-control bg-transparent text-black dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dimensions Section */}
      <div className="dimensions-section mt-4">
        <h4 className="section-title border-bottom pb-1 dark:text-white dark:border-gray-600">
          Dimensions & Weight
        </h4>
        <div className="row">
          {["length", "width", "height", "weight"].map((field, i) => (
            <div className="col-md-3" key={field}>
              <div className="form-group">
                <label className="form-label">
                  {["Length (cm)", "Width (cm)", "Height (cm)", "Weight"][i]}
                </label>
                <input
                  type="number"
                  className="form-control bg-transparent text-black dark:text-white"
                  value={formData[field] || ""}
                  onChange={(e) => updateData(field, e.target.value)}
                  placeholder="0"
                  step="0.1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sort Order & Stock */}
      <div className="row mt-4">
        <div className="col-md-6">
          <label className="form-label">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value);
              updateData("sortOrder", e.target.value);
            }}
            placeholder="Enter sort order"
            className="form-control bg-transparent text-black dark:text-white"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => {
              setStock(e.target.value);
              updateData("stock", e.target.value);
            }}
            placeholder="Enter stock quantity"
            className="form-control bg-transparent text-black dark:text-white"
          />
          <small className="text-muted">
            Low stock warning at 5 units or less
          </small>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info-section mt-4">
        <h4 className="section-title border-bottom pb-1 dark:text-white dark:border-gray-600">
          Product Information
        </h4>
        <div className="row">
          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Season</label>
              <select
                id="season_id"
                className="w-full"
                value={formData.season_id || ""}
                onChange={(e) => updateData("season_id", e.target.value)}
              >
                <option value="">-- Select Option --</option>
                {Object.entries(seasons).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Fabric</label>
              <select
                id="fabric_id"
                className="w-full"
                value={formData.fabric_id || ""}
                onChange={(e) => updateData("fabric_id", e.target.value)}
              >
                <option value="">-- Select Option --</option>
                {Object.entries(fabrics).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <select
                id="brand_id"
                className="w-full"
                value={formData.brand_id || ""}
                onChange={(e) => updateData("brand_id", e.target.value)}
              >
                <option value="">-- Select Option --</option>
                {Object.entries(brands).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTab;
