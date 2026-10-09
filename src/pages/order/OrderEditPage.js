"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
const OrderEditPage = () => {
  const { id } = useParams();
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

  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [removeItems, setRemoveItems] = useState([]); // Added state for tracking items to remove
  const [showCancelModal, setShowCancelModal] = useState(false); // Added state for cancellation modal and reason
  const [cancelReason, setCancelReason] = useState("");
  const [cancellingItemIndex, setCancellingItemIndex] = useState(null);
  const [showOrderCancelModal, setShowOrderCancelModal] = useState(false);
  const [orderCancelReason, setOrderCancelReason] = useState("");
  const [bundleGroups, setBundleGroups] = useState({});
  const [individualItems, setIndividualItems] = useState([]);

  const [formData, setFormData] = useState({
    // Editable address fields for the form
    shipping_name: "",
    shipping_phone: "",
    street: "",
    apartment_suite: "",
    zipcode: "",
    country: "",
    state: "",
    city: "",
    // Order-level details
    order_status: "",
    payment_status: "",
    // Order items
    order_details: [],
    order_cancel_reason: "", // Added state for order-level cancellation reason
  });

  // --- DATA FETCHING & PROCESSING ---
  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://tyka.premierhostings.com/beta/api/orders/${id}`,
        );
        const data = await res.json();

        if (data.success && data.data) {
          const orderData = data.data;
          const addressApiResponse = orderData.users?.user_address?.data;

          setOrder(orderData);

          // Prepare address list and set default
          let defaultAddress = null;
          if (addressApiResponse) {
            const addressList = Array.isArray(addressApiResponse)
              ? addressApiResponse
              : [addressApiResponse];
            setAddresses(addressList);

            if (addressList.length > 0) {
              // Find the address that matches the order's user_address_id
              defaultAddress =
                addressList.find(
                  (addr) => addr.id === orderData.user_address_id,
                ) || addressList[0];
              setSelectedAddressId(defaultAddress.id);
            }
          }

          const orderDetailsWithStock =
            orderData.order_details?.data?.map((item) => {
              const allVariants = item.products?.variants || [];
              const currentVariant = allVariants.find(
                (v) =>
                  v.color_id === item.color_id && v.size_id === item.size_id,
              );
              return {
                ...item,
                sub_total: item.price * item.quantity,
                stock: currentVariant ? currentVariant.stock : 0,
                // Store all variants for this item for the dropdowns
                available_variants: allVariants,
                // Store current image path to allow dynamic changes
                current_image: item.products?.default_image,
                status: item.status || "active",
                cancel_reason: item.cancel_reason || "",
              };
            }) || [];
          const bundleGroups = {};
          const individualItems = [];

          orderDetailsWithStock.forEach((item) => {
            if (item.bundle) {
              const bundleId = item.bundle.id;

              if (!bundleGroups[bundleId]) {
                bundleGroups[bundleId] = {
                  bundle: item.bundle,
                  items: [],
                };
              }

              bundleGroups[bundleId].items.push(item);
            } else {
              individualItems.push(item);
            }
          });

          // Populate the form state
          setFormData({
            shipping_name: defaultAddress?.name || "",
            shipping_phone: defaultAddress?.phone_number || "",
            street: defaultAddress?.street || "",
            apartment_suite: defaultAddress?.apartment_suite || "",
            zipcode: defaultAddress?.zipcode || "",
            country: defaultAddress?.country?.name || "",
            state: defaultAddress?.state?.name || "",
            city: defaultAddress?.city?.name || "",
            order_status: orderData.order_status || "",
            payment_status: orderData.payment_status || "",
            order_details: orderDetailsWithStock,
            order_cancel_reason: orderData.order_cancel_reason || "", // Added state for order-level cancellation reason
          });
          setBundleGroups(bundleGroups);
          setIndividualItems(individualItems);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // --- EVENT HANDLERS ---
  const handleAddressChange = (e) => {
    const newSelectedId = Number(e.target.value);
    setSelectedAddressId(newSelectedId);
    const selectedAddress = addresses.find(
      (address) => address.id === newSelectedId,
    );
    if (selectedAddress) {
      setFormData((prev) => ({
        ...prev,
        shipping_name: selectedAddress.name || "",
        shipping_phone: selectedAddress.phone_number || "",
        street: selectedAddress.street || "",
        apartment_suite: selectedAddress.apartment_suite || "",
        zipcode: selectedAddress.zipcode || "",
        country: selectedAddress.country?.name || "",
        state: selectedAddress.state?.name || "",
        city: selectedAddress.city?.name || "",
      }));
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrderStatusChange = (field, value) => {
    if (field === "order_status" && value === "cancelled") {
      setShowOrderCancelModal(true);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDetailChange = (index, field, value) => {
    const updatedDetails = [...formData.order_details];
    const currentItem = updatedDetails[index];
    currentItem[field] = value;

    // If color or size changes, update stock and image
    if (field === "color_id" || field === "size_id") {
      const newVariant = currentItem.available_variants.find(
        (v) =>
          v.color_id === currentItem.color_id &&
          v.size_id === currentItem.size_id,
      );
      if (newVariant) {
        currentItem.stock = newVariant.stock;
        if (currentItem.quantity > newVariant.stock) {
          currentItem.quantity = newVariant.stock;
        }
        const defaultImage = newVariant.variant_images.find(
          (img) => img.is_default,
        );
        if (defaultImage) {
          currentItem.current_image = defaultImage.path;
        }
      } else {
        currentItem.stock = 0; // Variant doesn't exist
        currentItem.quantity = 0;
      }
    }

    // Recalculate subtotal
    currentItem.sub_total = currentItem.price * currentItem.quantity;
    setFormData((prev) => ({ ...prev, order_details: updatedDetails }));
  };

  const handleStatusChange = (index, newStatus) => {
    if (newStatus === "cancelled") {
      setCancellingItemIndex(index);
      setShowCancelModal(true);
    } else {
      handleDetailChange(index, "status", newStatus);
      // Clear cancel reason if status is changed back to active
      handleDetailChange(index, "cancel_reason", "");
    }
  };

  const handleCancelConfirm = () => {
    if (cancelReason.trim() === "") {
      alert("Please provide a reason for cancellation");
      return;
    }

    handleDetailChange(cancellingItemIndex, "status", "cancelled");
    handleDetailChange(cancellingItemIndex, "cancel_reason", cancelReason);

    setShowCancelModal(false);
    setCancelReason("");
    setCancellingItemIndex(null);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelReason("");
    setCancellingItemIndex(null);
  };

  // const handleQuantityChange = (index, delta) => {
  //   const updatedDetails = [...formData.order_details];
  //   const currentItem = updatedDetails[index];
  //   const newQuantity = currentItem.quantity + delta;

  //   if (newQuantity >= 1 && newQuantity <= currentItem.stock) {
  //     handleDetailChange(index, "quantity", newQuantity);
  //   }
  // };

  const handleQuantityChange = (index, delta) => {
    const updatedDetails = [...formData.order_details];
    const currentItem = updatedDetails[index];
    const newQuantity = currentItem.quantity + delta;

    if (delta < 0) {
      // Decrease allowed as long as qty >= 1
      if (newQuantity >= 1) {
        handleDetailChange(index, "quantity", newQuantity);
      }
    } else {
      // Increase allowed only if stock available
      if (newQuantity <= currentItem.stock) {
        handleDetailChange(index, "quantity", newQuantity);
      }
    }
  };

  const handleRemoveItem = (itemId, index) => {
    // Add to remove items array
    setRemoveItems((prev) => [...prev, itemId]);

    // Remove from current order details display
    const updatedDetails = formData.order_details.filter(
      (_, idx) => idx !== index,
    );
    setFormData((prev) => ({ ...prev, order_details: updatedDetails }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare data according to backend validation rules
      const saveData = {
        user_address_id: selectedAddressId,
        order_status: formData.order_status,
        payment_status: formData.payment_status,
        order_cancel_reason: formData.order_cancel_reason || "",
        items: formData.order_details.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          size_id: item.size_id,
          color_id: item.color_id,
          quantity: item.quantity,
          price: item.price,
          tax: item.tax || 0,
          shipping_cost: item.shipping_cost || 0,
          status: item.status,
          cancel_reason: item.cancel_reason || "",
        })),
        remove_items: removeItems,
      };

      const response = await fetch(
        `https://tyka.premierhostings.com/beta/api/orders/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saveData),
        },
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: "Success!",
          text: "Order updated successfully!",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        }).then(() => {
          window.location.href = `/orders?page=${page}&per_page=${entriesPerPage}`; // Redirect after OK
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: result.message || "Unknown error",
          icon: "error",
          confirmButtonText: "OK",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error saving order:", error);
      Swal.fire({
        title: "Error!",
        text: "Error saving order. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handlers for order-level cancellation
  const handleOrderCancelConfirm = () => {
    if (orderCancelReason.trim() === "") {
      alert("Please provide a reason for order cancellation");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      order_status: "cancelled",
      order_cancel_reason: orderCancelReason,
    }));

    setShowOrderCancelModal(false);
    setOrderCancelReason("");
  };

  const handleOrderCancelModalClose = () => {
    setShowOrderCancelModal(false);
    setOrderCancelReason("");
  };

  // --- RENDER LOGIC ---
  if (loading) return <p className="p-4 text-center">Loading order...</p>;
  if (!order) return <p className="p-4 text-center">No order found.</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto bg-white dark:bg-black rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Edit Order #{order.order_code}
      </h1>

      {/* Customer & Order Details Display Block */}
      <div className="p-4 mb-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-semibold mb-3">Customer & Order Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-4 text-sm">
          <div>
            <p>
              <strong>Customer:</strong>{" "}
              {order?.users?.name || order?.guest_name}
            </p>
          </div>
          <div>
            <p>
              <strong>Email:</strong> {order?.users?.email || order.guest_email}
            </p>
          </div>
          <div>
            <p>
              <strong>Gender:</strong> {order?.users?.gender || "N/A"}
            </p>
          </div>
          <div>
            <p>
              <strong>Payment:</strong>{" "}
              <span className="uppercase">{order?.payment_type}</span>
            </p>
          </div>

          <div>
            <label className="block font-medium mb-1">Order Status:</label>
            <select
              value={formData.order_status}
              onChange={(e) =>
                handleOrderStatusChange("order_status", e.target.value)
              }
              className="p-2 border rounded w-full text-sm"
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="return_requested">Return Requested</option>
              <option value="return_approved">Return Approved</option>
              <option value="return_rejected">Return Rejected</option>
              <option value="item_returned">Item Returned</option>
              <option value="refund_initiated">Refund Initiated</option>
              <option value="refunded">Refunded</option>
              <option value="exchange_requested">Exchange Requested</option>
              <option value="exchange_approved">Exchange Approved</option>
              <option value="exchange_rejected">Exchange Rejected</option>
              <option value="exchange_completed">Exchange Completed</option>
            </select>
            {formData.order_status === "cancelled" &&
              formData.order_cancel_reason && (
                <p className="text-xs text-red-600 mt-1">
                  <strong>Cancellation Reason:</strong>{" "}
                  {formData.order_cancel_reason}
                </p>
              )}
          </div>

          <div>
            <label className="block font-medium mb-1">Payment Status:</label>
            <select
              value={formData.payment_status}
              onChange={(e) =>
                handleOrderStatusChange("payment_status", e.target.value)
              }
              className="p-2 border rounded w-full text-sm"
            >
              <option value="">Select Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="unpaid">UnPaid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {removeItems.length > 0 && (
        <div className="p-3 mb-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-800">
            <strong>Notice:</strong> {removeItems.length} item(s) marked for
            removal. These will be permanently removed when you save changes.
          </p>
        </div>
      )}

      {/* Address Selection */}
      {/* Address Selection */}
      <div className="p-4 mb-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        {/* <h2 className="text-lg font-semibold mb-2">Select Shipping Address</h2> */}

        {addresses.length > 0 ? (
          // Logged-in user addresses

          addresses.map((address) => (
            <div key={address.id} className="mb-2">
              <h2 className="text-lg font-semibold mb-2">
                Select Shipping Address
              </h2>
              <input
                type="radio"
                id={`address-${address.id}`}
                name="address"
                value={address.id}
                checked={selectedAddressId === address.id}
                onChange={handleAddressChange}
                className="mr-2"
              />
              <label htmlFor={`address-${address.id}`} className="text-sm">
                {address.name}, {address.street}, {address.city?.name} (
                {address.address_type})
              </label>
            </div>
          ))
        ) : (
          // Guest user fallback address
          <div className="mb-2">
            <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>

            {addresses.length > 0 ? (
              // Logged-in user addresses list
              addresses.map((address) => (
                <div key={address.id} className="mb-2 text-sm">
                  {address.name}, {address.street}, {address.city?.name} (
                  {address.address_type})
                </div>
              ))
            ) : (
              // Guest user (no input field, just text)
              <div className="mb-2 text-sm">
                {order?.guest_name} ({order?.guest_phone}) -{" "}
                {order?.guest_shipping_address ||
                  order?.guest_billing_address ||
                  "No Address"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Items Table */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Order Items</h2>
      <h2 className="text-xl font-bold mt-6">Individual Products</h2>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="border p-2">Product</th>
              <th className="border p-2">Color</th>
              <th className="border p-2">Size</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2 text-right">Subtotal</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {individualItems.map((item, idx) => {
              const uniqueColors = [
                ...new Map(
                  item.available_variants.map((v) => [
                    v.color_id,
                    { id: v.color_id, name: v.color_name },
                  ]),
                ).values(),
              ];
              const uniqueSizes = [
                ...new Map(
                  item.available_variants.map((v) => [
                    v.size_id,
                    { id: v.size_id, name: v.size_name },
                  ]),
                ).values(),
              ];
              return (
                <tr key={item.id}>
                  <td className="border p-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.current_image || "/placeholder.svg"}
                        alt={item.products?.name}
                        className="w-20 h-full object-contain rounded"
                      />
                      <div>
                        <p className="font-semibold mb-0">
                          {item.products?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          <span className="font-medium">SKU:</span>{" "}
                          {item.products?.sku || "N/A"}
                        </p>
                        {item.status === "cancelled" && item.cancel_reason && (
                          <p className="text-xs text-red-600 mt-1">
                            <strong>Reason:</strong> {item.cancel_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="border p-2">
                    <select
                      value={item.color_id || ""}
                      onChange={(e) =>
                        handleDetailChange(
                          idx,
                          "color_id",
                          Number(e.target.value),
                        )
                      }
                      className="p-1 border rounded w-full"
                    >
                      {uniqueColors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2">
                    <select
                      value={item.size_id || ""}
                      onChange={(e) =>
                        handleDetailChange(
                          idx,
                          "size_id",
                          Number(e.target.value),
                        )
                      }
                      className="p-1 border rounded w-full"
                    >
                      {uniqueSizes.map((size) => (
                        <option key={size.id} value={size.id}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2">
                    <select
                      value={item.status || "active"}
                      onChange={(e) => handleStatusChange(idx, e.target.value)}
                      className="p-1 border rounded w-full"
                    >
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="border p-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(idx, -1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1 border rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="font-bold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(idx, 1)}
                        disabled={item.quantity >= item.stock}
                        className={`px-3 py-1 border rounded ${
                          item.quantity >= item.stock
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 hover:bg-gray-300"
                        } disabled:opacity-50`}
                        title={
                          item.quantity >= item.stock
                            ? "No more stock available"
                            : "Add quantity"
                        }
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-1">
                      Stock: {item.stock}
                    </p>
                  </td>
                  <td className="border p-2 text-right">
                    ₹{(item.sub_total || 0).toFixed(2)}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleRemoveItem(item.id, idx)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <h2 className="text-xl font-bold mt-8 mb-4">Bundles</h2>

      {Object.values(bundleGroups).map((bundle) => (
        <div
          key={bundle.bundle.id}
          className="border rounded-lg shadow-sm p-4 mb-6 bg-white"
        >
          {/* Bundle Header */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <div>
              <h3 className="text-lg font-semibold">📦 {bundle.bundle.name}</h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Bundle Quantity */}
              <div className="flex items-center border rounded">
                <button
                  className="px-3 py-1 bg-gray-200"
                  onClick={() =>
                    handleQuantityChange(
                      formData.order_details.findIndex(
                        (i) => i.id === bundle.items[0].id,
                      ),
                      -1,
                    )
                  }
                >
                  -
                </button>

                <span className="px-4">{bundle.items[0].quantity}</span>

                <button
                  className="px-3 py-1 bg-gray-200"
                  onClick={() =>
                    handleQuantityChange(
                      formData.order_details.findIndex(
                        (i) => i.id === bundle.items[0].id,
                      ),
                      1,
                    )
                  }
                >
                  +
                </button>
              </div>

              {/* Remove Bundle */}
              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={() => {
                  bundle.items.forEach((item) => {
                    const index = formData.order_details.findIndex(
                      (i) => i.id === item.id,
                    );

                    handleRemoveItem(item.id, index);
                  });
                }}
              >
                Remove Bundle
              </button>
            </div>
          </div>

          {/* Bundle Products */}
          <div className="space-y-4">
            {bundle.items.map((item) => {
              const index = formData.order_details.findIndex(
                (i) => i.id === item.id,
              );

              const uniqueColors = [
                ...new Map(
                  item.available_variants.map((v) => [
                    v.color_id,
                    { id: v.color_id, name: v.color_name },
                  ]),
                ).values(),
              ];

              const uniqueSizes = [
                ...new Map(
                  item.available_variants.map((v) => [
                    v.size_id,
                    { id: v.size_id, name: v.size_name },
                  ]),
                ).values(),
              ];

              return (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 flex gap-4 items-center"
                >
                  {/* Image */}
                  <img
                    src={item.current_image}
                    alt={item.products?.name}
                    className="w-24 h-full rounded object-contain"
                  />

                  {/* Product Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">
                      {item.products?.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-3">
                      <span className="font-medium">SKU:</span>{" "}
                      {item.products?.sku || "N/A"}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Color */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>

                        <select
                          value={item.color_id}
                          onChange={(e) =>
                            handleDetailChange(
                              index,
                              "color_id",
                              Number(e.target.value),
                            )
                          }
                          className="border rounded p-2"
                        >
                          {uniqueColors.map((color) => (
                            <option key={color.id} value={color.id}>
                              {color.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Size */}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                          Size
                        </label>

                        <select
                          value={item.size_id}
                          onChange={(e) =>
                            handleDetailChange(
                              index,
                              "size_id",
                              Number(e.target.value),
                            )
                          }
                          className="border rounded p-2"
                        >
                          {uniqueSizes.map((size) => (
                            <option key={size.id} value={size.id}>
                              {size.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Order Cancellation Modal */}
      {showOrderCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Cancel Order
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You are about to cancel this entire order. Please provide a valid
              reason for cancellation:
            </p>
            <textarea
              value={orderCancelReason}
              onChange={(e) => setOrderCancelReason(e.target.value)}
              placeholder="Enter order cancellation reason..."
              className="w-full p-3 border rounded-lg resize-none h-24"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mb-4">
              {orderCancelReason.length}/500 characters
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleOrderCancelModalClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderCancelConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Confirm Order Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Item</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for cancelling this item:
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              className="w-full p-3 border rounded-lg resize-none h-24"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mb-4">
              {cancelReason.length}/500 characters
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelModalClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-6 text-right">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl shadow transition-colors duration-200 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default OrderEditPage;
