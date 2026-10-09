"use client";

import React, { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddCouponPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formCoupon, setFormCoupon] = useState({
    code: "",
    name: "",
    type: "percentage",
    value: "",
    usageLimit: 0,
    minCart: 0,
    maxCart: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const handleSave = async () => {
    // ✅ Toastify Validations
    if (!formCoupon.name.trim()) {
      toast.error("Coupon name is required.", { position: "top-right" });
      return;
    }
    if (!formCoupon.code.trim()) {
      toast.error("Coupon code is required.", { position: "top-right" });
      return;
    }
    if (!formCoupon.type.trim()) {
      toast.error("Discount type is required.", { position: "top-right" });
      return;
    }
    if (formCoupon.value === "" || Number(formCoupon.value) <= 0) {
      toast.error("Discount value is required.", { position: "top-right" });
      return;
    }

    setLoading(true);

    const payload = {
      coupon_name: formCoupon.name,
      coupon_code: formCoupon.code,
      discount_type: formCoupon.type,
      discount_value: Number(formCoupon.value),
      date_from: formCoupon.startDate,
      date_to: formCoupon.endDate,
      no_uses_allowed: Number(formCoupon.usageLimit),
      no_of_uses: 0,
      min_amount: Number(formCoupon.minCart),
    };

    try {
      console.debug("Payload to send:", payload);
      const response = await fetch(
        "https://tyka.premierhostings.com/beta/api/coupons",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to add coupon");

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Coupon ${formCoupon.code} has been added successfully!`,
      });

      setFormCoupon({
        code: "",
        name: "",
        type: "percentage",
        value: "",
        usageLimit: 0,
        minCart: 0,
        maxCart: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });

      navigate("/coupons");
    } catch (error) {
      console.error("API Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto relative">
      <h1 className="text-2xl font-bold mb-6">Add New Coupon</h1>
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500"></div>
        </div>
      )}
      <div className="space-y-4">
        {/* Coupon Code & Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Coupon Code:</label>
          <Input
            placeholder="Enter coupon code"
            value={formCoupon.code}
            onChange={(e) =>
              setFormCoupon({ ...formCoupon, code: e.target.value })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Coupon Name:</label>
          <Input
            placeholder="Enter coupon name"
            value={formCoupon.name}
            onChange={(e) =>
              setFormCoupon({ ...formCoupon, name: e.target.value })
            }
            className="w-full"
          />
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Discount Type:
          </label>
          <Input
            placeholder="Enter discount type (percentage/fixed)"
            value={formCoupon.type}
            onChange={(e) =>
              setFormCoupon({ ...formCoupon, type: e.target.value })
            }
            className="w-full"
          />
        </div>

        {/* Discount Value */}
        <div>
          <label className="block text-sm font-medium mb-1">Value:</label>
          <Input
            type="number"
            placeholder="0"
            value={formCoupon.value}
            onChange={(e) =>
              setFormCoupon({ ...formCoupon, value: e.target.value })
            }
            className="w-full"
          />
        </div>

        {/* Usage Limit */}
        <div>
          <label className="block text-sm font-medium mb-1">Usage Limit:</label>
          <Input
            type="number"
            placeholder="0"
            value={formCoupon.usageLimit === 0 ? "" : formCoupon.usageLimit}
            onChange={(e) =>
              setFormCoupon({
                ...formCoupon,
                usageLimit: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        {/* Min Cart Value */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Min Cart Value:
          </label>
          <Input
            type="number"
            placeholder="0"
            value={formCoupon.minCart === 0 ? "" : formCoupon.minCart}
            onChange={(e) =>
              setFormCoupon({
                ...formCoupon,
                minCart: e.target.value === "" ? 0 : Number(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        {/* Start & End Dates */}
        <div>
          <label className="block text-sm font-medium mb-1">Start Date:</label>
          <Input
            type="date"
            value={formCoupon.startDate}
            onChange={(e) =>
              setFormCoupon({ ...formCoupon, startDate: e.target.value })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date:</label>
          <Input
            type="date"
            value={formCoupon.endDate}
            onChange={(e) =>
              setFormCoupon({ ...formCoupon, endDate: e.target.value })
            }
            className="w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate("/coupons")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Add Coupon"}
          </Button>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      // aap light/dark bhi kar sakte ho
      />
    </div>
  );
};

export default AddCouponPage;
