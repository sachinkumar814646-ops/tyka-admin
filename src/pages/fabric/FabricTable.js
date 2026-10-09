// "use client";

// import { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../../components/ui/Card";
// import Button from "../../components/ui/Button";
// import { useNavigate } from "react-router-dom";
// import Input from "../../components/ui/Input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "../../components/ui/Table";
// import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
// import Swal from "sweetalert2";
// import axios from "axios";

// const FabricsPage = () => {
//   const navigate = useNavigate();
//   const [fabrics, setFabrics] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedFabrics, setSelectedFabrics] = useState([]);
//   const [page, setPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);
//   const token = localStorage.getItem("token");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [fabricData, setFabricData] = useState([]);

//   // Fetch fabrics from API (backend pagination & search)
//   const fetchFabrics = async () => {
//     try {
//       const res = await axios.get(
//         "https://tyka.premierhostings.com/beta/api/fabrics",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             perPage: itemsPerPage,
//             page,
//             search: searchTerm || undefined,
//           },
//         }
//       );

//       setFabrics(res.data.data || []);
//       setTotalPages(res.data.totalPages || 1); // Make sure backend returns total pages
//     } catch (error) {
//       console.error("Error fetching fabrics:", error.response || error);
//     }
//   };
//   useEffect(() => {
//     fetchFabrics();
//   }, [page, itemsPerPage, searchTerm]);

//   const startIndex = (page - 1) * entriesPerPage;
//   const endIndex = Math.min(startIndex + fabricData.length, totalItems);

//   // Delete single fabric
//   const deleteFabric = async (id) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: "This fabric will be permanently deleted.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await axios.delete(
//             `https://tyka.premierhostings.com/beta/api/fabrics/${id}`,
//             { headers: { Authorization: `Bearer ${token}` } }
//           );
//           Swal.fire("Deleted!", "The fabric has been deleted.", "success");
//           fetchFabrics();
//         } catch (error) {
//           console.error("Error deleting fabric:", error.response || error);
//           Swal.fire("Error", "Failed to delete the fabric.", "error");
//         }
//       }
//     });
//   };

//   // Bulk delete
//   const handleBulkDelete = () => {
//     if (selectedFabrics.length === 0) return;

//     Swal.fire({
//       title: "Are you sure?",
//       text: `You are about to delete ${selectedFabrics.length} fabrics.`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete them!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await Promise.all(
//             selectedFabrics.map((id) =>
//               axios.delete(
//                 `https://tyka.premierhostings.com/beta/api/fabrics/${id}`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//               )
//             )
//           );
//           Swal.fire(
//             "Deleted!",
//             "Selected fabrics have been deleted.",
//             "success"
//           );
//           setSelectedFabrics([]);
//           fetchFabrics();
//         } catch (error) {
//           console.error("Bulk delete error:", error.response || error);
//           Swal.fire("Error", "Failed to delete selected fabrics.", "error");
//         }
//       }
//     });
//   };

//   const areAllOnPageSelected =
//     fabrics.length > 0 &&
//     fabrics.every((fabric) => selectedFabrics.includes(fabric.id));

//   const handleSelectAllFabrics = (e) => {
//     const idsOnPage = fabrics.map((fabric) => fabric.id);
//     if (e.target.checked) {
//       setSelectedFabrics((prev) => [...new Set([...prev, ...idsOnPage])]);
//     } else {
//       setSelectedFabrics((prev) =>
//         prev.filter((id) => !idsOnPage.includes(id))
//       );
//     }
//   };

//   const handleSelectFabric = (id) => {
//     setSelectedFabrics((prev) =>
//       prev.includes(id)
//         ? prev.filter((fabricId) => fabricId !== id)
//         : [...prev, id]
//     );
//   };

//   return (
//     <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-4">
//       <h1 className="text-3xl font-bold mb-4 dark:text-white">Fabrics</h1>
//       <Card>
//         <CardHeader>
//           <div className="flex justify-between items-center">
//             <div>
//               <CardTitle>Fabrics</CardTitle>
//               <CardDescription>Manage your fabrics</CardDescription>
//             </div>
//             <div className="flex gap-2">
//               {selectedFabrics.length > 0 && (
//                 <Button
//                   className="bg-red-500 hover:bg-red-600 text-white"
//                   onClick={handleBulkDelete}
//                 >
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Bulk Delete ({selectedFabrics.length})
//                 </Button>
//               )}
//               <Button onClick={() => navigate("/add-fabric")}>
//                 <Plus className="mr-2 h-4 w-4" /> Add New
//               </Button>
//             </div>
//           </div>
//           <div className="flex justify-between items-center mt-4">
//             <div className="flex items-center gap-2">
//               <label>Show</label>
//               <select
//                 className="mb-2 border dark:bg-slate-600"
//                 value={itemsPerPage}
//                 onChange={(e) => {
//                   setItemsPerPage(Number(e.target.value));
//                   setPage(1);
//                 }}
//               >
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//                 <option value={50}>50</option>
//                 <option value={100}>100</option>
//               </select>
//               <label>entries</label>
//             </div>
//             <div className="flex items-center px-0 py-2">
//               <Input
//                 placeholder="Search..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setPage(1);
//                 }}
//                 className="border-none ml-2"
//               />
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>
//                     <input
//                       type="checkbox"
//                       checked={areAllOnPageSelected}
//                       onChange={handleSelectAllFabrics}
//                     />
//                   </TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Slug</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Created At</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {fabrics.length > 0 ? (
//                   fabrics.map((fabric) => (
//                     <TableRow key={fabric.id}>
//                       <TableCell>
//                         <input
//                           type="checkbox"
//                           checked={selectedFabrics.includes(fabric.id)}
//                           onChange={() => handleSelectFabric(fabric.id)}
//                         />
//                       </TableCell>
//                       <TableCell>{fabric.name}</TableCell>
//                       <TableCell>{fabric.slug}</TableCell>
//                       <TableCell>
//                         {fabric.status === true || fabric.status === 1 ? (
//                           <span className="text-green-500 font-semibold">
//                             Active
//                           </span>
//                         ) : (
//                           <span className="text-red-500 font-semibold">
//                             Inactive
//                           </span>
//                         )}
//                       </TableCell>
//                       <TableCell>
//                         {fabric.created_at
//                           ? new Date(fabric.created_at).toLocaleString()
//                           : "N/A"}
//                       </TableCell>
//                       <TableCell>
//                         <button
//                           onClick={() => navigate(`/edit-fabric/${fabric.id}`)}
//                           className="text-blue-500 mr-3"
//                         >
//                           <Pencil size={18} />
//                         </button>
//                         <Button
//                           className="bg-red-500 hover:bg-red-600 text-white"
//                           onClick={() => deleteFabric(fabric.id)}
//                         >
//                           <Trash2 className="h-4 w-4 mr-1" /> Delete
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center">
//                       No fabrics found
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//           <div className="flex justify-between items-center mt-4 flex-wrap gap-2 dark:text-white">
//             {/* Entries Count */}
//             <div>
//               Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
//               {totalItems} entries
//             </div>

//             {/* Pagination Buttons */}
//             <div className="flex items-center gap-2 flex-wrap">
//               {/* Previous Button */}
//               <Button
//                 disabled={page === 1}
//                 onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                 className="bg-red-500 text-white disabled:opacity-50"
//               >
//                 <ChevronLeft className="h-4 w-4 mr-1" /> Previous
//               </Button>

//               {/* First Page */}
//               <button
//                 className={`px-3 py-1 border rounded ${
//                   page === 1
//                     ? "bg-red-600 text-white"
//                     : "bg-transparent dark:text-white"
//                 }`}
//                 onClick={() => setPage(1)}
//               >
//                 1
//               </button>

//               {/* Left Dots */}
//               {page > 3 && <span className="px-2 flex items-center">...</span>}

//               {/* Dynamic Middle Pages */}
//               {Array.from({ length: 3 }, (_, i) => {
//                 const pageNumber = page - 1 + i;
//                 if (pageNumber > 1 && pageNumber < totalPages) {
//                   return (
//                     <button
//                       key={pageNumber}
//                       onClick={() => setPage(pageNumber)}
//                       className={`px-3 py-1 border rounded ${
//                         page === pageNumber
//                           ? "bg-red-600 text-white"
//                           : "bg-transparent dark:text-white"
//                       }`}
//                     >
//                       {pageNumber}
//                     </button>
//                   );
//                 }
//                 return null;
//               })}

//               {/* Right Dots */}
//               {page < totalPages - 2 && (
//                 <span className="px-2 flex items-center">...</span>
//               )}

//               {/* Last Page */}
//               {totalPages > 1 && (
//                 <button
//                   className={`px-3 py-1 border rounded ${
//                     page === totalPages
//                       ? "bg-red-600 text-white"
//                       : "bg-transparent dark:text-white"
//                   }`}
//                   onClick={() => setPage(totalPages)}
//                 >
//                   {totalPages}
//                 </button>
//               )}

//               {/* Next Button */}
//               <Button
//                 disabled={page === totalPages}
//                 onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//                 className="bg-red-500 text-white disabled:opacity-50"
//               >
//                 Next <ChevronRight className="h-4 w-4 ml-1" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default FabricsPage;

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
import { useNavigate, useSearchParams } from "react-router-dom"; // ✅ useSearchParams use
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

const FabricsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [fabrics, setFabrics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFabrics, setSelectedFabrics] = useState([]);

  // ✅ page URL param se lo
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(initialPage);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  const token = localStorage.getItem("token");

  // ✅ Jab bhi page change ho → URL update karo
  useEffect(() => {
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    if (page !== currentPage) {
      searchParams.set("page", page);
      setSearchParams(searchParams, { replace: true });
    }
  }, [page, searchParams, setSearchParams]);

  // ✅ Jab bhi searchTerm change ho to page reset karo aur URL update ho
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setPage(1);
      searchParams.set("page", "1");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchTerm]);

  // Fetch fabrics from API
  const fetchFabrics = async () => {
    try {
      const res = await axios.get(
        "https://tyka.premierhostings.com/beta/api/fabrics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            perPage: itemsPerPage,
            page,
            search: searchTerm || undefined,
          },
        }
      );

      const data = res.data.data || [];
      const meta = res.data.meta || {};

      setFabrics(data);
      setTotalPages(meta.last_page || 1);
      setTotalItems(meta.total || 0);
      setStartIndex(meta.from ? meta.from - 1 : 0); // meta.from is 1-based
      setEndIndex(meta.to || 0);
    } catch (error) {
      console.error("Error fetching fabrics:", error.response || error);
    }
  };

  useEffect(() => {
    fetchFabrics();
  }, [page, itemsPerPage, searchTerm]);

  // Delete single fabric
  const deleteFabric = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This fabric will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://tyka.premierhostings.com/beta/api/fabrics/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire("Deleted!", "The fabric has been deleted.", "success");
          fetchFabrics();
        } catch (error) {
          console.error("Error deleting fabric:", error.response || error);
          Swal.fire("Error", "Failed to delete the fabric.", "error");
        }
      }
    });
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedFabrics.length === 0) return;

    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${selectedFabrics.length} fabrics.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete them!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Promise.all(
            selectedFabrics.map((id) =>
              axios.delete(
                `https://tyka.premierhostings.com/beta/api/fabrics/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
            )
          );
          Swal.fire(
            "Deleted!",
            "Selected fabrics have been deleted.",
            "success"
          );
          setSelectedFabrics([]);
          fetchFabrics();
        } catch (error) {
          console.error("Bulk delete error:", error.response || error);
          Swal.fire("Error", "Failed to delete selected fabrics.", "error");
        }
      }
    });
  };

  const areAllOnPageSelected =
    fabrics.length > 0 &&
    fabrics.every((fabric) => selectedFabrics.includes(fabric.id));

  const handleSelectAllFabrics = (e) => {
    const idsOnPage = fabrics.map((fabric) => fabric.id);
    if (e.target.checked) {
      setSelectedFabrics((prev) => [...new Set([...prev, ...idsOnPage])]);
    } else {
      setSelectedFabrics((prev) =>
        prev.filter((id) => !idsOnPage.includes(id))
      );
    }
  };

  const handleSelectFabric = (id) => {
    setSelectedFabrics((prev) =>
      prev.includes(id)
        ? prev.filter((fabricId) => fabricId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 py-4">
      <h1 className="text-3xl font-bold mb-4 dark:text-white">Fabrics</h1>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Fabrics</CardTitle>
              <CardDescription>Manage your fabrics</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedFabrics.length > 0 && (
                <PermissionGuard permission="bulk_delete_variants_fabric">
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Bulk Delete ({selectedFabrics.length})
                  </Button>
                </PermissionGuard>
              )}
              <PermissionGuard permission="create_variants_seasons">
                <Button onClick={() => navigate("/add-fabric")}>
                  <Plus className="mr-2 h-4 w-4" /> Add New
                </Button>
              </PermissionGuard>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <label>Show</label>
              <select
                className="mb-2 border dark:bg-slate-600"
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                      onChange={handleSelectAllFabrics}
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
                {fabrics.length > 0 ? (
                  fabrics.map((fabric) => (
                    <TableRow key={fabric.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedFabrics.includes(fabric.id)}
                          onChange={() => handleSelectFabric(fabric.id)}
                        />
                      </TableCell>
                      <TableCell>{fabric.name}</TableCell>
                      <TableCell>{fabric.slug}</TableCell>
                      <TableCell>
                        {fabric.status === true || fabric.status === 1 ? (
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
                        {fabric.created_at
                          ? new Date(fabric.created_at).toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <PermissionGuard permission="edit_variants_fabric">
                          <button
                            onClick={() =>
                              navigate(
                                `/edit-fabric/${fabric.id}?page=${page}&per_page=${itemsPerPage}`
                              )
                            }
                            className="text-blue-500 mr-3"
                          >
                            <Pencil size={18} />
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="delete_variants_seasons">
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => deleteFabric(fabric.id)}
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
                      No fabrics found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 flex-wrap gap-2 dark:text-white">
            <div>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of{" "}
              {totalItems} entries
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Previous Button */}
              <Button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="bg-red-500 text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              {/* First Page */}
              <button
                className={`px-3 py-1 border rounded ${page === 1
                    ? "bg-red-600 text-white"
                    : "bg-transparent dark:text-white"
                  }`}
                onClick={() => setPage(1)}
              >
                1
              </button>

              {/* Left Dots */}
              {page > 3 && <span className="px-2 flex items-center">...</span>}

              {/* Dynamic Middle Pages */}
              {Array.from({ length: 3 }, (_, i) => {
                const pageNumber = page - 1 + i;
                if (pageNumber > 1 && pageNumber < totalPages) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`px-3 py-1 border rounded ${page === pageNumber
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
              {page < totalPages - 2 && (
                <span className="px-2 flex items-center">...</span>
              )}

              {/* Last Page */}
              {totalPages > 1 && (
                <button
                  className={`px-3 py-1 border rounded ${page === totalPages
                      ? "bg-red-600 text-white"
                      : "bg-transparent dark:text-white"
                    }`}
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
                </button>
              )}

              {/* Next Button */}
              <Button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="bg-red-500 text-white disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FabricsPage;
