import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';

// NetInfo mock
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// react-native-bootsplash mock
jest.mock("react-native-bootsplash", () => {
  return {
    hide: jest.fn().mockResolvedValueOnce(),
    getVisibilityStatus: jest.fn().mockResolvedValue("hidden"),
  };
});

jest.mock("react-native-image-crop-picker", () => {});

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");

jest.mock("react-native-fs", () => {});

jest.mock("react-native-permissions", () => {});

jest.useFakeTimers();
