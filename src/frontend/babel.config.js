module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  "plugins": [
    ["react-native-reanimated/plugin", {
      "loose": true,
      "globals": [
        "__scanCodes",
        "__scanOCR"
    ]
  }],
  ["@babel/plugin-proposal-private-methods", { "loose": true}]
  ]
};
