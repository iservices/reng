import Inject from './inject';

/**
 * Configuration values for the application.
 */
@Inject.Injectable()
export default class AppConfig {
  /**
   * @constructor
   *
   * @param {Object} [opts] - The configuration options.
   * @param {String} [opts.page.title] - The title for the application.
   * @param {Object} [opts.store] - Store options.
   * @param {Object | Function} [opts.store.reducer] - Override the default reducer with this one for unit testing.
   * @param {Object | Function} [opts.store.action] - Get notified about actions that have been dispatched for unit testing.
   * @param {Object} [opts.http] - Http options.
   * @param {Object | Function} [opts.http.request] - Override the default http request with this one for unit testing.
   * @param {Object} [opts.storage] - Storage options.
   * @param {Object} [opts.storage.session] - Values that should be put into the session storage for testing.
   * @param {Object} [opts.storage.local] - Values that should be put into the local storage for testing.
   */
  constructor(opts = {}) {
    this.page = {};
    if (opts.page) {
      this.page.title = opts.page.title;
      this.page.navigate = opts.page.navigate;
    }

    this.store = {};
    if (opts.store) {
      this.store.reducer = opts.store.reducer;
      this.store.action = opts.store.action;
    }

    this.http = {};
    if (opts.http) {
      this.http.request = opts.http.request;
    }

    this.storage = {};
    if (opts.storage) {
      this.storage.session = opts.storage.session;
      this.storage.local = opts.storage.local;
    }
  }
}
