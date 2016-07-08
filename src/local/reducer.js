import Page from './page';
import Errors from './errors';
import Store from './store';
import Storage from './storage';
import Http from './http';
import Debug from './debug';
import AppConfig from './appConfig';
import AppInput from './appInput';

/**
 * Base class for stores.
 */
export default class Reducer {

  /**
   * @constructor
   *
   * @param {Object} [opts] - Options for this class.
   * @param {View} [opts.view] - The view for this class.
   * @param {Object} [opts.initialState] - The initial state for the class.
   */
  constructor(opts = {}) {
    this.mView = opts.view;
    this.mInitialState = (typeof opts.initialState === 'undefined') ? {} : opts.initialState;
    this.initActionRouter();
    this.onInit();
  }

  /**
   * Called by view after the reducer has been initialized.
   *
   * @return {void}
   */
  onInit() {
  }

  /**
   * The view this reducer is associated with if there is one.
   */
  get view() {
    return this.mView;
  }

  /**
   * The injector for the view.
   */
  get injector() {
    return this.view.injector;
  }

  /**
   * The application configuration.
   */
  get appConfig() {
    if (!this.mAppConfig) {
      this.mAppConfig = this.injector.get(AppConfig);
    }
    return this.mAppConfig;
  }

  /**
   * The application input.
   */
  get appInput() {
    if (!this.mAppInput) {
      this.mAppInput = this.injector.get(AppInput);
    }
    return this.mAppInput.value;
  }

  /**
   * The errors service.
   */
  get errors() {
    if (!this.mErrors) {
      this.mErrors = this.injector.get(Errors);
    }
    return this.mErrors;
  }

  /**
   * The redux store used by the application.
   */
  get store() {
    if (!this.mStore) {
      this.mStore = this.injector.get(Store);
    }
    return this.mStore;
  }

  /**
   * The storage object used by the application.
   */
  get storage() {
    if (!this.mStorage) {
      this.mStorage = this.injector.get(Storage);
    }
    return this.mStorage;
  }

  /**
   * The http service used by the application.
   */
  get http() {
    if (!this.mHttp) {
      this.mHttp = this.injector.get(Http);
    }
    return this.mHttp;
  }

  /**
   * The debug service used by the application.
   */
  get debug() {
    if (!this.mDebug) {
      this.mDebug = this.injector.get(Debug);
    }
    return this.mDebug;
  }

  /**
   * The page the view belongs to.
   */
  get page() {
    if (!this.mPage) {
      this.mPage = this.injector.get(Page);
    }
    return this.mPage;
  }

  /**
   * Execute action against the state.
   *
   * @param {Object} state - The previous state.
   * @param {Object} action - The action to perform.
   * @returns {Object} The new state.
   */
  reduce(state, action) {
    if (action.type === '@@INIT') {
      return this.initialState(state);
    }
    return this.handleAction(state, action);
  }

  /**
   * Return the initial state.  Override this to provide custom initial states.
   *
   * @returns {Object} An empty object.
   */
  initialState() {
    return this.mInitialState;
  }

  /**
   * Reflect the class and record functions that actions should be routed to.
   *
   * @returns {void}
   */
  initActionRouter() {
    if (!this.actionRoutes) {
      // get all of the functions defined on the prototype
      const propNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this));

      this.actionRoutes = {};
      for (let propIndex = 0; propIndex < propNames.length; propIndex++) {
        // collect all property names that begin with the text 'action'
        const propName = propNames[propIndex];
        if (propName.length > 6 && propName.indexOf('action') === 0) {
          const action = propName.slice(6).replace(/[.]/g, '_');
          this.actionRoutes[action] = propName;
        }
      }
    }
  }

  /**
   * Get the reduce function as defined by the reduce decorator.
   *
   * @return {Function} The reduce function to use or null if there isn't one.
   */
  get reduceFunction() {
    if (this.mReduceFunction === undefined) {
      if (this.constructor.reduce && this.constructor.reduce.createReduceFunction) {
        this.mReduceFunction = this.constructor.reduce.createReduceFunction(this.view);
      }
    }
    return this.mReduceFunction;
  }

  /**
   * This is called when an action occurs.
   *
   * @param {Object} state - The previous state.
   * @param {Object} action - The details about the action that has occured.
   * @returns {Object} - The result from calling the action handler.
   */
  handleAction(state, action) {
    const result = this.reduceFunction ? this.reduceFunction(state) : state;
    const route = this.actionRoutes[action.type];
    if (route && (typeof this[route] === 'function')) {
      return this[route].apply(this, [result, action]);
    }
    return result;
  }
}
