const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project directory (apps/mobile) and workspace root directory
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo root
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies correctly across the workspace
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
