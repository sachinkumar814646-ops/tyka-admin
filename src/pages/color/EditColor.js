import React, { useEffect, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function EditColor() {
  const { id } = useParams(); // Extract the color ID from the URL
  const [name, setName] = useState("");
  const [status, setStatus] = useState("1");
  const [color, setColor] = useColor("hex", "#ff0000"); // Primary color state
  const [secondColor, setSecondColor] = useColor("hex", "#248686"); // Secondary color state
  const [hexCode, setHexCode] = useState("#ff0000");
  const [rgbCode, setRgbCode] = useState("rgb(255, 0, 0)");
  const [hsvCode, setHsvCode] = useState("hsv(0, 0, 100)");
  const [secondColorEnabled, setSecondColorEnabled] = useState(false);
  const navigate = useNavigate();

  // Helper: Parse RGB string (to extract r, g, b values)
  const parseRgb = (rgbStr) => {
    const match = rgbStr.match(/^rgb\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/);
    if (match) {
      return {
        r: Math.round(parseFloat(match[1])),
        g: Math.round(parseFloat(match[2])),
        b: Math.round(parseFloat(match[3])),
      };
    }
    return { r: 255, g: 0, b: 0 }; // Default fallback
  };

  // Helper: Parse HSV string (to extract h, s, v values)
  const parseHsv = (hsvStr) => {
    const match = hsvStr.match(/^hsv\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)$/);
    if (match) {
      const h = parseFloat(match[1]);
      const s = parseFloat(match[2]);
      const v = parseFloat(match[3]);

      return {
        h: isNaN(h) ? 0 : h,
        s: isNaN(s) ? 0 : s,
        v: isNaN(v) ? 100 : v,
      };
    }
    return { h: 0, s: 0, v: 100 };
  };

  // Fetch color data when the component mounts
  useEffect(() => {
    fetch(`https://tyka.premierhostings.com/beta/api/product-colors/${id}`)
      .then((res) => res.json())
      .then((resData) => {
        const colorData = resData.data || {};

        // Set the state with fetched color details
        setName(colorData.name || "");
        setStatus(colorData.status?.toString() || "1");

        // Primary color details
        const hex = colorData.hexa_code || "#ff0000";
        const rgbParsed = parseRgb(colorData.rgb_code || "rgb(255, 0, 0)");
        const hsvParsed = parseHsv(colorData.hsv_code || "hsv(0, 0, 100)");

        // Secondary color details (if available)
        const hex2 = colorData.hexa_code_2 || null;
        const rgbParsed2 = hex2
          ? parseRgb(colorData.rgb_code_2 || "rgb(36, 134, 134)")
          : null;
        const hsvParsed2 = hex2
          ? parseHsv(colorData.hsv_code_2 || "hsv(180, 78.5, 33.3)")
          : null;

        setColor({ hex, rgb: rgbParsed, hsv: hsvParsed });
        if (hex2) {
          setSecondColor({ hex: hex2, rgb: rgbParsed2, hsv: hsvParsed2 });
          setSecondColorEnabled(true); // Enable second color picker if hex2 exists
        }

        setHexCode(hex);
        setRgbCode(`rgb(${rgbParsed.r}, ${rgbParsed.g}, ${rgbParsed.b})`);
        setHsvCode(`hsv(${hsvParsed.h}, ${hsvParsed.s}, ${hsvParsed.v})`);
      })
      .catch((err) => console.error("Error fetching color:", err));
  }, [id]);

  // Sync color picker changes to display values
  useEffect(() => {
    if (color?.hex && color?.rgb && color?.hsv) {
      setHexCode(color.hex);
      setRgbCode(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`);
      setHsvCode(`hsv(${color.hsv.h}, ${color.hsv.s}, ${color.hsv.v})`);
    }
  }, [color]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Extract hex values and handle potential NaN values
    const hexOnly = color.hex.trim().substring(0, 7);
    const hexOnly2 = secondColor.hex.trim().substring(0, 7);

    const safeHSV = {
      h: isNaN(color.hsv?.h) ? 0 : color.hsv.h,
      s: isNaN(color.hsv?.s) ? 0 : color.hsv.s,
      v: isNaN(color.hsv?.v) ? 100 : color.hsv.v,
    };

    const safeHSV2 = {
      h: isNaN(secondColor.hsv?.h) ? 0 : secondColor.hsv.h,
      s: isNaN(secondColor.hsv?.s) ? 0 : secondColor.hsv.s,
      v: isNaN(secondColor.hsv?.v) ? 100 : secondColor.hsv.v,
    };

    const updatedColor = {
      name,
      hexa_code: hexOnly,
      rgb_code: `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
      hsv_code: `hsv(${safeHSV.h}, ${safeHSV.s}, ${safeHSV.v})`,
      hexa_code_2: secondColorEnabled ? hexOnly2 : null,
      rgb_code_2: secondColorEnabled
        ? `rgb(${secondColor.rgb.r}, ${secondColor.rgb.g}, ${secondColor.rgb.b})`
        : null,
      hsv_code_2: secondColorEnabled
        ? `hsv(${safeHSV2.h}, ${safeHSV2.s}, ${safeHSV2.v})`
        : null,
      status: parseInt(status),
    };

    // Send the updated color data to the backend
    fetch(`https://tyka.premierhostings.com/beta/api/product-colors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedColor),
    })
      .then((res) => res.json())
      .then(() => {
        toast.success("Color updated successfully!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => navigate("/colors"), 2000); // Redirect after 2 seconds
      })
      .catch(() => {
        toast.error("Failed to update color!", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <div className="max-w-2xl mx-auto dark:bg-gray-900 shadow-md rounded-lg p-6 mt-6">
      <ToastContainer />
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Edit Color</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Color Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

        {/* Primary Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Pick a Color
          </label>
          <div
            className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 inline-block"
            style={{ width: "100%" }}
          >
            <ColorPicker
              width={350}
              height={120}
              color={color}
              onChange={setColor}
              hideHSV
              hideRGB
            />
          </div>
        </div>

        {/* Secondary Color Picker */}
        {secondColorEnabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Pick Second Color
            </label>
            <div
              className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 inline-block"
              style={{ width: "100%" }}
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

        {/* Toggle for Second Color Picker */}
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

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Update Color
        </button>
      </form>
    </div>
  );
}
