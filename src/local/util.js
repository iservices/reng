let isTest = false;

/**
 * Utility class.
 */
export default class Util {
  /**
   * Is true when the page is running in a browser context.
   */
  static get isBrowser() {
    return (typeof window !== 'undefined' && typeof document !== 'undefined');
  }

  /**
   * Is true when the page is running in a test context.
   */
  static get isTest() {
    return isTest;
  }

  static set isTest(value) {
    isTest = value;
  }
}
