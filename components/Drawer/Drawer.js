import { useState } from "react";

export default function DrawerExample() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {/* Button to open the drawer */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={toggleDrawer}
      >
        Toggle Drawer
      </button>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-gray-800 text-white transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <button
          className="p-4 text-red-500"
          onClick={toggleDrawer}
        >
          Close
        </button>
        <ul className="p-4">
          <li className="py-2">Menu Item 1</li>
          <li className="py-2">Menu Item 2</li>
          <li className="py-2">Menu Item 3</li>
        </ul>
      </div>
    </div>
  );
}
