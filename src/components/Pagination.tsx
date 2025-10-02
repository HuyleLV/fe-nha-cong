import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPrev,
  onNext,
  onPageChange,
}) => {
  // Hàm tạo danh sách số trang
  const generatePageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (page >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const pageNumbers = generatePageNumbers();

  return (
    <nav className="flex justify-center items-center mt-6 gap-2 select-none">
      {/* Prev Button */}
      <button
        className="w-9 h-9 flex items-center justify-center border rounded-full bg-white hover:bg-blue-100 text-blue-500 cursor-pointer border-blue-300 shadow-sm transition disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
        onClick={onPrev}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M13 16l-5-6 5-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Page numbers */}
      {pageNumbers.map((num, idx) =>
        typeof num === "number" ? (
          <button
            key={`page-${num}-${idx}`} // ✅ key unique, không bị trùng
            className={`w-9 h-9 flex items-center justify-center rounded-full transition font-medium cursor-pointer
              ${
                num === page
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-blue-100 border border-gray-300"
              }`}
            onClick={() => onPageChange(num)}
            aria-current={num === page ? "page" : undefined}
          >
            {num}
          </button>
        ) : (
          <span key={`dots-${idx}`} className="px-2 text-gray-400 select-none">
            {num}
          </span>
        )
      )}

      {/* Next Button */}
      <button
        className="w-9 h-9 flex items-center justify-center border rounded-full bg-white hover:bg-blue-100 text-blue-500 cursor-pointer border-blue-300 shadow-sm transition disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
        onClick={onNext}
        disabled={page === totalPages || totalPages === 0}
        aria-label="Next page"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
          <path
            d="M7 4l5 6-5 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </nav>
  );
};

export default Pagination;