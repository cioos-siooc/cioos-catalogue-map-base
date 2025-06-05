import SelectReact from "react-select";
import makeAnimated from "react-select/animated";
import { getLocale } from "@/app/get-locale";

export function SelectReactComponent({
  filter_type,
  orgList,
  projList,
  eovList,
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
        options={(filter_type === "organization"
          ? orgList
          : filter_type === "projects"
            ? projList
            : eovList
        ).map((item) =>
          filter_type === "eov"
            ? { value: item[0], label: item[1] }
            : { value: item, label: item },
        )}
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
        styles={{
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          menu: (base) => ({
            ...base,
            backgroundColor:
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "#0f172a" // Tailwind dark:bg-primary-900
                : "#fff", // Light mode: white
            color:
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "#f3f4f6" // Tailwind gray-100
                : "#000000", // Light mode: black
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
              ? typeof window !== "undefined" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "#1e293b" // Tailwind dark:bg-primary-700
                : "#dbeafe" // Tailwind bg-primary-100
              : typeof window !== "undefined" &&
                  window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "#0f172a" // Tailwind dark:bg-primary-900
                : "#fff", // Light mode: white
            color:
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "#f3f4f6" // Tailwind gray-100
                : "#000000", // Light mode: black
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor:
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "#0f172a" // Tailwind dark:bg-primary-900
                : "#bfdbfe", // Tailwind bg-primary-200
            color: "#ffffff", // Tailwind text-gray-500
          }),
          multiValueLabel: (base) => ({
            ...base,
            color:
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "#ffffff" // Tailwind dark:bg-primary-900
                : "#000000", // Tailwind bg-primary-200
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "#6b7280",
            ":hover": {
              backgroundColor: "#1e293b", // Tailwind dark:bg-primary-700
              color: "#9ca3af", // Tailwind dark:text-gray-400
            },
          }),
        }}
      />
    </>
  );
}
