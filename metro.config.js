/* 
    Metro is a bundler that is used by Expo to bundle your JS and assets 
    for the app
*/
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/* 
    Firebase uses cjs files thus we need to add this extension 
    so that Metro can parse them
*/
defaultConfig.resolver.assetExts.push('cjs');

module.exports = defaultConfig;
