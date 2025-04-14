const withFlowbiteReact = require("flowbite-react/plugin/nextjs");

module.exports = withFlowbiteReact({
    output: 'export', // Enables static export
    images: { unoptimized: true },
});