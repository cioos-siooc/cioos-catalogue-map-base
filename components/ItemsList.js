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
      <div className="bg-primary-200 dark:bg-primary-700 flex h-full w-full flex-col items-center justify-center rounded-md text-gray-500 dark:text-gray-400">
        <p>{t.load_datasets} ...</p>
        <br />
        <ImSpinner2
          className="inline-block h-4 w-4 animate-spin text-gray-500 dark:text-gray-400"
          aria-label="Loading"
        />
      </div>
    );
  }
  if (!itemsList || itemsList.length === 0) {
    return (
      <div className="bg-primary-200 dark:bg-primary-700 flex h-full w-full flex-col items-center justify-center rounded-md text-gray-500 dark:text-gray-400">
        <p>{t.no_datasets}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="z-50 grid grid-flow-row">
        <div
          id="drawer-navigation"
          className="bg-primary-200 dark:bg-primary-700 w-full rounded-md transition-transform duration-300 ease-in-out"
        >
          <ul className="space-y-2 font-medium">
            {itemsList.map(
              (item) => (
                <li
                  className="hover:bg-primary-500 bg-primary-100 dark:bg-primary-900 m-2 cursor-pointer rounded-md p-2 text-sm hover:text-white"
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
