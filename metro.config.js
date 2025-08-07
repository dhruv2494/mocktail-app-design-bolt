const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure resolver to exclude native-only modules on web
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Platform-specific aliasing - only for web platform
config.resolver.alias = {
  ...config.resolver.alias,
};

// Add resolver with platform-specific handling
const originalResolverRequest = config.resolver.resolverMainFields;
config.resolver.resolveRequest = (context, realModuleName, platform) => {
  // Replace react-native-pdf with web fallback on web platform
  if (realModuleName === 'react-native-pdf' && platform === 'web') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'src/utils/pdf-web-fallback.js'),
    };
  }
  
  // Use default resolver for everything else
  return context.resolveRequest(context, realModuleName, platform);
};

// Configure source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;