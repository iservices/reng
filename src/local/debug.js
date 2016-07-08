import Inject from './inject';
import Util from './util';

let createDebug = null;

/**
 * Debug related functions.
 */
@Inject.Injectable()
export default class Debug {

  /**
   * Initialize the debug environment. This function will enable a developer in the browser to type either
   * enableDebug(args) or disableDebug() into the console.  When not in a browser the debugger will look at
   * process.env.DEBUG for enabled categories.
   *
   * @param {Debug} value - The debugger to use.  If not set then the debug browser is used.
   * @return {void}
   */
  static initDebugger(value) {
    if (createDebug) {
      return;
    }

    if (!value) {
      if (Util.isBrowser) {
        createDebug = require('debug/browser');
        window.enableDebug = createDebug.enable;
        window.disableDebug = createDebug.disable;
      }
    } else {
      createDebug = value;
    }

    if (typeof process !== 'undefined' && process.env && process.env.DEBUG) {
      createDebug.enable(process.env.DEBUG);
    }
  }

  /**
   * Create a new logger for the given category.
   * @param {String} category - The category to create debug entries under.
   * @return {debug} The debug object.
   */
  logger(category) {
    Debug.initDebugger();
    return createDebug(category);
  }

  /**
   * Log a debug entry.
   * @param {String} category - The category to create debug entries under.
   * @param {String} title - The title to give the log.
   * @param {String} text - The text to log.
   * @return {void}
   */
  log(category, title, text) {
    if (typeof category === 'undefined' && typeof title === 'undefined' && typeof text === 'undefined') {
      this.logger('debug')('');
    } else if (typeof title === 'undefined' && typeof text === 'undefined') {
      this.logger('debug')(category);
    } else if (typeof text === 'undefined') {
      if (typeof title === 'object') {
        const lg = this.logger(category);
        Object.keys(title).forEach(key => {
          lg(`${key}: ${title[key]}`);
        });
      } else {
        this.logger(category)(title);
      }
    } else {
      this.logger(category)(`${title}: ${text}`);
    }
  }
}
