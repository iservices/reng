import Inject from './inject';
import Util from './util';

/**
 * Input for the application.
 */
@Inject.Injectable()
export default class AppInput {
  /**
   * @constructor
   *
   * @param {Object} [input] - The input to set.  If not provided and running in a browser the input will be loaded
   *                           from the DOM.
   */
  constructor(input) {
    if (input !== undefined) {
      this.value = input;
    } else if (Util.isBrowser && !Util.isTest) {
      const element = document.getElementById('page-input');
      this.value = (!element || !element.textContent) ? {} : JSON.parse(element.textContent);
    } else {
      this.value = {};
    }
  }
}
