import SelectReact from "react-select";
import makeAnimated from "react-select/animated";
import { getLocale } from "@/app/get-locale";

export function SelectReactComponent({
  filter_type,
  options,
  setQuery,
  query,
  lang,
  handleKeyDown,
}) {
  const t = getLocale(lang) || {};

  return (
    <>
      <SelectReact
        id={`${t[filter_type]?.toLowerCase?.() || filter_type}-select`}
        isMulti
        options={options}
        value={query.map((val) => ({
          value: val[0],
          label: val[1],
        }))}
        onChange={(selectedOptions) => {
          const values = selectedOptions
            ? selectedOptions.map((opt) => [opt.value, opt.label])
            : [];
          setQuery(values);
        }}
        onKeyDown={handleKeyDown}
        closeMenuOnSelect={false}
        placeholder={t.select || "Select"}
        components={makeAnimated()}
        hideSelectedOptions={false}
        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
        menuPosition="fixed"
        unstyled
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        classNames={{
          menu: () =>
            "!bg-white dark:!bg-slate-900 !text-black dark:!text-gray-100 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mt-1 overflow-hidden",
          menuList: () => "py-1 max-h-64 overflow-y-auto",
          option: ({ isSelected, isFocused }) =>
            `px-3 py-2 cursor-pointer transition-colors ${
              isSelected
                ? "bg-primary-100 dark:bg-background-dark"
                : isFocused
                  ? "bg-blue-100 dark:bg-slate-700"
                  : "bg-white dark:bg-slate-900"
            } hover:bg-ui-light dark:hover:bg-ui-dark`,
          control: () =>
            "!bg-gray-50 dark:!bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm",
          multiValue: () =>
            "bg-primary-100 dark:bg-background-dark rounded items-center px-2 py-0.5 gap-1.5 flex",
          multiValueLabel: () =>
            "text-primary-800 dark:text-primary-100 text-sm leading-none p-1",
          multiValueRemove: () =>
            "text-gray-600 hover:bg-slate-700 hover:text-gray-400 rounded px-1 cursor-pointer",
          placeholder: () => "text-gray-400 dark:text-gray-500 text-sm",
          input: () => "text-black dark:text-white",
          valueContainer: () => "gap-1 flex flex-wrap",
          indicatorsContainer: () => "gap-1 flex",
          clearIndicator: () =>
            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer p-1",
          dropdownIndicator: () =>
            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer p-1",
        }}
      />
    </>
  );
}
