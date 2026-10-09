"use client";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ActivityLogModal from "../../components/common/ActivityLogModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import {
  ArrowLeft,
  Eye,
  X,
  RotateCcw,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import Swal from "sweetalert2";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showLogs, setShowLogs] = useState(false);
  const [showReturn, setShowReturn] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const [statusData, setStatusData] = useState({
    id: "",
    status: "",
    admin_remark: "",
  });
  const [open, setOpen] = useState([]);

  const [selectedReturn, setSelectedReturn] = useState(false);

  // ✅ page and per_page URL params
  const initialPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const initialPerPage = Number.parseInt(
    searchParams.get("per_page") || "10",
    10,
  );
  const [page, setPage] = useState(initialPage);
  const [entriesPerPage, setEntriesPerPage] = useState(initialPerPage);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `https://tyka.premierhostings.com/beta/api/orders/${id}`,
        );
        setOrder(res.data);

        const orderItems = res.data.data.order_details?.data || [];

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

        setGroupedItems(groupedItems);

        console.log(groupedItems);
        setShowReturn(res.data.data.product_returns.data);
        console.log(res.data);
        console.log(res.data.data.users, res.data.data.product_returns.data);
      } catch (err) {
        console.error("❌ Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Loading Order Details...</p>
      </div>
    );
  }

  if (!order || !order.data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-red-500">Order not found</p>
      </div>
    );
  }

  const orderData = order.data;

  const handleUpdateReturnStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const res = await axios.post(
        `https://tyka.premierhostings.com/beta/api/order-returns/${statusData.id}/status`,
        {
          status: statusData.status,
          admin_remark: statusData.admin_remark,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.message || "Status updated successfully.",
        });

        // Update UI immediately
        setShowReturn((prev) =>
          prev.map((item) =>
            item.id === statusData.id
              ? {
                  ...item,
                  status: statusData.status,
                  admin_remark: statusData.admin_remark,
                }
              : item,
          ),
        );

        setSelectedReturn(false);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: res.data.message,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "Unable to update return status.",
      });
    }
  };
  const handleOpen = (item) => {
    setSelectedReturn(item);

    setStatusData({
      status: item.status || "",
      admin_remark: item.admin_remark || "",
    });

    setOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 gap-2">
      <div className="flex items-center justify-between mb-6">
        {/* Back Button */}
        <button
          onClick={() =>
            navigate(`/orders?page=${page}&per_page=${entriesPerPage}`)
          }
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        {/* View Log Button */}
        <button
          onClick={() => setShowLogs(true)} // change route as needed
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          <Eye size={18} />
          View Log
        </button>
        <ActivityLogModal
          open={showLogs}
          onClose={() => setShowLogs(false)}
          endpoint={`orders/${id}`}
        />
      </div>
      <div className="max-w-7xl">
        {/* Order Summary */}
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <p>
              <strong>Order Code:</strong> {orderData.order_code}
            </p>
            <p>
              <strong>Status:</strong> {orderData.order_status}
            </p>
            <p>
              <strong>Payment:</strong> {orderData.payment_status} (
              {orderData.payment_type})
            </p>
            <p>
              <strong>Total:</strong> ₹{orderData.total_amount}
            </p>
            <p>
              <strong>Shipping Charges:</strong> ₹{orderData.shipping_charge}
            </p>
            <p>
              <strong>Final Amount:</strong> ₹{orderData.final_amount}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(orderData.order_date).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        {orderData?.shipping_detail && (
          <Card className="bg-transparent mt-2 border border-gray-200 shadow-md">
            {/* --- Shipping Info --- */}
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <p>
                <strong>Carrier:</strong>{" "}
                {orderData.shipping_detail?.carrier_name || "null"}
              </p>
              <p>
                <strong>Consignment #:</strong>{" "}
                {orderData.shipping_detail?.consignment_number || "null"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {orderData.shipping_detail?.payload?.consignments?.[0]
                  ?.description || "null"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {orderData.shipping_detail?.status || "-"}
              </p>
              <p>
                <strong>Customer Ref #:</strong>{" "}
                {orderData.shipping_detail?.customer_reference_number || "null"}
              </p>
              <p>
                <strong>COD Amount:</strong> ₹
                {orderData.shipping_detail?.payload?.consignments?.[0]
                  ?.cod_amount || "0.00"}
              </p>
              <p>
                <strong>Declared Value:</strong> ₹
                {orderData.shipping_detail?.payload?.consignments?.[0]
                  ?.declared_value || "0.00"}
              </p>
              <p>
                <strong>Weight:</strong>{" "}
                {orderData.shipping_detail?.payload?.consignments?.[0]?.weight}{" "}
                {
                  orderData.shipping_detail?.payload?.consignments?.[0]
                    ?.weight_unit
                }
              </p>
              <p>
                <strong>Dimensions (L×W×H):</strong>{" "}
                {orderData.shipping_detail?.payload?.consignments?.[0]?.length}×
                {orderData.shipping_detail?.payload?.consignments?.[0]?.width}×
                {orderData.shipping_detail?.payload?.consignments?.[0]?.height}{" "}
                {
                  orderData.shipping_detail?.payload?.consignments?.[0]
                    ?.dimension_unit
                }
              </p>
            </CardContent>

            {/* --- Origin --- */}
            <hr className="border-gray-300 my-3" />
            <CardHeader>
              <CardTitle>Origin Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const o =
                  orderData.shipping_detail?.payload?.consignments?.[0]
                    ?.origin_details;
                return (
                  <>
                    <p>
                      <strong>Name:</strong> {o?.name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {o?.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {o?.email}
                    </p>
                    <p>
                      <strong>Address:</strong> {o?.address_line_1},{" "}
                      {o?.address_line_2}
                    </p>
                    <p>
                      <strong>City:</strong> {o?.city}
                    </p>
                    <p>
                      <strong>State:</strong> {o?.state}
                    </p>
                    <p>
                      <strong>Pincode:</strong> {o?.pincode}
                    </p>
                  </>
                );
              })()}
            </CardContent>

            {/* --- Destination --- */}
            <hr className="border-gray-300 my-3" />
            <CardHeader>
              <CardTitle>Destination Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const d =
                  orderData.shipping_detail?.payload?.consignments?.[0]
                    ?.destination_details;
                return (
                  <>
                    <p>
                      <strong>Name:</strong> {d?.name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {d?.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {d?.email}
                    </p>
                    <p>
                      <strong>Address:</strong> {d?.address_line_1},{" "}
                      {d?.address_line_2}
                    </p>
                    <p>
                      <strong>City:</strong> {d?.city}
                    </p>
                    <p>
                      <strong>State:</strong> {d?.state}
                    </p>
                    <p>
                      <strong>Pincode:</strong> {d?.pincode}
                    </p>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Customer + Shipping Info (Merged Layout) */}
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>Customer & Shipping Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Customer Info (Table Layout + Centered Image) */}
              <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-800 flex flex-col items-center">
                {/* Customer Image */}
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex justify-center overflow-hidden">
                  {orderData.users?.avatar ? (
                    <img
                      src={orderData.users.avatar}
                      alt={orderData.users.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-sm">No Image</span>
                  )}
                </div>

                {/* Customer Details in Table */}
                <table className="min-w-full text-sm mt-3">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {orderData.users &&
                    Object.keys(orderData.users).length > 0 ? (
                      <>
                        <tr>
                          <td className="font-semibold pr-4 py-2">Name</td>
                          <td className="py-2">
                            {orderData.users?.name || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold pr-4 py-2">Email</td>
                          <td className="py-2">
                            {orderData.users?.email || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold pr-4 py-2">Phone</td>
                          <td className="py-2">
                            {orderData.users?.phone || "N/A"}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="font-semibold pr-4 py-2">Name</td>
                          <td className="py-2">
                            {orderData.guest_name || "Guest"}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold pr-4 py-2">Email</td>
                          <td className="py-2">
                            {orderData.guest_email || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-semibold pr-4 py-2">Phone</td>
                          <td className="py-2">
                            {orderData.guest_phone || "N/A"}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Right: Shipping Address (Table Layout) */}
              <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
                {orderData.users && Object.keys(orderData.users).length > 0 ? (
                  <table className="min-w-full text-sm">
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="font-semibold pr-4 py-2">Name</td>
                        <td className="py-2">{orderData.user_address.name}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Email</td>
                        <td className="py-2">{orderData.user_address.email}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Phone</td>
                        <td className="py-2">
                          {orderData.user_address.phone_number}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Address</td>
                        <td className="py-2">
                          {orderData.user_address.street},{" "}
                          {orderData.user_address.apartment_suite}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">City</td>
                        <td className="py-2">
                          {orderData.user_address.city?.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">State</td>
                        <td className="py-2">
                          {orderData.user_address.state?.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Country</td>
                        <td className="py-2">
                          {orderData.user_address.country?.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">Zip Code</td>
                        <td className="py-2">
                          {orderData.user_address.zipcode}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">
                          Address Type
                        </td>
                        <td className="py-2">
                          {orderData.user_address.address_type}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : orderData.guest_shipping_address ||
                  orderData.guest_billing_address ? (
                  <table className="min-w-full text-sm">
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="font-semibold pr-4 py-2">
                          Shipping Address
                        </td>
                        <td className="py-2">
                          {orderData.guest_shipping_address || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold pr-4 py-2">
                          Billing Address
                        </td>
                        <td className="py-2">
                          {orderData.guest_billing_address || "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No shipping address provided</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mt-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>

            <div className="text-lg font-semibold">
              Total Amount:
              <span className="ml-2 text-[#FF0009]">
                ₹{orderData.total_amount}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {Object.values(groupedItems).map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Bundle Header */}
                {group.type === "bundle" && (
                  <div className="mb-4 rounded-lg bg-blue-50 p-4 border border-blue-200">
                    <h3 className="font-semibold text-red-700 text-lg">
                      📦 Bundle: {group.bundle.name}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-6 text-sm">
                      <p>
                        <span className="font-semibold">Original Price:</span> ₹
                        {group.bundle.original_price}
                      </p>

                      <p>
                        <span className="font-semibold">Offer Price:</span>{" "}
                        <span className="font-bold">
                          {" "}
                          ₹{group.bundle.offer_price}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Individual Header */}
                {group.type === "single" && (
                  <div className="mb-4 rounded-lg bg-green-50 p-4 border border-green-200">
                    <h3 className="font-semibold text-green-700 text-lg">
                      🛒 Individual Products
                    </h3>
                  </div>
                )}

                {/* Individual Products => 2 Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {group.items.map((item) => (
                    <Card key={item.id} className="p-3 shadow-sm">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.products?.default_image}
                            alt={item.products?.name}
                            className="w-32 h-full rounded-lg object-contain"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-2">
                          <h3 className="text-lg font-semibold">
                            {item.products?.name}
                          </h3>

                          <p className="text-sm text-gray-500">
                            SKU: {item.products?.sku}
                          </p>

                          <div className="flex flex-wrap gap-3">
                            {/* Color */}
                            {item.colors && (
                              <div className="flex items-center gap-2 rounded-md border border-gray-300 px-2 py-1">
                                <span className="font-medium">Color:</span>

                                <div
                                  className="w-5 h-5 rounded-full border border-gray-400"
                                  style={{
                                    background: item.colors.hexa_code_2
                                      ? `linear-gradient(135deg, ${item.colors.hexa_code} 50%, ${item.colors.hexa_code_2} 50%)`
                                      : item.colors.hexa_code,
                                  }}
                                />

                                <span>{item.colors.name}</span>
                              </div>
                            )}

                            {/* Size */}
                            <div className="flex items-center gap-2 rounded-md border border-gray-300 px-2 py-1">
                              <span className="font-medium">Size:</span>
                              <span>{item.sizes?.name || "-"}</span>
                            </div>
                          </div>

                          {/* Only for Individual Products */}
                          {group.type === "single" && (
                            <>
                              {/* Quantity */}
                              <p>
                                <span className="font-medium">Qty:</span>{" "}
                                {item.quantity}
                              </p>
                              <p>
                                <span className="font-medium">Price:</span> ₹
                                {item.price}
                              </p>

                              <p>
                                <span className="font-medium">Subtotal:</span> ₹
                                {item.sub_total}
                              </p>
                            </>
                          )}

                          {/* Status */}
                          <span className="inline-flex rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                            {orderData.order_status}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Return Items */}
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>Return Requests</CardTitle>
          </CardHeader>

          <CardContent>
            {showReturn?.length > 0 ? (
              <div className="space-y-5">
                {showReturn.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                  >
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {/* Product */}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Product
                        </dt>

                        <dd className="mt-1">
                          <p className="font-semibold text-gray-900">
                            {item.product_name}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            {item.color_name && (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                <span className="font-semibold">Color:</span>{" "}
                                {item.color_name}
                              </span>
                            )}

                            {item.size_name && (
                              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                <span className="font-semibold">Size:</span>{" "}
                                {item.size_name}
                              </span>
                            )}

                            <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                              <span className="font-semibold">Qty:</span>{" "}
                              {item.quantity}
                            </span>
                          </div>
                        </dd>
                      </div>

                      {/* Request Type */}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Request Type
                        </dt>

                        <dd className="mt-1">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-lg capitalize font-semibold ${
                              item.request_type?.toLowerCase() === "return"
                                ? "bg-red-100 text-red-700"
                                : item.request_type?.toLowerCase() ===
                                    "exchange"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.request_type?.toLowerCase() === "return" ? (
                              <RotateCcw className="h-5 w-5" />
                            ) : item.request_type?.toLowerCase() ===
                              "exchange" ? (
                              <RefreshCw className="h-5 w-5" />
                            ) : (
                              <HelpCircle className="h-5 w-5" />
                            )}

                            {item.request_type || "-"}
                          </span>
                        </dd>
                      </div>

                      {/* Customer Note */}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Customer Note
                        </dt>
                        <dd className="mt-1 text-gray-900">
                          {item.customer_note || "-"}
                        </dd>
                      </div>

                      {/* Return Details */}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Return Reason
                        </dt>
                        <dd className="mt-1 text-gray-900">
                          {item.return_reason}
                        </dd>

                        {/* Refund Status */}
                        <dt className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                          Refund Status
                        </dt>

                        <dd className="mt-1">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              item.refund_status?.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.refund_status?.toLowerCase() ===
                                      "processed" ||
                                    item.refund_status?.toLowerCase() ===
                                      "completed"
                                  ? "bg-green-100 text-green-700"
                                  : item.refund_status?.toLowerCase() ===
                                      "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.refund_status_label ||
                              item.refund_status ||
                              "-"}
                          </span>
                        </dd>
                      </div>

                      {/* Admin Remark */}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Admin Remark
                        </dt>
                        <dd className="mt-1 text-gray-900">
                          {item.admin_remark || "-"}
                        </dd>
                      </div>

                      {/* Status */}
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Status
                        </dt>
                        <dd className="mt-1">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              item.status.toLowerCase() === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : item.status.toLowerCase() === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : item.status.toLowerCase() === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </dd>
                      </div>
                    </dl>

                    {/* Action */}
                    {!["cancelled"].includes(order.order_status) && (
                      <div className="mt-5 flex justify-end border-t pt-4">
                        <button
                          onClick={() => {
                            setStatusData({
                              id: item.id,
                              status: item.status || "",
                              admin_remark: item.admin_remark || "",
                            });
                            setSelectedReturn(true);
                          }}
                          className="flex items-center gap-2 rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-200"
                        >
                          <RotateCcw size={16} />
                          Update Return
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                No return requests found.
              </div>
            )}
          </CardContent>
        </Card>

        {selectedReturn && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center p-2 border-b">
                <h2 className="text-xl font-bold">Return / Exchange</h2>
                <button onClick={() => setSelectedReturn(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={statusData.status}
                      onChange={(e) =>
                        setStatusData((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select Status</option>

                      <option value="return_approved">Return Approved</option>

                      <option value="return_rejected">Return Rejected</option>
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Admin Remark <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      rows={4}
                      value={statusData.admin_remark}
                      onChange={(e) =>
                        setStatusData({
                          ...statusData,
                          admin_remark: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Enter admin remark"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-3 border-t">
                <button
                  onClick={() => setSelectedReturn(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={handleUpdateReturnStatus}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
