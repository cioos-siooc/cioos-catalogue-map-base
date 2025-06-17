import SelectReact from "react-select";
import makeAnimated from "react-select/animated";
import { getLocale } from "@/app/get-locale";
import colors from "tailwindcss/colors";

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
                ? colors.slate[900]
                : colors.white,
            color:
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? colors.gray[100]
                : colors.black,
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
              ? typeof window !== "undefined" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
                ? colors.slate[700]
                : colors.blue[100]
              : typeof window !== "undefined" &&
                  window.matchMedia("(prefers-color-scheme: dark)").matches
                ? colors.slate[900]
                : colors.white,
            color:
              typeof window !== "undefined" &&
              window.matchMedia("(prefers-color-scheme: dark)").matches
                ? colors.gray[100]
                : colors.black,
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: colors.gray[600],
            ":hover": {
              backgroundColor: colors.slate[700],
              color: colors.gray[400],
            },
          }),
        }}
      />
    </>
  );
}
