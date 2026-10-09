"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import {
  Star,
  Eye,
  MessageSquare,
  User,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/Dialog";

import StatsCard from "../../components/common/Card";

import Swal from "sweetalert2";
import PermissionGuard from "../../components/auth/PermissionGuard";

const getProductImage = (image) => {
  if (!image) return "/placeholder.png";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `https://tyka.premierhostings.com/beta/storage/${image}`;
};
const ReviewsPage = () => {
  /* =========================================================
     URL SEARCH PARAMS
  ========================================================= */

  const [searchParams, setSearchParams] = useSearchParams();

  const getPageFromUrl = () => {
    const urlPage = Number(searchParams.get("page"));

    return Number.isInteger(urlPage) && urlPage > 0 ? urlPage : 1;
  };

  /* =========================================================
     STATES
  ========================================================= */

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedReview, setSelectedReview] = useState(null);

  const [showViewDialog, setShowViewDialog] = useState(false);

  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);

  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const [page, setPage] = useState(getPageFromUrl);

  const [meta, setMeta] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [selectedReviews, setSelectedReviews] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  const token = localStorage.getItem("token");

  /* =========================================================
     UPDATE URL WHEN PAGE CHANGES
  ========================================================= */

  useEffect(() => {
    const currentUrlPage = getPageFromUrl();

    if (currentUrlPage !== page) {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);

          if (page === 1) {
            params.delete("page");
          } else {
            params.set("page", String(page));
          }

          return params;
        },
        { replace: true },
      );
    }
  }, [page, setSearchParams]);

  /* =========================================================
     FETCH REVIEWS
  ========================================================= */

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);

      const currentPage = page;
      const usersPerPage = entriesPerPage;

      const query = `page=${currentPage}&perPage=${usersPerPage}&search=${encodeURIComponent(
        searchTerm.trim(),
      )}&sort=${encodeURIComponent(sortOrder)}`;

      console.log(
        "Reviews API:",
        `https://tyka.premierhostings.com/beta/api/product-reviews?${query}`,
      );

      const res = await axios.get(
        `https://tyka.premierhostings.com/beta/api/product-reviews?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (res.data.success) {
        const mappedReviews = (res.data.data || []).map((item) => {
          const product = item.product?.[0] || null;

          return {
            id: item.id,
            product_id: item.product_id,

            product_details: product,
            product_name: product?.name || `Product #${item.product_id}`,
            product_slug: product?.slug || "",
            product_image: product?.default_image || "",

            rating_value: item.rating_value,
            rating_title: item.rating_title || "No Title",
            rating_desc: item.rating_desc || "No Comment Provided",

            product: product?.name || `Product #${item.product_id}`,

            customer: item.user?.name || "Guest",
            email: item.user?.email || "N/A",

            rating: parseInt(item.rating_value, 10) || 0,
            title: item.rating_title || "No Title",
            comment: item.rating_desc || "No Comment Provided",

            date: item.created_at,

            status: item.is_active === true || item.is_active === 1 ? 1 : 0,
          };
        });

        setReviews(mappedReviews);
        setMeta(res.data.meta || null);

        const lastPage = res.data.meta?.last_page || 1;

        if (page > lastPage) {
          setPage(lastPage);
        }
      } else {
        setReviews([]);
        setMeta(null);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);

      setReviews([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, entriesPerPage, searchTerm, sortOrder, token]);

  /* =========================================================
     FETCH ON PAGE / SEARCH / ENTRIES CHANGE
  ========================================================= */

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  /* =========================================================
     STATUS TOGGLE
  ========================================================= */

  const handleStatusToggle = async (reviewId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;

      const review = reviews.find((r) => r.id === reviewId);

      if (!review) return;

      const payload = {
        product_id: review.product_id,

        rating_value: review.rating_value,

        rating_title: review.rating_title || "",

        rating_desc: review.rating_desc || "",

        status: newStatus,
      };

      await axios.patch(
        `https://tyka.premierhostings.com/beta/api/product-reviews/${reviewId}/status`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                status: newStatus,
              }
            : r,
        ),
      );

      Swal.fire(
        "Updated!",
        `Review has been ${newStatus === 1 ? "activated" : "deactivated"}`,
        "success",
      );
    } catch (error) {
      console.error("Failed to update review status:", error);

      Swal.fire("Error!", "Failed to update review status", "error");
    }
  };

  /* =========================================================
     VIEW REVIEW
  ========================================================= */

  const handleView = (review) => {
    setSelectedReview(review);

    setShowViewDialog(true);
  };

  /* =========================================================
     STATUS BADGE
  ========================================================= */

  const getStatusBadge = (status) => {
    const isActive = status === true || status === 1;

    return isActive ? (
      <Badge variant="success">Active</Badge>
    ) : (
      <Badge variant="inactive">Inactive</Badge>
    );
  };

  /* =========================================================
     RENDER STARS
  ========================================================= */

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );

  /* =========================================================
     BULK DELETE
  ========================================================= */

  const handleBulkDelete = async () => {
    if (selectedReviews.length === 0) {
      Swal.fire("Warning!", "No reviews selected", "warning");

      return;
    }

    const confirmed = await Swal.fire({
      title: `Delete ${selectedReviews.length} review(s)?`,

      text: "This action cannot be undone",

      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Yes, delete",

      cancelButtonText: "Cancel",
    });

    if (!confirmed.isConfirmed) return;

    try {
      await axios.post(
        "https://tyka.premierhostings.com/beta/api/product-review/bulk-delete",
        {
          ids: selectedReviews,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Swal.fire("Deleted!", "Selected reviews have been deleted", "success");

      setSelectedReviews([]);

      fetchReviews();
    } catch (error) {
      console.error("Bulk delete error:", error);

      Swal.fire("Error!", "Failed to delete selected reviews", "error");
    }
  };

  /* =========================================================
     SELECT SINGLE REVIEW
  ========================================================= */

  const toggleSelectReview = (id) => {
    setSelectedReviews((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  /* =========================================================
     SELECT ALL
  ========================================================= */

  const toggleSelectAll = () => {
    if (reviews.length > 0 && selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map((r) => r.id));
    }
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const renderPagination = () => {
    if (!meta) return null;

    const totalPages = meta.last_page || 1;

    if (totalPages <= 1) return null;

    const pageNumbers = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (page <= 3) {
        pageNumbers.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pageNumbers.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, "...", page, "...", totalPages);
      }
    }

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {/* Previous */}
        <Button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          size="sm"
          variant="outline"
          className="px-3 py-1 bg-white text-black hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {/* Page Numbers */}
        {pageNumbers.map((num, idx) => {
          if (num === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 text-gray-500">
                ...
              </span>
            );
          }

          return (
            <Button
              key={num}
              onClick={() => setPage(num)}
              size="sm"
              variant="outline"
              className={
                page === num
                  ? "border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white"
                  : "border-gray-300 bg-white text-black hover:bg-gray-100"
              }
            >
              {num}
            </Button>
          );
        })}

        {/* Next */}
        <Button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          size="sm"
          variant="outline"
          className="px-3 py-1 bg-white text-black hover:bg-gray-100 disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  /* =========================================================
     RETURN
  ========================================================= */

  const deleteReview = (review) => {
    const id = review.id;
    Swal.fire({
      title: "Are you sure?",
      text: "This review will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (res) => {
      if (!res.isConfirmed) return;

      try {
        const response = await fetch(
          `https://tyka.premierhostings.com/beta/api/product-reviews/${id}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("Delete failed");
        }

        // Remove review from UI
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review.id !== id),
        );

        // Remove from selected IDs
        setSelectedIds((prevIds) =>
          prevIds.filter((reviewId) => reviewId !== id),
        );

        // ✅ Success Swal
        Swal.fire({
          title: "Deleted!",
          text: "Review deleted successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Delete review error:", error);

        // ❌ Failure Swal
        Swal.fire({
          title: "Failed!",
          text: "Failed to delete review.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });
  };

  // ✅ Bulk Review Delete
  const bulkDeleteReviews = () => {
    if (selectedIds.length === 0) return;

    Swal.fire({
      title: "Delete selected reviews?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete All",
      cancelButtonText: "Cancel",
    }).then(async (res) => {
      if (!res.isConfirmed) return;

      try {
        const response = await fetch(
          "https://tyka.premierhostings.com/beta/api/product-reviews/bulk-delete",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ids: selectedIds,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Bulk delete failed");
        }

        // Remove deleted reviews from UI
        setReviews((prevReviews) =>
          prevReviews.filter((review) => !selectedIds.includes(review.id)),
        );

        // Clear selected reviews
        setSelectedIds([]);

        // ✅ Success Swal
        Swal.fire({
          title: "Deleted!",
          text: "Selected reviews deleted successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Bulk delete reviews error:", error);

        // ❌ Failure Swal
        Swal.fire({
          title: "Failed!",
          text: "Failed to delete selected reviews.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">
          Review Management
        </h1>

        <p className="text-muted-foreground">
          Manage customer reviews and feedback
        </p>
      </div>

      {/* =====================================================
          STATS CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Reviews"
          value={meta?.total || 0}
          icon={<MessageSquare />}
        />

        <StatsCard
          title="Active Reviews"
          value={reviews.filter((r) => r.status === 1).length}
          icon={<ThumbsUp />}
        />

        <StatsCard
          title="Inactive Reviews"
          value={reviews.filter((r) => r.status === 0).length}
          icon={<User />}
        />

        <StatsCard
          title="Average Rating"
          value={
            reviews.length > 0
              ? (
                  reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
                ).toFixed(1)
              : "0.0"
          }
          icon={<Star />}
        />
      </div>

      {/* =====================================================
          REVIEWS CARD
      ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>

          <CardDescription>
            Manage and moderate customer reviews
          </CardDescription>
          {/* Delete */}
          <div className="flex items-center justify-end gap-2">
            <PermissionGuard permission="bulk_delete_review">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={selectedReviews.length === 0}
              >
                Delete Selected
              </Button>
            </PermissionGuard>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            {/* Entries */}
            <div>
              Show{" "}
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(parseInt(e.target.value, 10));
                  setPage(1);
                  setSelectedReviews([]);
                }}
                className="border p-1 rounded bg-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>{" "}
              entries
            </div>
            {/* Search */}
            <div className="flex ml-auto gap-2">
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                  setSelectedReviews([]);
                }}
                className="text-sm"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-6 text-muted-foreground">
              Loading reviews...
            </div>
          ) : (
            <>
              {/* =================================================
                  TABLE
              ================================================= */}

              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow className="!h-8">
                    <TableHead className="w-10 p-1">
                      <input
                        type="checkbox"
                        checked={
                          reviews.length > 0 &&
                          selectedReviews.length === reviews.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </TableHead>

                    <TableHead className="p-1">Product</TableHead>

                    <TableHead className="p-1">Customer</TableHead>

                    <TableHead className="p-1">Rating</TableHead>

                    <TableHead className="p-1">Review</TableHead>

                    <TableHead className="p-1">Status</TableHead>

                    <TableHead className="p-1">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <TableRow key={review.id} className="!h-8">
                        {/* Checkbox */}
                        <TableCell className="p-1">
                          <input
                            type="checkbox"
                            checked={selectedReviews.includes(review.id)}
                            onChange={() => toggleSelectReview(review.id)}
                          />
                        </TableCell>

                        {/* Product */}
                        <TableCell className="p-1">{review.product}</TableCell>

                        {/* Customer */}
                        <TableCell className="p-1">{review.customer}</TableCell>

                        {/* Rating */}
                        <TableCell className="p-1">
                          {renderStars(review.rating)}
                        </TableCell>

                        {/* Review */}
                        <TableCell className="max-w-xs p-1">
                          <div>
                            <div
                              className="font-medium text-sm truncate"
                              title={review.title}
                            >
                              {review.title}
                            </div>

                            <div
                              className="text-sm text-muted-foreground truncate"
                              title={review.comment}
                            >
                              {review.comment}
                            </div>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="p-1">
                          {getStatusBadge(review.status)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="p-1">
                          <div className="flex gap-1">
                            {/* View */}
                            <PermissionGuard permission="view_review">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleView(review)}
                                className="p-1 bg-white text-black hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>

                            {/* Activate / Deactivate */}
                            <PermissionGuard permission="block_review">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusToggle(review.id, review.status)
                                }
                                className={
                                  review.status === 1
                                    ? "p-1 text-red-600 border-red-600 bg-white hover:bg-red-50"
                                    : "p-1 text-green-600 border-green-600 bg-white hover:bg-green-50"
                                }
                              >
                                {review.status === 1
                                  ? "Deactivate"
                                  : "Activate"}
                              </Button>
                            </PermissionGuard>

                            {/* Delete */}
                            <PermissionGuard permission="view_review">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteReview(review)}
                                className="p-1 bg-white text-black hover:bg-gray-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-2">
                        No reviews found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* =================================================
                  PAGINATION
              ================================================= */}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {reviews.length === 0 ? 0 : meta?.from || 0} to{" "}
                  {meta?.to || reviews.length} of {meta?.total || 0} entries
                </div>

                {renderPagination()}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          VIEW DIALOG
      ===================================================== */}

      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-5 mt-2">
              {/* Product Details */}
              <div className="rounded-lg border bg-gray-50 p-2">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-full flex-shrink-0 rounded-lg  bg-white overflow-hidden">
                    <img
                      src={getProductImage(selectedReview.product_image)}
                      alt={selectedReview.product_name || "Product"}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Product</p>

                    <h3 className="font-semibold text-lg text-gray-900">
                      {selectedReview.product_name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 break-all">
                      <span className="font-medium">Slug:</span>{" "}
                      {selectedReview.product_slug || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer + Email */}
              <div className="border rounded-lg p-2">
                <p className="text-sm font-semibold text-gray-500 mb-3">
                  Customer
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Name : </p>
                    <p className="font-semibold text-gray-900">
                      {selectedReview.customer}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email : </p>
                    <p className="font-semibold text-gray-900 break-all">
                      {selectedReview.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Rating</p>

                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-6 h-6 ${
                          index < selectedReview.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="font-semibold text-gray-700">
                    {selectedReview.rating} / 5
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div className="rounded-lg ">
                <p className="text-xs text-gray-500 mb-1">Review Title</p>

                <p className="font-semibold text-gray-900">
                  {selectedReview.title}
                </p>
              </div>

              {/* Comment */}
              <div className="rounded-lg ">
                <p className="text-xs text-gray-500 mb-2">Comment</p>

                <p className="text-gray-700 leading-relaxed break-words">
                  {selectedReview.comment}
                </p>
              </div>

              {/* Date + Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg ">
                  <p className="text-xs text-gray-500 mb-1">Date</p>

                  <p className="font-medium text-gray-900">
                    {selectedReview.date
                      ? new Date(selectedReview.date).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <div className="rounded-lg ">
                  <p className="text-xs text-gray-500 mb-1">Status</p>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedReview.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedReview.status === 1 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsPage;
