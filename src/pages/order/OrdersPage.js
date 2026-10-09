"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableOrderCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import {
  Search,
  Download,
  Filter,
  Loader2,
  Eye,
  Trash2,
  Printer,
  MoreVertical,
  Pencil,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import { useNavigate, useSearchParams } from "react-router-dom";
import PermissionGuard from "../../components/auth/PermissionGuard";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ordersData, setOrdersData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ page and per_page URL params
  const initialPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const initialPerPage = Number.parseInt(
    searchParams.get("per_page") || "10",
    10,
  );
  const [page, setPage] = useState(initialPage);
  const [entriesPerPage, setEntriesPerPage] = useState(initialPerPage);

  const [selectedIds, setSelectedIds] = useState([]);
  const [shippmentIds, setShippmentIds] = useState([]);
  const token = localStorage.getItem("token");
  const [paymentType, setPaymentType] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Build params object with all filters
      const params = {
        search: searchTerm,
        perPage: entriesPerPage,
        page: page,
      };

      // Add filter parameters if they have values
      if (paymentType) params.payment_type = paymentType;
      if (orderStatus) params.order_status = orderStatus;
      if (paymentStatus) params.payment_status = paymentStatus;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axios.get(
        `https://tyka.premierhostings.com/beta/api/orders`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data?.data) {
        setOrdersData(response.data.data);
        setTotalPages(response.data.meta?.last_page || 1);
        setTotalItems(response.data.meta?.total || response.data.data.length);
      } else {
        setOrdersData([]);
        setTotalPages(1);
        setTotalItems(0);
        setError("Invalid data format received");
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (order) => {
    // ✅ Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;

    // ✅ Address handling (Login user vs Guest user)
    let userAddress = null;
    let isGuest = false;

    if (order.users && Object.keys(order.users).length > 0) {
      // logged-in user
      userAddress = order.user_address;
    } else if (order.guest_shipping_address || order.guest_billing_address) {
      // guest user
      isGuest = true;
      userAddress = {
        shipping: order.guest_shipping_address,
        billing: order.guest_billing_address,
      };
    }

    const orderItems = order.order_details?.data || [];

    // Group items
    const groupedItems = orderItems.reduce((acc, item) => {
      if (item.bundle) {
        const key = `bundle_${item.bundle.id}`;

        if (!acc[key]) {
          acc[key] = {
            type: "bundle",
            bundle: item.bundle,
            items: [],
          };
        }

        acc[key].items.push(item);
      } else {
        if (!acc.single) {
          acc.single = {
            type: "single",
            items: [],
          };
        }

        acc.single.items.push(item);
      }

      return acc;
    }, {});

    const productsHTML = Object.values(groupedItems)
      .map((group) => {
        // Bundle Products
        if (group.type === "bundle") {
          return `
        <tr style="background:#f3f4f6;">
          <td colspan="2">
            <strong>Bundle: ${group.bundle.name}</strong>
            ${
              group.bundle.sku
                ? `<br/><small>SKU: ${group.bundle.sku}</small>`
                : ""
            }
          </td>
        </tr>

        ${group.items
          .map(
            (item) => `
            <tr>
              <td style="padding-left:25px;">
                <strong>${item.products?.name}</strong><br/>
                <small>SKU: ${item.products?.sku || "N/A"}</small><br/>
                <small>Colour: ${item.colors?.name || "N/A"}</small><br/>
                <small>Size: ${item.sizes?.name || "N/A"}</small>
              </td>
              <td style="text-align:center;">
                ${item.quantity}
              </td>
            </tr>
          `,
          )
          .join("")}
      `;
        }

        // Single Products
        return group.items
          .map(
            (item) => `
          <tr>
            <td>
              <strong>${item.products?.name}</strong><br/>
              <small>SKU: ${item.products?.sku || "N/A"}</small><br/>
              <small>Colour: ${item.colors?.name || "N/A"}</small><br/>
              <small>Size: ${item.sizes?.name || "N/A"}</small>
            </td>
            <td style="text-align:center;">
              ${item.quantity}
            </td>
          </tr>
        `,
          )
          .join("");
      })
      .join("");

    const today = new Date().toLocaleDateString();

    iframeDoc.write(`
  <html>
  <head>
    <title>Packing Slip - ${order.order_code}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; }
      .header { background: #f4e0f0; padding: 20px; }
      .company-info { text-align: right; }
      .section { margin-top: 20px; }
      .section h3 { background: #eee; padding: 8px; margin: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border-bottom: 1px solid #ddd; padding: 8px; vertical-align: top; }
      .address-box { width: 48%; display: inline-block; vertical-align: top; }
      .footer { margin-top: 40px; font-size: 12px; color: #777; }
    </style>
  </head>
  <body>
    <div class="header">
      <div style="float: left;"><h2>Packing Slip</h2></div>
      <div class="company-info">
        <strong>Tk Sports Pvt.Ltd.</strong><br/>
        407, Leather Complex, Jalandhar – 144021, Punjab<br/>
        9803061407<br/>
        coordinator@tyka.com
      </div>
      <div style="clear: both;"></div>
    </div>

    <div class="section">
      <div class="address-box">
        <h3>Ship To:</h3>
        <p>
          ${
            isGuest
              ? userAddress?.shipping || "N/A"
              : `${order.user_address?.name || ""}<br/>
                 ${order.user_address?.street || ""}, ${
                   order.user_address?.apartment_suite || ""
                 }<br/>
                 ${order.user_address?.city?.name || ""}, ${
                   order.user_address?.state?.name || ""
                 }, ${order.user_address?.country?.name || ""}<br/>
                 Zip: ${order.user_address?.zipcode || ""}<br/>
                 ${order.user_address?.phone_number || ""}`
          }
        </p>
      </div>

      <div class="address-box" style="float:right;">
        <h3>Bill To:</h3>
        <p>
          ${
            isGuest
              ? userAddress?.billing || "N/A"
              : `${order.user_address?.name || ""}<br/>
                 ${order.user_address?.street || ""}, ${
                   order.user_address?.apartment_suite || ""
                 }<br/>
                 ${order.user_address?.city?.name || ""}, ${
                   order.user_address?.state?.name || ""
                 }, ${order.user_address?.country?.name || ""}<br/>
                 Zip: ${order.user_address?.zipcode || ""}<br/>
                 ${order.user_address?.phone_number || ""}`
          }
        </p>
      </div>
      <div style="clear: both;"></div>
    </div>

    <div class="section">
      <p><strong>Order Number:</strong> ${order.order_code}</p>
      <p><strong>Order Date:</strong> ${new Date(
        order.order_date,
      ).toLocaleDateString()}</p>
      <p><strong>Shipping Method:</strong> Free Shipping</p>
    </div>

    <div class="section">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${productsHTML}
        </tbody>
      </table>
    </div>

    <div class="footer">Printed on: ${today}</div>
  </body>
  </html>
`);

    iframeDoc.close();

    // ✅ Print after iframe loads
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // ✅ Remove iframe after printing
      setTimeout(() => document.body.removeChild(iframe), 100);
    };
  };

  const handleInvoicePrint = (order) => {
    // ✅ Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;

    // ✅ Pick correct address like in view
    let isGuest = false;
    let userAddress = null;

    if (order.users && Object.keys(order.users).length > 0) {
      // logged-in user
      userAddress = order.user_address;
    } else if (order.guest_shipping_address || order.guest_billing_address) {
      // guest user
      isGuest = true;
      userAddress = {
        shipping: order.guest_shipping_address,
        billing: order.guest_billing_address,
      };
    }

    const orderItems = order.order_details?.data || [];

    // Group Bundle & Single Products
    const groupedItems = orderItems.reduce((acc, item) => {
      if (item.bundle) {
        const key = `bundle_${item.bundle.id}`;

        if (!acc[key]) {
          acc[key] = {
            type: "bundle",
            bundle: item.bundle,
            items: [],
          };
        }

        acc[key].items.push(item);
      } else {
        if (!acc.single) {
          acc.single = {
            type: "single",
            items: [],
          };
        }

        acc.single.items.push(item);
      }

      return acc;
    }, {});

    const productsHTML = Object.values(groupedItems)
      .map((group) => {
        // Bundle Products
        if (group.type === "bundle") {
          const bundlePrice = Number(group.bundle.offer_price || 0);

          // quantity should come from the paid bundle item
          const qty =
            group.items.find((i) => Number(i.price) > 0)?.quantity ||
            group.items[0].quantity;

          const total = bundlePrice * qty;

          return `
    <tr style="background:#f3f4f6;font-weight:bold;">
      <td>
        Bundle: ${group.bundle.name}<br/>
      </td>
      <td style="text-align:center;">${qty}</td>
      <td style="text-align:right;">₹${bundlePrice.toFixed(2)}</td>
      <td style="text-align:right;">₹${total.toFixed(2)}</td>
    </tr>

    ${group.items
      .map(
        (item) => `
          <tr>
            <td style="padding-left:30px;">
              • ${item.products?.name}<br/>
              <small>SKU: ${item.products?.sku || "N/A"}</small><br/>
              <small>Colour: ${item.colors?.name || "N/A"}</small><br/>
              <small>Size: ${item.sizes?.name || "N/A"}</small>
            </td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        `,
      )
      .join("")}
  `;
        }

        // Single Products
        return group.items
          .map((item) => {
            const price = Number.parseFloat(item.price || 0);
            const total = price * item.quantity;

            return `
          <tr>
            <td>
              <strong>${item.products?.name}</strong><br/>
              <small>SKU: ${item.products?.sku || "N/A"}</small><br/>
              <small>Colour: ${item.colors?.name || "N/A"}</small><br/>
              <small>Size: ${item.sizes?.name || "N/A"}</small>
            </td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">₹${price.toFixed(2)}</td>
            <td style="text-align:right;">₹${total.toFixed(2)}</td>
          </tr>
        `;
          })
          .join("");
      })
      .join("");

    // ✅ Calculate totals from backend fields
    const subtotal =
      order.order_details?.data?.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0,
      ) || 0;

    const discount = Number.parseFloat(order.discount_amount || 0);
    const shipping = Number.parseFloat(order.shipping_charge || 0);
    const coupon =
      Array.isArray(order.coupon_id) && order.coupon_id.length > 0
        ? "Applied"
        : null;

    const grandTotal = Number.parseFloat(order.final_amount || subtotal);

    const today = new Date().toLocaleDateString();

    iframeDoc.write(`
    <html>
    <head>
      <title>Invoice - ${order.order_code}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { background: #f4e0f0; padding: 20px; }
        .company-info { text-align: right; }
        .section { margin-top: 20px; }
        .section h3 { background: #eee; padding: 8px; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border-bottom: 1px solid #ddd; padding: 8px; vertical-align: top; }
        .address-box { width: 48%; display: inline-block; vertical-align: top; }
        .footer { margin-top: 40px; font-size: 12px; color: #777; }
        .totals { text-align: right; margin-top: 20px; }
        .totals table { width: 300px; float: right; }
        .totals td { border: none; padding: 6px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="float: left;"><h2>Invoice</h2></div>
        <div class="company-info">
          <strong>Tk Sports Pvt.Ltd.</strong><br/>
          407, Leather Complex, Jalandhar – 144021, Punjab<br/>
          9803061407<br/>
          coordinator@tyka.com
        </div>
        <div style="clear: both;"></div>
      </div>

      <div class="section">
        <div class="address-box">
          <h3>Bill To:</h3>
          <p>
            ${
              isGuest
                ? userAddress.billing || "N/A"
                : `${order.user_address?.name || ""}<br/>
                   ${order.user_address?.street || ""}, ${
                     order.user_address?.apartment_suite || ""
                   }<br/>
                   ${order.user_address?.city?.name || ""}, ${
                     order.user_address?.state?.name || ""
                   }, ${order.user_address?.country?.name || ""}<br/>
                   Zip: ${order.user_address?.zipcode || ""}<br/>
                   ${order.user_address?.phone_number || ""}`
            }
          </p>
        </div>

        <div class="address-box" style="float:right;">
          <h3>Ship To:</h3>
          <p>
            ${
              isGuest
                ? userAddress.shipping || "N/A"
                : `${order.user_address?.name || ""}<br/>
                   ${order.user_address?.street || ""}, ${
                     order.user_address?.apartment_suite || ""
                   }<br/>
                   ${order.user_address?.city?.name || ""}, ${
                     order.user_address?.state?.name || ""
                   }, ${order.user_address?.country?.name || ""}<br/>
                   Zip: ${order.user_address?.zipcode || ""}<br/>
                   ${order.user_address?.phone_number || ""}`
            }
          </p>
        </div>
        <div style="clear: both;"></div>
      </div>

      <div class="section">
        <p><strong>Invoice Number:</strong> INV-${order.order_code}</p>
        <p><strong>Order Date:</strong> ${new Date(
          order.order_date,
        ).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${
          order.payment_type || "Prepaid"
        }</p>
      </div>

      <div class="section">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${productsHTML}
          </tbody>
        </table>
      </div>

      <div class="totals">
<table style="float:right; width:300px; border-collapse:collapse;">
  <tr>
    <td style="padding:6px 0; width:170px;">
      <strong>Subtotal:</strong>
    </td>
    <td style="padding:6px 0; text-align:right; width:130px;">
      ₹${subtotal.toFixed(2)}
    </td>
  </tr>

  <tr>
    <td style="padding:6px 0;">
      <strong>Shipping:</strong>
    </td>
    <td style="padding:6px 0; text-align:right;">
      ₹${shipping.toFixed(2)}
    </td>
  </tr>

  <tr style="font-size:16px;">
    <td style="padding-top:10px;">
      <strong>Grand Total:</strong>
    </td>
    <td style="padding-top:10px; text-align:right;">
      <strong>₹${grandTotal.toFixed(2)}</strong>
    </td>
  </tr>
</table>
      </div>

      <div style="clear: both;"></div>

      <div class="footer">Printed on: ${today}</div>
    </body>
    </html>
  `);

    iframeDoc.close();

    // ✅ Print after iframe loads
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 100);
    };
  };

  useEffect(() => {
    fetchOrders();
  }, [
    searchTerm,
    page,
    entriesPerPage,
    paymentType,
    orderStatus,
    paymentStatus,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    params.set("per_page", String(entriesPerPage));
    setSearchParams(params); // push to history so Back returns to the same page/per_page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, entriesPerPage]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This order will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `https://tyka.premierhostings.com/beta/api/orders/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        Swal.fire("Deleted!", "The order has been deleted.", "success");
        fetchOrders();
      } catch (err) {
        console.error("❌ Delete failed:", err);
        Swal.fire("Error", "Failed to delete order.", "error");
      }
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) {
      Swal.fire("Warning", "Please select orders to delete", "warning");
      return;
    }

    // ✅ Show confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete selected orders. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(
          "https://tyka.premierhostings.com/beta/api/order/bulk-delete",
          { ids: selectedIds },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        Swal.fire(
          "Deleted!",
          "Selected orders deleted successfully.",
          "success",
        );
        setSelectedIds([]);
        fetchOrders(); // refresh the list
      } catch (err) {
        console.error("❌ Bulk delete failed:", err);
        Swal.fire("Error", "Failed to delete selected orders.", "error");
      }
    }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("token"); // attach your auth token if required
      const response = await axios.get(
        "https://tyka.premierhostings.com/beta/api/orders-export",
        {
          responseType: "blob", // important for file downloads
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Create blob and download
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8;",
      });
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `orders_${timestamp}.csv`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const startIndex = (page - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + ordersData.length, totalItems);

  // Generate page numbers dynamically
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchOrders(); // Trigger new API call with current filter values
    console.log("Filters applied:", {
      paymentType,
      orderStatus,
      paymentStatus,
      startDate,
      endDate,
    });
  };

  const handleBulkShipping = async (shippmentIds) => {
    if (!Array.isArray(shippmentIds) || shippmentIds.length === 0) {
      Swal.fire(
        "Warning",
        "Please select orders to assign shipping",
        "warning",
      );
      return;
    }

    // ✅ Step 1: Select Provider
    const { value: provider } = await Swal.fire({
      title: "Select Shipping Provider",
      input: "radio",
      inputOptions: {
        bluedart: "Blue Dart",
        dtdc: "DTDC",
      },
      inputValidator: (value) => {
        if (!value) return "Please select a provider!";
      },
      confirmButtonText: "Select",
      showCancelButton: true,
      width: "400px",
    });

    if (!provider) return;

    // ✅ Step 2: Filter out orders already shipped by the other provider
    const filteredShipments = shippmentIds.filter((item) => {
      if (provider === "bluedart" && item.shipped_via === "dtdc") return false;
      if (provider === "dtdc" && item.shipped_via === "bluedart") return false;
      return true;
    });

    if (filteredShipments.length === 0) {
      Swal.fire(
        "Info",
        `All selected orders have already been shipped via ${
          provider === "bluedart" ? "DTDC" : "Blue Dart"
        }.`,
        "info",
      );
      return;
    }

    // ✅ Step 3: Remove Duplicate Orders (Fix for duplicate form display)
    const uniqueShipments = Array.from(
      new Map(
        filteredShipments.map((item) => [item.order_code, item]),
      ).values(),
    );

    // ✅ Step 4: Generate Dynamic Order Forms
    const orderFormsHtml = uniqueShipments
      .map(
        (item, index) => `
    <div style="
      border:1px solid #dcdcdc;
      padding:10px 12px;
      border-radius:8px;
      margin-bottom:10px;
      background:#fdfdfd;
      text-align:left;
      font-size:13px;
    ">
      <h4 style="margin:0 0 8px 0;font-size:14px;">
        <span style="color:#444;">Order Code:</span> 
        <strong style="color:#2c3e50;">${item.order_code}</strong>
      </h4>

      <div style="display:flex;flex-direction:column;gap:8px;">
        <div>
          <label style="font-size:12px;color:#333;">Load Type:</label><br/>
          <select 
            id="load_type_${index}" 
            style="width:90%;margin-top:4px;padding:5px 8px;font-size:12px;height:32px;border:1px solid #bbb;border-radius:6px;background-color:#fff;">
            <option value="DOCUMENT">DOCUMENT</option>
            <option value="NON-DOCUMENT" selected>NON-DOCUMENT</option>
          </select>
        </div>

        <div>
          <label style="font-size:12px;color:#333;">Consignment Type:</label><br/>
          <select 
            id="consignment_type_${index}" 
            style="width:90%;margin-top:4px;padding:5px 8px;font-size:12px;height:32px;border:1px solid #bbb;border-radius:6px;background-color:#fff;">
            <option value="FORWARD" selected>FORWARD</option>
            <option value="RETURN">RETURN</option>
          </select>
        </div>
      </div>
    </div>
  `,
      )
      .join("");

    // ✅ Step 5: Common Confirmation Before Submit
    const { value: confirmed } = await Swal.fire({
      title: `Assign ${
        provider === "bluedart" ? "Blue Dart" : "DTDC"
      } Shipping`,
      html: `<div style="max-height:300px;overflow-y:auto;padding-right:4px;">${orderFormsHtml}</div>`,
      width: "450px",
      confirmButtonText: "Submit",
      showCancelButton: true,
      focusConfirm: false,
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: async () => {
        Swal.showLoading();
        const orderData = uniqueShipments.map((item, index) => ({
          id: item.id,
          order_code: item.order_code,
          load_type: document.getElementById(`load_type_${index}`).value,
          consignment_type: document.getElementById(`consignment_type_${index}`)
            .value,
        }));
        await new Promise((res) => setTimeout(res, 400));
        return orderData;
      },
    });

    if (!confirmed) return;

    // ✅ Prepare Payload Based on Provider
    let payload;
    if (provider === "bluedart") {
      payload = {
        order_ids: confirmed.map((o) => o.id),
      };
    } else {
      payload = {
        provider,
        orders: confirmed.map((o) => ({
          id: o.id,
          order_code: o.order_code,
          load_type: o.load_type,
          consignment_type: o.consignment_type,
        })),
      };
    }

    // ✅ Loader Overlay
    const loaderOverlay = document.createElement("div");
    loaderOverlay.style.position = "fixed";
    loaderOverlay.style.top = "0";
    loaderOverlay.style.left = "0";
    loaderOverlay.style.width = "100vw";
    loaderOverlay.style.height = "100vh";
    loaderOverlay.style.background = "rgba(0,0,0,0.7)";
    loaderOverlay.style.display = "flex";
    loaderOverlay.style.alignItems = "center";
    loaderOverlay.style.justifyContent = "center";
    loaderOverlay.style.zIndex = "9999";
    loaderOverlay.innerHTML = `
    <div style="border:5px solid #f3f3f3;border-top:5px solid #e11d48;border-radius:50%;width:60px;height:60px;animation: spin 1s linear infinite;"></div>
    <style>@keyframes spin {0% {transform: rotate(0deg);}100% {transform: rotate(360deg);}}</style>
  `;
    document.body.appendChild(loaderOverlay);

    try {
      // ✅ CALL API BASED ON PROVIDER
      const url =
        provider === "bluedart"
          ? "https://tyka.premierhostings.com/beta/api/bluedart/shipment"
          : "https://tyka.premierhostings.com/beta/api/shipment";

      const res = await axios.post(url, payload);
      document.body.removeChild(loaderOverlay);

      console.log("ressssponse", res, payload);
      debugger;

      // ✅ Blue Dart Response Handling
      if (provider === "bluedart") {
        const results = res.data.results || [];
        const successShipments = results.filter((r) => r.success);
        const failedShipments = results.filter((r) => !r.success);

        const uniqueSuccess = Array.from(
          new Map(
            successShipments.map((item) => [item.order_id, item]),
          ).values(),
        );
        const uniqueFailed = Array.from(
          new Map(
            failedShipments.map((item) => [item.order_id, item]),
          ).values(),
        );

        let html = `
        <p style="font-size:13px;margin-bottom:10px;">
          <strong>${res.data.message || "Blue Dart Shipment Summary"}</strong>
        </p>
        <div style="max-height:250px;overflow-y:auto;text-align:left;">`;

        if (uniqueSuccess.length > 0) {
          html += `
          <h4 style="font-size:13px;margin-bottom:5px;">Processed Shipments:</h4>
          <table style="width:100%;border-collapse:collapse;font-size:12px;">
            <thead>
              <tr style="background:#f2f2f2;">
                <th style="padding:6px;border:1px solid #ddd;">Order Code</th>
                <th style="padding:6px;border:1px solid #ddd;">AWB No</th>
                <th style="padding:6px;border:1px solid #ddd;">Shipment ID</th>
                <th style="padding:6px;border:1px solid #ddd;">Label</th>
              </tr>
            </thead>
            <tbody>
              ${uniqueSuccess
                .map(
                  (item) => `
                <tr>
                  <td style="padding:5px;border:1px solid #ddd;">${item.order_id}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.awb_no}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.shipment_id}</td>
                  <td style="padding:5px;border:1px solid #ddd;">
                    <a href="${item.label_path}" target="_blank" style="color:#2563eb;text-decoration:underline;">View Label</a>
                  </td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>`;
        }

        if (uniqueFailed.length > 0) {
          html += `
          <h4 style="font-size:13px;color:red;margin-top:10px;">Failed Shipments:</h4>
          <table style="width:100%;border-collapse:collapse;font-size:12px;color:red;">
            <thead>
              <tr style="background:#ffecec;">
                <th style="padding:6px;border:1px solid #ddd;">Order Code</th>
                <th style="padding:6px;border:1px solid #ddd;">Error Message</th>
              </tr>
            </thead>
            <tbody>
              ${uniqueFailed
                .map(
                  (item) => `
                <tr>
                  <td style="padding:5px;border:1px solid #ddd;">${
                    item.order_id
                  }</td>
                  <td style="padding:5px;border:1px solid #ddd;">${
                    item.message || "Error"
                  }</td>
                </tr>`,
                )
                .join("")}
            </tbody>
          </table>`;
        }

        html += `</div>`;

        Swal.fire({
          title: "Blue Dart Summary",
          html,
          icon: "success",
          width: "600px",
          confirmButtonText: "OK",
        }).then(() => {
          setSelectedIds([]);
          setShippmentIds([]);
        });
      }

      // ✅ DTDC Response Handling (Modified)
      if (provider === "dtdc") {
        const responseData = res.data.data || res.data;
        const { message, processed = [], failed = [] } = responseData;

        // 👉 Move shipments without consignment_number to failed
        const processedWithNumber = [];
        const failedWithMissingNumber = [];

        processed.forEach((item) => {
          if (!item.consignment_number) {
            failedWithMissingNumber.push({
              order_id: item.order_id,
              reason: "Shipment failed: Consignment number not generated",
            });
          } else {
            processedWithNumber.push(item);
          }
        });

        const finalFailed = [...failed, ...failedWithMissingNumber];

        const uniqueProcessed = Array.from(
          new Map(
            processedWithNumber.map((item) => [item.order_id, item]),
          ).values(),
        );
        const uniqueFailed = Array.from(
          new Map(finalFailed.map((item) => [item.order_id, item])).values(),
        );

        let html = `
      <p style="font-size:13px;margin-bottom:10px;">
        <strong>${message || "DTDC Shipment Summary"}</strong>
      </p>
      <div style="max-height:250px;overflow-y:auto;text-align:left;">`;

        if (uniqueProcessed.length > 0) {
          html += `
        <h4 style="font-size:13px;margin-bottom:5px;">Processed Shipments:</h4>
        <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">
          <thead>
            <tr style="background:#f2f2f2;border-bottom:1px solid #ddd;">
              <th style="padding:6px;border:1px solid #ddd;">Order Code</th>
              <th style="padding:6px;border:1px solid #ddd;">Service</th>
              <th style="padding:6px;border:1px solid #ddd;">Mode</th>
              <th style="padding:6px;border:1px solid #ddd;">Shipment ID</th>
              <th style="padding:6px;border:1px solid #ddd;">Consignment #</th>
            </tr>
          </thead>
          <tbody>
            ${uniqueProcessed
              .map(
                (item) => `
                <tr>
                  <td style="padding:5px;border:1px solid #ddd;">${item.order_id}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.service_used}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.mode}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.shipment_id}</td>
                  <td style="padding:5px;border:1px solid #ddd;">${item.consignment_number}</td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>`;
        }

        if (uniqueFailed.length > 0) {
          html += `
        <h4 style="font-size:13px;color:red;margin-top:10px;">Failed Shipments:</h4>
        <table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;color:red;">
          <thead>
            <tr style="background:#ffecec;border-bottom:1px solid #ddd;">
              <th style="padding:6px;border:1px solid #ddd;">Order Code</th>
              <th style="padding:6px;border:1px solid #ddd;">Reason</th>
            </tr>
          </thead>
          <tbody>
            ${uniqueFailed
              .map(
                (item) => `
                <tr>
                  <td style="padding:5px;border:1px solid #ddd;">${
                    item.order_id
                  }</td>
                  <td style="padding:5px;border:1px solid #ddd;">${
                    item.reason || "Unknown"
                  }</td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>`;
        }

        html += `</div>`;

        Swal.fire({
          title: "DTDC Summary",
          html,
          icon: "success",
          width: "600px",
          confirmButtonText: "OK",
        }).then(() => {
          setSelectedIds([]);
          setShippmentIds([]);
        });
      }
    } catch (err) {
      document.body.removeChild(loaderOverlay);
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to assign shipment",
        "error",
      );
    }
  };

  const clearFilters = () => {
    setPaymentType("");
    setOrderStatus("");
    setPaymentStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6">
        <div className="w-full max-w-full">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate dark:text-white">
            Order Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Manage and process customer orders
          </p>
        </div>

        <Card className="w-full max-w-full">
          <CardHeader className="px-3 sm:px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl truncate">
                  Orders
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  Manage and process customer orders
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button
                  variant={selectedIds.length > 0 ? "default" : "outline"}
                  disabled={selectedIds.length === 0}
                  onClick={() => handleBulkShipping(shippmentIds)} // ✅ Pass IDs properly
                >
                  Shipping
                </Button>

                <PermissionGuard permission="bulk_delete_order">
                  <Button
                    variant={selectedIds.length > 0 ? "destructive" : "outline"}
                    disabled={selectedIds.length === 0}
                    onClick={bulkDelete}
                  >
                    Bulk Delete
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="export_order">
                  <Button
                    onClick={exportCSV}
                    className="w-full sm:w-auto text-sm"
                  >
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                </PermissionGuard>

                {/* Filter Toggle Button */}
                {/* ✅ Filter toggle button */}
                <Button
                  onClick={() => setShowFilters((prev) => !prev)}
                  className="w-full sm:w-auto text-sm"
                  variant="outline"
                >
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
              </div>
            </div>

            {/* Top controls: show entries & search */}
            <div className="flex justify-between items-center mt-4 w-full max-w-full dark:text-white">
              <div>
                Show{" "}
                <select
                  className="border p-1 rounded bg-transparent text-sm"
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>{" "}
                entries
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="text-sm"
                />
              </div>
            </div>
            {/* ✅ Filter dropdown */}
            {showFilters && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg-grid-cols-3 gap-4">
                  {/* Payment Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Payment Type
                    </label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    >
                      <option value="">All</option>
                      <option value="payu">PayU</option>
                      <option value="cod">Cash on Delivery</option>
                    </select>
                  </div>

                  {/* Order Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Order Status
                    </label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    >
                      <option value="">All</option>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border rounded p-2 bg-transparent dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                  <Button
                    onClick={applyFilters}
                    className="bg-red-600 text-white"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="px-3 sm:px-4 lg:px-6">
            <div className="hidden lg:block w-full overflow-x-auto">
              <div className="overflow-x-auto w-full">
                <Table className=" table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.length === ordersData.length &&
                            ordersData.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(
                                ordersData.map((order) => order.id),
                              );
                              setShippmentIds(
                                ordersData.map((order) => ({
                                  id: order.id,
                                  order_code: order.order_code,
                                })),
                              );
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Order Code</TableHead>

                      <TableHead className="w-[300px] max-w-[300px]">
                        Profile & Address
                      </TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-red-500"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : ordersData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center text-gray-500"
                        >
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      ordersData.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(order.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // ✅ Add both ID and order_code
                                  setSelectedIds((prev) => [...prev, order.id]);
                                  setShippmentIds((prev) => [
                                    ...prev,
                                    {
                                      id: order.id,
                                      order_code: order.order_code,
                                    },
                                  ]);
                                } else {
                                  // ✅ Remove from both arrays when unchecked
                                  setSelectedIds((prev) =>
                                    prev.filter((id) => id !== order.id),
                                  );
                                  setShippmentIds((prev) =>
                                    prev.filter((item) => item.id !== order.id),
                                  );
                                }
                              }}
                            />
                          </TableCell>

                          <TableCell>{order.order_code}</TableCell>
                          <TableOrderCell className="w-[300px] max-w-[300px] p-1">
                            <div className="max-w-[300px] ">
                              <p className="flex items-center gap-2 font-medium m-0">
                                {order.users?.name ? (
                                  <>
                                    <span className="inline-flex items-center rounded-md border border-green-500 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                      User
                                    </span>
                                    <span>{order.users.name}</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="inline-flex items-center rounded-md border border-orange-500 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                                      Guest
                                    </span>
                                    <span>
                                      {order.guest_name || "Guest User"}
                                    </span>
                                  </>
                                )}
                              </p>

                              {/* Phone Number */}
                              <small className="block font-medium text-base">
                                {(order.user_address &&
                                typeof order.user_address.user === "object"
                                  ? order.user_address?.phone ||
                                    order.user_address?.user?.phone
                                  : order.guest_phone
                                )?.replace(/^(\+91|91|0)/, "") || "No Phone"}
                              </small>

                              {/* Address */}
                              <small className="block break-words whitespace-normal">
                                {order.user_address &&
                                typeof order.user_address.user === "object"
                                  ? `${order.user_address?.street || ""}, ${
                                      order.user_address?.apartment_suite || ""
                                    }, ${order.user_address?.city?.name || ""}, ${
                                      order.user_address?.state?.name || ""
                                    }, ${order.user_address?.country?.name || ""} - ${
                                      order.user_address?.zipcode || ""
                                    }`
                                  : order.guest_shipping_address ||
                                    order.guest_billing_address ||
                                    "No Address"}
                              </small>
                            </div>
                          </TableOrderCell>

                          <TableCell>
                            <div className="flex flex-col gap-2">
                              {/* Amount */}
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                ₹{order.total_amount}
                              </span>

                              {/* Badges */}
                              <div className="flex flex-wrap gap-2">
                                <span
                                  className={`inline-flex items-center uppercase rounded-full px-3 py-1 text-xs font-semibold ${
                                    order.payment_type?.toLowerCase() === "cod"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : order.payment_type?.toLowerCase() ===
                                          "payu"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {order.payment_type || "-"}
                                </span>

                                <span
                                  className={`inline-flex items-center uppercase rounded-full px-3 py-1 text-xs font-semibold ${
                                    order.payment_status?.toLowerCase() ===
                                    "paid"
                                      ? "bg-green-100 text-green-800"
                                      : order.payment_status?.toLowerCase() ===
                                          "unpaid"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {order.payment_status || "-"}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <select
                              value={order.order_status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  await axios.post(
                                    `https://tyka.premierhostings.com/beta/api/order/${order.id}`,
                                    { status: newStatus },
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    },
                                  );
                                  fetchOrders();
                                  Swal.fire(
                                    "Updated!",
                                    "Order status updated successfully.",
                                    "success",
                                  );
                                } catch (err) {
                                  console.error(
                                    "❌ Failed to update status:",
                                    err,
                                  );
                                  Swal.fire(
                                    "Error",
                                    "Failed to update order status.",
                                    "error",
                                  );
                                }
                              }}
                              className="border rounded px-2 py-1 text-sm dark:bg-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="return_requested">
                                Return Requested
                              </option>
                              <option value="return_approved">
                                Return Approved
                              </option>
                              <option value="return_rejected">
                                Return Rejected
                              </option>
                              <option value="item_returned">
                                Item Returned
                              </option>
                              <option value="refund_initiated">
                                Refund Initiated
                              </option>
                              <option value="refunded">Refunded</option>
                              <option value="exchange_requested">
                                Exchange Requested
                              </option>
                              <option value="exchange_approved">
                                Exchange Approved
                              </option>
                              <option value="exchange_rejected">
                                Exchange Rejected
                              </option>
                              <option value="exchange_completed">
                                Exchange Completed
                              </option>
                            </select>
                          </TableCell>

                          <TableCell>
                            {order.order_date
                              ? new Date(order.order_date).toLocaleDateString()
                              : "N/A"}
                          </TableCell>

                          <TableCell className="relative">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(
                                    openDropdownId === order.id
                                      ? null
                                      : order.id,
                                  );
                                }}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                <MoreVertical className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                              </button>

                              {openDropdownId === order.id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 shadow-lg rounded-md border z-[9999]">
                                  <PermissionGuard permission="view_order">
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        navigate(
                                          `/view-orders/${order.id}?page=${page}&per_page=${entriesPerPage}`,
                                        );
                                      }}
                                      className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Eye className="h-4 w-4" />
                                      <span>View</span>
                                    </button>
                                  </PermissionGuard>
                                  <PermissionGuard permission="edit_order">
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        navigate(
                                          `/edit-orders/${order.id}?page=${page}&per_page=${entriesPerPage}`,
                                        );
                                      }}
                                      className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Pencil className="h-4 w-4" />
                                      <span>Edit</span>
                                    </button>
                                  </PermissionGuard>
                                  <PermissionGuard permission="pdf_packaging_slip">
                                    {/* ✅ Packaging Slip Button Updated */}
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null);
                                        handlePrint(order); // <-- call your print function here
                                      }}
                                      className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Printer className="h-4 w-4" />
                                      <span>Packaging Slip</span>
                                    </button>
                                  </PermissionGuard>
                                  <PermissionGuard permission="pdf_invoice">
                                    <button
                                      onClick={() => {
                                        setOpenDropdownId(null); // ✅ Close dropdown first
                                        handleInvoicePrint(order); // ✅ Call invoice print function
                                      }}
                                      className="w-full px-3 py-2 flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span>Invoice</span>
                                    </button>
                                  </PermissionGuard>
                                  <PermissionGuard permission="delete_order">
                                    <button
                                      onClick={() => handleDelete(order.id)}
                                      className="w-full px-3 py-2 flex items-center space-x-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span>Delete</span>
                                    </button>
                                  </PermissionGuard>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination and info */}
              <div className="flex justify-between items-center mt-4 dark:text-white">
                <div>
                  Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex}{" "}
                  of {totalItems} entries
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* First Page Always */}
                  <button
                    onClick={() => setPage(1)}
                    className={`px-3 py-1 border rounded ${
                      page === 1
                        ? "bg-red-600 text-white"
                        : "bg-transparent dark:text-white"
                    }`}
                  >
                    1
                  </button>

                  {/* Left Dots */}
                  {page > 3 && <span className="px-2">...</span>}

                  {/* Dynamic Middle Pages */}
                  {Array.from({ length: 3 }, (_, i) => {
                    const pageNumber = page - 1 + i;
                    if (pageNumber > 1 && pageNumber < totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`px-3 py-1 border rounded ${
                            page === pageNumber
                              ? "bg-red-600 text-white"
                              : "bg-transparent dark:text-white"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}

                  {/* Right Dots */}
                  {page < totalPages - 2 && <span className="px-2">...</span>}

                  {/* Last Page Always */}
                  {totalPages > 1 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`px-3 py-1 border rounded ${
                        page === totalPages
                          ? "bg-red-600 text-white"
                          : "bg-transparent dark:text-white"
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}

                  {/* Next Button */}
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersPage;
