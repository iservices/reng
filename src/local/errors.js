import Inject from './inject';

/* eslint no-console:0 */

/**
 * This class encapsulates the logic for handling errors.
 */
@Inject.Injectable()
export default class Errors {
  /**
   * @constructor
   *
   * @param {AppConfig} config - Options for the error handler.
   */
  constructor(@Inject.AppConfig config) {
    this.mErrorsOverride = config.errors;
  }

  /**
   * Handle the given error.
   *
   * @param {Error|string} err - The error to handle.  If this is not a truthy value then the error is ignored.
   * @return {void}
   */
  handle(err) {
    if (!err) {
      return;
    }

    if (typeof this.mErrorsOverride === 'function') {
      // override for error handling
      this.mErrorsOverride(err);
    } else {
      // print error to console
      if (err.message) console.error(err.message);
      else console.error(err);
      if (err.stack) console.error(err.stack);
    }
  }
}
