"use client";
import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import AddFlatModal from "@/components/AddFlatModal";
import axios from "axios";

export default function FlatsManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flatsDetails, setFlatsDetails] = useState([]);
  const [vacantFlats, setVacantFlats] = useState([]);
  const [modalMode, setModalMode] = useState("add");
  const [selectedFlat, setSelectedFlat] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPageFlats, setCurrentPageFlats] = useState(1);
  const [currentPageVacant, setCurrentPageVacant] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchFlats = async () => {
    try {
      const [resDetails, resVacant] = await Promise.all([
        axios(`${process.env.NEXT_PUBLIC_BASE_URL}/users/get-details`, {
          headers:  {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }),
        axios(`${process.env.NEXT_PUBLIC_BASE_URL}/users/get-vflats`, {
          headers:  {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        })
      ]);
      setFlatsDetails(resDetails.data.data);
      setVacantFlats(resVacant.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFlats();
  }, []);

  const handleAddClick = () => {
    setModalMode("add");
    setSelectedFlat("");
    setIsModalOpen(true);
  };

  const handleEditClick = (flatNumber) => {
    setModalMode("edit");
    setSelectedFlat(flatNumber);
    setIsModalOpen(true);
  };

  // console.log(process.env.NEXT_PUBLIC_BASE_URL)

  const filteredFlatsDetails = flatsDetails
    .filter((flat) =>
      (flat.flat_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (flat.name && flat.name.toLowerCase().includes(searchQuery.toLowerCase()))) &&
      (filterType === "All Types" || flat.flat_type === filterType)
    )
    .sort((a, b) => {
      return sortOrder === "asc"
        ? a.flat_number.localeCompare(b.flat_number, undefined, { numeric: true })
        : b.flat_number.localeCompare(a.flat_number, undefined, { numeric: true });
    });

  const filteredVacantFlats = vacantFlats
    .filter((flat) =>
      flat.flat_number.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterType === "All Types" || flat.flat_type === filterType)
    )
    .sort((a, b) => {
      return sortOrder === "asc"
        ? a.flat_number.localeCompare(b.flat_number, undefined, { numeric: true })
        : b.flat_number.localeCompare(a.flat_number, undefined, { numeric: true });
    });

  // Pagination logic
  const indexOfLastFlat = currentPageFlats * ITEMS_PER_PAGE;
  const indexOfFirstFlat = indexOfLastFlat - ITEMS_PER_PAGE;
  const currentFlats = filteredFlatsDetails.slice(indexOfFirstFlat, indexOfLastFlat);
  const totalPagesFlats = Math.ceil(filteredFlatsDetails.length / ITEMS_PER_PAGE);

  const indexOfLastVacant = currentPageVacant * ITEMS_PER_PAGE;
  const indexOfFirstVacant = indexOfLastVacant - ITEMS_PER_PAGE;
  const currentVacantFlats = filteredVacantFlats.slice(indexOfFirstVacant, indexOfLastVacant);
  const totalPagesVacant = Math.ceil(filteredVacantFlats.length / ITEMS_PER_PAGE);

  // Reset pagination when searching, filtering, or sorting
  useEffect(() => {
    setCurrentPageFlats(1);
    setCurrentPageVacant(1);
  }, [searchQuery, filterType, sortOrder]);

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Flats Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              View and manage all residential units in the society.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-[#5842F4] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-[1.02] transition-all self-start"
          >
            <Plus size={18} strokeWidth={3} /> Add New Flat
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-[#5842F4]" />
            <input
              type="text"
              placeholder="Search by flat number or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:max-w-md bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-50 focus:border-[#5842F4] text-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
              className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 flex items-center gap-2"
              title="Toggle Sort Order"
            >
              <ArrowUpDown size={20} />
            </button>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 px-4 py-2.5 outline-none focus:border-[#5842F4] transition-all cursor-pointer"
            >
              <option value="All Types">All Types</option>
              <option value="1BHK">1BHK</option>
              <option value="2BHK">2BHK</option>
              <option value="3BHK">3BHK</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] uppercase text-slate-400 font-extrabold border-b border-slate-100">
                  <th className="px-8 py-5">Flat Number</th>
                  <th className="px-8 py-5">Flat Details</th>
                  <th className="px-8 py-5">Owner Info</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs uppercase text-slate-400 font-extrabold border-b border-slate-100">
                {currentFlats.length > 0 ? (
                  currentFlats.map((flat) => {
                    return <tr key={flat.id}>
                      <td className="px-8 py-2">{flat.flat_number}</td>
                      <td className="px-8 py-2">{flat.flat_type}</td>
                      <td className="px-8 py-2">{flat.name}</td>
                      <td className="px-8 py-2">{flat.phone}</td>
                      <td className="px-8 py-2">{flat.role}</td>
                      <td onClick={() => handleEditClick(flat.flat_number)} className="px-8 py-2 text-right">
                        <button className="border border-slate-200 text-blue-400 px-4 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">Edit</button>
                      </td>
                    </tr>;
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-6 text-center text-slate-400 italic font-medium">No records found matching your search</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
            <p className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-900">{indexOfFirstFlat + 1}</span> to{" "}
              <span className="text-slate-900">{Math.min(indexOfLastFlat, filteredFlatsDetails.length)}</span> of{" "}
              <span className="text-slate-900">{filteredFlatsDetails.length}</span> flats
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPageFlats((prev) => Math.max(prev - 1, 1))}
                disabled={currentPageFlats === 1}
                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentPageFlats((prev) => Math.min(prev + 1, totalPagesFlats))}
                disabled={currentPageFlats === totalPagesFlats || totalPagesFlats === 0}
                className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
        {/* Vacant Flats Table */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Vacant Flats</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="text-[10px] uppercase text-slate-400 font-extrabold border-b border-slate-100">
                    <th className="px-8 py-5">Flat Number</th>
                    <th className="px-8 py-5">Flat Details</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs uppercase text-slate-400 font-extrabold border-b border-slate-100">
                  {currentVacantFlats.length > 0 ? (
                    currentVacantFlats.map((flat) => (
                      <tr key={flat.id}>
                        <td className="px-8 py-2">{flat.flat_number}</td>
                        <td className="px-8 py-2">{flat.flat_type}</td>
                        <td className="px-8 py-2 text-right">
                          <button onClick={() => handleEditClick(flat.flat_number)} className="border border-slate-200 text-blue-400 px-4 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">Register Owner</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-8 py-6 text-center text-slate-400 italic font-medium">No vacant flats matching your search</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
              <p className="text-sm text-slate-500 font-medium">
                Showing <span className="text-slate-900">{filteredVacantFlats.length === 0 ? 0 : indexOfFirstVacant + 1}</span> to{" "}
                <span className="text-slate-900">{Math.min(indexOfLastVacant, filteredVacantFlats.length)}</span> of{" "}
                <span className="text-slate-900">{filteredVacantFlats.length}</span> vacant flats
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPageVacant((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPageVacant === 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentPageVacant((prev) => Math.min(prev + 1, totalPagesVacant))}
                  disabled={currentPageVacant === totalPagesVacant || totalPagesVacant === 0}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The Modal Trigger */}
      <AddFlatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialFlatNo={selectedFlat}
        onSuccess={fetchFlats}
      />
    </>
  );
}
