"use client";
import { ImSpinner2 } from "react-icons/im";
import { getLocale } from "@/app/get-locale";

export default function ItemsList({
  itemsList,
  onItemClick,
  onItemDoubleClick,
  lang,
  loading,
}) {
  const t = getLocale(lang);
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
  return (
    <div>
      <div className="grid grid-flow-row z-50">
        <div
          id="drawer-navigation"
          className="bg-primary-200 dark:bg-primary-700 w-full transition-transform duration-300 ease-in-out rounded-md"
        >
          <ul className="space-y-2 font-medium">
            {itemsList.map(
              (item) => (
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
              ), // Dynamically create <li> items
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
