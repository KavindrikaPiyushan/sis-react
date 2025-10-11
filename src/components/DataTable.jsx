import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

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
          className={`px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredData.length} total records
            </p>
          </div>
          
          {(showSearch || showFilter) && (
            <div className="flex flex-col sm:flex-row gap-3">
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full sm:w-64 bg-white shadow-sm"
                  />
                </div>
              )}
              
              {showFilter && (
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-200 shadow-sm">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
         {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) :(
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100"
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-all duration-200">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center justify-center gap-1">
                        {actions.onView && (
                          <button
                            onClick={() => actions.onView(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {actions.onEdit && (
                          <button
                            onClick={() => actions.onEdit(item)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:shadow-md"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {actions.onDelete && (
                          <button
                            onClick={() => actions.onDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
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
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <p className="text-lg font-medium">No data found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
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
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            {isExternalPagination ? (
              <>
                Showing <span className="font-medium">{filteredData.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                <span className="font-medium">{filteredData.length > 0 ? (page - 1) * itemsPerPage + filteredData.length : 0}</span> of{' '}
                <span className="font-medium">{filteredData.length}</span> results
              </>
            ) : (
              <>
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of{' '}
                <span className="font-medium">{filteredData.length}</span> results
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            {renderPaginationButtons()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === effectiveTotalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-gray-200"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;