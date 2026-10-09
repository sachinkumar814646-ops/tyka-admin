import React, { useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddColor() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("1");
  const [color, setColor] = useColor("hex", "#ff0000");
  const [secondColorEnabled, setSecondColorEnabled] = useState(false);
  const [secondColor, setSecondColor] = useColor("hex", "#0000ff");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const newColor = {
      name,
      hexa_code: color.hex,
      rgb_code: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
      hsv_code: `hsv(${color.hsv.h}, ${color.hsv.s}, ${color.hsv.v})`,
      status: parseInt(status),
    };

    // Include second color only if toggle is enabled
    if (secondColorEnabled) {
      newColor.hexa_code_2 = secondColor.hex;
    }

    console.log("newColor", newColor);

    fetch("https://tyka.premierhostings.com/beta/api/product-colors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newColor),
    })
      .then((res) => res.json())
      .then((data) => {
        toast.success("Color saved successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate("/colors");
        }, 2200);
      })
      .catch((err) => {
        console.error("Error saving color:", err);
        toast.error("Failed to save color ❌", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="max-w-2xl mx-auto dark:bg-gray-900 shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Add Color</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Color Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Color Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter color name"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* First Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Pick a Color
          </label>
          <div
            className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 inline-block"
            style={{ width: "620px" }}
          >
            <ColorPicker
              width={350}
              height={120}
              color={color}
              onChange={setColor}
              hideRGB
            />
          </div>
        </div>

        {/* Toggle Second Color Picker */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={secondColorEnabled}
            onChange={(e) => setSecondColorEnabled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <label className="text-gray-700 dark:text-gray-300">
            Add Another Color?
          </label>
        </div>

        {/* Second Color Picker */}
        {secondColorEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Pick Second Color
            </label>
            <div
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 inline-block"
              style={{ width: "620px" }}
            >
              <ColorPicker
                width={350}
                height={120}
                color={secondColor}
                onChange={setSecondColor}
                hideRGB
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Save Color
        </button>
      </form>

      <ToastContainer />
    </div>
  );
}
