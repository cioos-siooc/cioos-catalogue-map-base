const withFlowbiteReact = require("flowbite-react/plugin/nextjs");
const yaml = require('js-yaml');
const fs = require('fs');

const config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'));

module.exports = withFlowbiteReact({
    output: 'export', // Enables static export
    images: { unoptimized: true },
    env: {
        CONFIG: JSON.stringify(config)
    },
});