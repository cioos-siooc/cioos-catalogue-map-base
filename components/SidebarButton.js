import React from "react";
import PropTypes from "prop-types";

const SidebarButton = ({ logo, label, onClick }) => {
  return (
    <button
      className={`flex w-full flex-row items-center gap-2 px-4 py-2 transition-colors duration-200 ${
        onClick ? "hover:bg-primary-500 cursor-pointer hover:text-white" : ""
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
  label: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};
SidebarButton.defaultProps = {
  logo: null,
};

export default SidebarButton;
