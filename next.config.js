const withFlowbiteReact = require("flowbite-react/plugin/nextjs");

const github_repository = process.env.GITHUB_REPOSITORY;
var basePath = ''
if (github_repository) {
    basePath = `/${github_repository.split('/')[1]}`;
}

module.exports = withFlowbiteReact({
    output: 'export', // Enables static export
    images: { unoptimized: true },
    basePath: basePath,
    env: {
        BASE_PATH: basePath,
    }
});