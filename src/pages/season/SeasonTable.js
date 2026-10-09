"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import PermissionGuard from "../../components/auth/PermissionGuard";

const SeasonsPage = () => {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem("token");

  // Fetch seasons from API with backend pagination & search
  const fetchSeasons = async () => {
    try {
      const res = await axios.get(
        `https://tyka.premierhostings.com/beta/api/seasons`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            perPage: itemsPerPage,
            page,
            search: searchTerm || undefined,
          },
        },
      );

      setSeasons(res.data.data || []);
      setTotalPages(res.data.totalPages || 1); // Make sure backend returns total pages
    } catch (error) {
      console.error("Error fetching seasons:", error.response || error);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, [page, itemsPerPage, searchTerm]);

  // Delete single season
  const deleteSeason = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This season will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://tyka.premierhostings.com/beta/api/seasons/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          Swal.fire("Deleted!", "The season has been deleted.", "success");
          fetchSeasons();
        } catch (error) {
          console.error("Error deleting season:", error.response || error);
          Swal.fire("Error", "Failed to delete the season.", "error");
        }
      }
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedSeasons.length === 0) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedSeasons.length} seasons.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Promise.all(
            selectedSeasons.map((id) =>
              axios.delete(
                `https://tyka.premierhostings.com/beta/api/seasons/${id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              ),
            ),
          );
          Swal.fire(
            "Deleted!",
            "Selected seasons have been deleted.",
            "success",
          );
          setSelectedSeasons([]);
          fetchSeasons();
        } catch (error) {
          console.error("Bulk delete error:", error.response || error);
          Swal.fire("Error", "Failed to delete selected seasons.", "error");
        }
      }
    });
  };

  const areAllOnPageSelected =
    seasons.length > 0 &&
    seasons.every((season) => selectedSeasons.includes(season.id));

  const handleSelectAllSeasons = (e) => {
    if (e.target.checked) {
      const idsOnPage = seasons.map((season) => season.id);
      setSelectedSeasons((prev) => [...new Set([...prev, ...idsOnPage])]);
    } else {
      const idsOnPage = seasons.map((season) => season.id);
      setSelectedSeasons((prev) =>
        prev.filter((id) => !idsOnPage.includes(id)),
      );
    }
  };

  const handleSelectSeason = (id) => {
    setSelectedSeasons((prev) =>
      prev.includes(id)
        ? prev.filter((seasonId) => seasonId !== id)
        : [...prev, id],
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-4">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Seasons</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Seasons</CardTitle>
              <CardDescription>Manage your seasons</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedSeasons.length > 0 && (
                <PermissionGuard permission="bulk_delete_variants_seasons">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete ({selectedSeasons.length})
                  </Button>
                </PermissionGuard>
              )}
              <PermissionGuard permission="create_variants_seasons">
                <Button onClick={() => navigate("/add-seasons")}>
                  <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
              </PermissionGuard>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <label>Show</label>
              <select
                className="mb-2 dark:bg-slate-500 border"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label>entries</label>
            </div>
            <div className="flex items-center px-0 py-2">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="border-none ml-2"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={areAllOnPageSelected}
                      onChange={handleSelectAllSeasons}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasons.length > 0 ? (
                  seasons.map((season) => (
                    <TableRow key={season.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedSeasons.includes(season.id)}
                          onChange={() => handleSelectSeason(season.id)}
                        />
                      </TableCell>
                      <TableCell>{season.name}</TableCell>
                      <TableCell>{season.slug}</TableCell>
                      <TableCell>
                        {season.is_active === true || season.is_active === 1 ? (
                          <span className="text-green-500 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {season.created_at
                          ? new Date(season.created_at).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <PermissionGuard permission="edit_variants_seasons">
                          <button
                            onClick={() =>
                              navigate(`/edit-seasons/${season.id}`)
                            }
                            className="text-blue-500 mr-3"
                          >
                            <Pencil size={18} />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="delete_variants_seasons">
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => deleteSeason(season.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No seasons found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="bg-red-500 text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="bg-red-500 text-white"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonsPage;
