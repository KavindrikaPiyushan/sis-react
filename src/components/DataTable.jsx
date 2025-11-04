import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import LoadingComponent from "./LoadingComponent";

const DataTable = ({ 
  columns, 
  data, 
  actions, 
  title = "Data Table",
  searchPlaceholder = "Search...",
  showSearch = true,
  showFilter = true,
  itemsPerPage = 10,
  page,
  totalPages,
  // When using external pagination, pass the total number of items from API meta
  totalCount,
  onPageChange,
  // Optional: parent can receive search events (debounced) via onSearch(searchTerm)
  onSearch,
  // Optional: if parent wants to control the search input value
  searchValue,
  loading = false,
  
}) => {
  const [searchTerm, setSearchTerm] = useState(searchValue || "");
  // inputValue is the uncontrolled input value until user clicks Search or presses Enter
  const [inputValue, setInputValue] = useState(searchValue || "");
  const [internalPage, setInternalPage] = useState(1);

  useEffect(() => {
    // keep the input in sync if parent changes searchValue externally
    setInputValue(searchValue !== undefined ? searchValue : "");
    setSearchTerm(searchValue !== undefined ? searchValue : "");
  }, [searchValue]);

  // Use external pagination if provided, else fallback to internal
  const currentPage = typeof page === "number" ? page : internalPage;
  const isExternalPagination = typeof page === "number" && typeof totalPages === "number" && typeof onPageChange === "function";
  
  // For external pagination, use API's totalPages; for internal, calculate from filtered data
  const filteredData = isExternalPagination ? data : data.filter(item =>
    Object.values(item).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const effectiveTotalPages = isExternalPagination 
    ? totalPages 
    : Math.ceil(filteredData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = isExternalPagination ? data : filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(effectiveTotalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage < maxVisibleButtons - 1) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
            currentPage === i
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Table Header */}
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
            {!loading && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {isExternalPagination ? (typeof totalCount === 'number' ? totalCount : filteredData.length) : filteredData.length} total records
              </p>
            )}
          </div>
          
          {(showSearch || showFilter) && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue !== undefined ? inputValue : inputValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      setInputValue(v);
                      // Automatically trigger search when typing
                      if (onSearch) {
                        onSearch(v);
                      } else {
                        setSearchTerm(v);
                      }
                    }}
                    className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full sm:w-64 bg-white shadow-sm text-sm sm:text-base"
                  />
                </div>
              )}
              
              {showFilter && (
                <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-200 shadow-sm">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Filter</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
         {loading ? (
          <div className="py-4 sm:py-6 px-3 sm:px-4">
            <LoadingComponent message="Loading..." />
          </div>
        ) :(
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100">
                  <span className="hidden sm:inline">Actions</span>
                  <span className="sm:hidden">•••</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-all duration-200">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={`px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 ${column.className || ''}`}>
                      <div className="break-words max-w-[150px] sm:max-w-none">
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </div>
                    </td>
                  ))}
                  {actions && (
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-1">
                        {actions.onView && (
                          <button
                            onClick={() => actions.onView(item)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}
                        {actions.onEdit && (
                          <button
                            onClick={() => actions.onEdit(item)}
                            className="p-1.5 sm:p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:shadow-md"
                            title="Edit Record"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}
                        {actions.onDelete && (
                          <button
                            onClick={() => actions.onDelete(item)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" />
                    <p className="text-base sm:text-lg font-medium">No data found</p>
                    <p className="text-xs sm:text-sm">Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && effectiveTotalPages > 1 && (
        <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            {isExternalPagination ? (
              <>
                {(() => {
                  const total = typeof totalCount === 'number' ? totalCount : filteredData.length;
                  const start = total > 0 ? (page - 1) * itemsPerPage + 1 : 0;
                  const end = Math.min(page * itemsPerPage, total);
                  return (
                    <>
                      <span className="hidden sm:inline">
                        Showing <span className="font-medium">{start}</span> to <span className="font-medium">{end}</span> of <span className="font-medium">{total}</span> results
                      </span>
                      <span className="sm:hidden">
                        <span className="font-medium">{start}-{end}</span> of <span className="font-medium">{total}</span>
                      </span>
                    </>
                  );
                })()}
              </>
            ) : (
              <>
                <span className="hidden sm:inline">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of{' '}
                  <span className="font-medium">{filteredData.length}</span> results
                </span>
                <span className="sm:hidden">
                  <span className="font-medium">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of{' '}
                  <span className="font-medium">{filteredData.length}</span>
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            {/* Mobile: Show only current page info */}
            <div className="sm:hidden flex items-center gap-1">
              <span className="px-2 py-1.5 text-xs bg-indigo-600 text-white rounded-lg">
                {currentPage}
              </span>
              <span className="text-xs text-gray-500">of {effectiveTotalPages}</span>
            </div>
            
            {/* Desktop: Show pagination buttons */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              {renderPaginationButtons()}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === effectiveTotalPages}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;