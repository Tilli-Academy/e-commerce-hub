import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HiChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
            num === page
              ? 'bg-indigo-600 text-white'
              : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          {num}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
