const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add fallbacks for React Native modules that don't work on web
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native-pdf': false,
    'react-native/Libraries/Utilities/codegenNativeCommands': false,
    'react-native/Libraries/EventEmitter/NativeEventEmitter': false,
  };
  
  // Ignore native modules during web compilation
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-pdf': require.resolve('./src/utils/pdf-web-fallback.js'),
  };

  return config;
};