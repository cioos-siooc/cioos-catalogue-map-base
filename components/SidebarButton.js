import React from "react";
import PropTypes from "prop-types";

const SidebarButton = ({ logo, label, onClick }) => {
  return (
    <button
      className={`flex flex-row items-center w-full px-4 py-2 gap-2 transition-colors duration-200 ${
        onClick ? "hover:bg-primary-500 hover:text-white cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div>{logo}</div>
      <div>{label}</div>
    </button>
  );
};

SidebarButton.propTypes = {
  logo: PropTypes.node,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
SidebarButton.defaultProps = {
  logo: null,
};

export default SidebarButton;
