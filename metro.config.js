const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const zustandMiddlewareCjs = path.resolve(__dirname, 'node_modules/zustand/middleware.js');

// On web, zustand's ESM middleware uses import.meta which the browser rejects
// as a syntax error outside an ES module. Force the CJS build instead.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'zustand/middleware') {
    return { filePath: zustandMiddlewareCjs, type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
