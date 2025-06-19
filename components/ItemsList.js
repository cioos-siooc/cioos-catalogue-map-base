"use client";
import { ImSpinner2 } from "react-icons/im";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getLocale } from "@/app/get-locale";
import { useState } from "react";

export default function ItemsList({
  itemsList,
  onItemClick,
  onItemDoubleClick,
  lang,
  loading,
}) {
  const t = getLocale(lang);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.ceil((itemsList?.length || 0) / pageSize);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center bg-primary-200 dark:bg-primary-700 w-full h-full text-gray-500 dark:text-gray-400 rounded-md">
        <p>{t.load_datasets} ...</p>
        <br />
        <ImSpinner2
          className="animate-spin inline-block w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-label="Loading"
        />
      </div>
    );
  }
  if (!itemsList || itemsList.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center bg-primary-200 dark:bg-primary-700 w-full h-full text-gray-500 dark:text-gray-400 rounded-md">
        <p>{t.no_datasets}</p>
      </div>
    );
  }

  // Pagination logic
  const startIdx = (page - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedItems = itemsList.slice(startIdx, endIdx);

  return (
    <>
      <div className="flex-grow overflow-y-auto p-2 space-y-2 rounded-md grid grid-flow-row z-50">
        <div
          id="drawer-navigation"
          className="bg-primary-200 dark:bg-primary-700 w-full transition-transform duration-300 ease-in-out rounded-md"
        >
          <ul className="space-y-2 font-medium">
            {paginatedItems.map((item) => (
              <li
                className="hover:bg-primary-500 hover:text-white cursor-pointer bg-primary-100 dark:bg-primary-900 m-2 p-2 text-sm rounded-md"
                onClick={() => onItemClick(item)}
                onDoubleClick={() => onItemDoubleClick(item)}
                key={item.id}
              >
                {item.title_translated[lang]}
                <br />
                <span className="text-xs opacity-80">
                  {item.organization.title_translated[lang]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 my-1">
          <button
            className="px-2 py-1 flex items-center justify-center"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label={t.previous || "Prev"}
          >
            <FaChevronLeft />
          </button>
          <span className="text-xs">
            {startIdx + 1} - {Math.min(endIdx, itemsList.length)} /{" "}
            {itemsList.length}
          </span>
          <button
            className="px-2 py-1 flex items-center justify-center"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label={t.next || "Next"}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </>
  );
}
