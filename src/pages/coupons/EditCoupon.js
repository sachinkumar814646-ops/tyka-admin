"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Swal from "sweetalert2";
import axios from "axios";

const EditCouponPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true); // Loader for initial data
  const [saving, setSaving] = useState(false); // Loader for saving update

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

  // Fetch Coupon by ID from API
  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const res = await axios.get(
          `https://tyka.premierhostings.com/beta/api/coupons/${id}`
        );

        if (res.data && res.data.data) {
          const d = res.data.data;
          setFormCoupon({
            code: d.coupon_code || "",
            name: d.coupon_name || "",
            type: d.discount_type || "percentage",
            value: d.discount_value || "",
            usageLimit: d.no_uses_allowed ? Number(d.no_uses_allowed) : 0,
            minCart: d.min_amount || 0,
            maxCart: 0, // API does not return maxCart, keeping as 0
            startDate: d.date_from || new Date().toISOString().split("T")[0],
            endDate: d.date_to || "",
          });
        }
      } catch (error) {
        console.error("Error fetching coupon:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load coupon data",
        });
      } finally {
        setLoading(false);
      }
    };

    loadCoupon();
  }, [id]);

  // Handle Save/Update
  const handleSave = async () => {
    if (!formCoupon.code || !formCoupon.name) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in all required fields!",
      });
      return;
    }

    const payload = {
      coupon_name: formCoupon.name,
      coupon_code: formCoupon.code,
      discount_value: Number(formCoupon.value),
      discount_type: formCoupon.type,
      date_from: formCoupon.startDate,
      date_to: formCoupon.endDate,
      no_uses_allowed: Number(formCoupon.usageLimit),
      min_amount: Number(formCoupon.minCart),
    };

    setSaving(true);

    try {
      const res = await axios.put(
        `https://tyka.premierhostings.com/beta/api/coupons/${id}`,
        payload
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Coupon updated successfully!",
      });

      navigate("/coupons");
    } catch (error) {
      console.error("Error updating coupon:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Unable to update coupon. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-8 text-center">Loading coupon data...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto relative">
      <h1 className="text-2xl font-bold mb-6">Edit Coupon</h1>

      {/* Loader Overlay */}
      {saving && (
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
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Updating..." : "Update Coupon"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditCouponPage;
