import Errors from './errors';
import Store from './store';
import Debug from './debug';
import { ComponentMetadata, Input, Output, EventEmitter } from '@angular/core';

const UNDERSCORE_PATTERN = /_/g;

/**
 * A view on the page.
 */
export default class View {

  /**
   * @constructor
   *
   * @param {Injector} injector - The injector for this view.
   */
  constructor(injector) {
    this.mInjector = injector;
  }

  /**
   * Get the selector for the given component.
   *
   * @param {Object} comp - The component to get the selector from.
   * @return {string} The selector for the given component or null if one isn't found.
   */
  static getSelector(comp) {
    const annotations = Reflect.getOwnMetadata('annotations', comp);
    if (annotations && annotations.length) {
      for (let i = 0; i < annotations.length; i++) {
        if (annotations[i].constructor === ComponentMetadata) {
          return annotations[i].selector;
        }
      }
    }
    return null;
  }

  /**
   * The local data for the view.
   */
  get data() {
    if (!this.mData) {
      this.mData = {};
    }
    return this.mData;
  }

  set data(value) {
    this.mData = value;
  }

  /**
   * The injector for the view.
   */
  get injector() {
    return this.mInjector;
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
  get __store() {
    if (!this.mStore) {
      this.mStore = this.injector.get(Store);
    }
    return this.mStore;
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
   * The input provided to the view.
   */
  @Input('input') // eslint-disable-line new-cap
  set input(value) {
    this.mInput = value;
  }

  get input() {
    return this.mInput === undefined ? {} : this.mInput;
  }

  /**
   * Configuration for the emitter.
   *
   * @param {String} value.type - The type of emitting.  Can be 'EVENT', 'DISPATCH', or 'BOTH'.  Defaults to 'EVENT'.
   * @param {Object} value.map - A mapping for the event names.
   * @param {Object} value.source - Additional data to include in the event.
   */
  @Input('emitter')
  set emitter(value) {
    this.mEmitter = value;
  }

  get emitter() {
    if (!this.mEmitter) {
      this.mEmitter = {
        type: 'EVENT'
      };
    }
    return this.mEmitter;
  }

  /**
   * The output from the view.
   */
  @Output('output')
  set output(value) {
    this.mOutput = value;
  }

  get output() {
    if (!this.mOutput) this.mOutput = new EventEmitter();
    return this.mOutput;
  }

  /**
   * Get the class object from the input object if there is one.
   */
  get className() {
    return this.input ? this.input.className : undefined;
  }

  /**
   * Get the style with underscores replaced with dashes from the input.style object.
   */
  get style() {
    if (!this.input || !this.input.style) return undefined;

    const result = {};
    Object.getOwnPropertyNames(this.input.style).forEach(propName => {
      result[propName.replace(UNDERSCORE_PATTERN, '-')] = this.input.style[propName];
    });
    return result;
  }

  /**
   * Manual subscriptions for events.  Should only be used for testing.
   */
  get subscriptions() {
    if (!this.mSubscriptions) this.mSubscriptions = {};
    return this.mSubscriptions;
  }

  /**
   * Emit an event.
   *
   * @param {String} eventName - The event name.
   * @param {Object} eventArgs - The event arguments.
   * @return {void}
   */
  emit(eventName, eventArgs) {
    const event = {
      type: this.emitter.map ? (this.emitter.map[eventName] || eventName) : eventName,
      args: eventArgs,
      sender: this,
      context: this.emitter.context
    };
    if (typeof this.emitter.type === 'string') {
      // global setting for type
      if (this.emitter.type === 'EVENT' || this.emitter.type === 'BOTH') {
        this.output.emit(event);
      }
      if (this.emitter.type === 'DISPATCH' || this.emitter.type === 'BOTH') {
        this.__store.dispatch(event);
      }
    } else if (typeof this.emitter.type === 'object') {
      // event specific settings
      if (this.emitter.type[event.type] === 'EVENT' || this.emitter.type[event.type] === 'BOTH') {
        this.output.emit(event);
      }
      if (this.emitter.type[event.type] === 'DISPATCH' || this.emitter.type[event.type] === 'BOTH') {
        this.__store.dispatch(event);
      }
    } else {
      // default
      this.output.emit(event);
    }

    // manual subscriptions
    if (this.subscriptions[event.type]) {
      for (let i = 0; i < this.subscriptions[event.type].length; i++) {
        this.subscriptions[event.type](event);
      }
    }
  }

  /**
   * Subscribe to events from a view.
   *
   * @param {String|Object} map - This can be either an object that maps event names to functions or a single event name.
   * @param {Function} [target] - When map is a string, this function will be called when the map event occurs.
   * @param {Event} event - The event that has occured.
   * @return {void}
   */
  subscribe() {
    let map = null;
    let event = null;
    if (arguments.length === 3) {
      // name, function, event
      if (typeof arguments[0] === 'string' && typeof arguments[1] === 'function' && typeof arguments[2] === 'object') {
        map = { [arguments[0]]: arguments[1] };
        event = arguments[2];
      }
    } else if (arguments.length === 2) {
      if (typeof arguments[0] === 'object' && typeof arguments[1] === 'object') {
        // map, event
        map = arguments[0];
        event = arguments[1];
      } else if (typeof arguments[0] === 'string' && typeof arguments[1] === 'function') {
        // name, function
        map = arguments[0];
        const func = arguments[1];
        if (!this.subscriptions[map]) this.subscriptions[map] = [func];
        else this.subscriptions[map].push(func);
      }
    }

    if (!map) {
      throw new Error('Invalid arguments.');
    }

    if (event && typeof map[event.type] === 'function') {
      map[event.type](event);
    }
  }

  /**
   * Create a new instance of the given reducer type and set it up with this view.
   *
   * @param {Class} Type - The type of reducer to create.
   * @param {Object} [initialState] - The initial state the reducer should return.
   * @return {Reducer} A new instance of the reducer requested.
   */
  createReducer(Type, initialState) {
    const result = new Type({
      view: this,
      initialState
    });
    return result;
  }

  /**
   * Get the reduce function used for this view.
   *
   * @return {Function} The reduce function to use or null if there isn't one.
   */
  getReduceFunction() {
    if (this.mReduceFunction === undefined) {
      this.mReduceFunction = (typeof this.reduce === 'function') ? this.reduce.bind(this) : null;
      if (!this.mReduceFunction && this.constructor.reduce && this.constructor.reduce.createReduceFunction) {
        this.mReduceFunction = this.constructor.reduce.createReduceFunction(this);
      }
    }
    return this.mReduceFunction;
  }

  /**
   * Perform a reduce operation.
   *
   * @param {Object} state - The current state.
   * @param {Object} action - The action to carry out on the state.
   * @returns {Object} The new state.
   */
  doReduce(state, action) {
    const reduce = this.getReduceFunction();
    return reduce ? reduce(state, action) : state;
  }

  /**
   * Call the init function.
   *
   * @returns {void}
   */
  ngOnInit() {
    this.onInit();
  }

  /**
   * Called when the view is being initialized.
   *
   * @returns {void}
   */
  onInit() {
  }

  /**
   * Call the destroy function.
   *
   * @returns {void}
   */
  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * Called when the view is being destroyed.
   *
   * @returns {void}
   */
  onDestroy() {
  }
}
