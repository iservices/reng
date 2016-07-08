import { EventEmitter } from '@angular/core';
import { createStore } from 'redux';
import Inject from './inject';

/**
 * This class encapsulates the logic for the redux store.
 */
@Inject.Injectable()
export default class Store {
  /**
   * @constructor
   *
   * @param {AppConfig} config - Options for the store.
   * @param {Page} page - The page this store works with.
   * @param {AppInput} input - The application input.
   */
  constructor(@Inject.AppConfig config, @Inject.Page page, @Inject.AppInput input) {
    this.mStore = null;
    this.mReplayActions = [];
    this.mOnChanged = new EventEmitter(false);
    this.mView = null;

    this.mPage = page;
    this.mInput = input.value;
    this.mReducerOverride = config.store.reducer;
    this.mActionNotify = config.store.action;
  }

  /**
   * Create and wire up the store.
   *
   * @param {View} view - The view that this store is associated with.
   * @returns {void}
   */
  init() {
    if (this.mStoreUnsubscribe) {
      this.mStoreUnsubscribe();
    }
    const reducerFunc = this._reduce.bind(this) || function () { return {}; };
    this.mStore = createStore(reducerFunc);
    this.mStoreUnsubscribe = this.mStore.subscribe(this._storeListener.bind(this));
    this._replayActions();
  }

  /**
   * Get the current state of the store.
   *
   * @return {Object} The current state of the store.
   */
  getState() {
    return this.mStore ? this.mStore.getState() : {};
  }

  /**
   * Replay all of the recorded actions against the store.
   *
   * @return {void}
   */
  _replayActions() {
    const self = this;
    this.mReplayActions.forEach(action => {
      self.dispatch(action);
    });
    this.mReplayActions = [];
  }

  /**
   * Dispatch an async action to the page store.
   *
   * @param {Object} action - The action to dispatch.
   * @returns {void}
   */
  dispatch(action) {
    const self = this;
    setTimeout(() => {
      self._dispatch(action);
    });
  }

  /**
   * Dispatch the given action to the page store synchronously.
   *
   * @param {Object} action - The action to dispatch.
   * @returns {void}
   */
  dispatchSync(action) {
    this._dispatch(action);
  }

  /**
   * Dispatch the given action.  If the store has not been initialized yet the action will be
   * queued for later dispatch after the store has been initialized.
   *
   * @param {Object} action - The action to dispatch.
   * @return {void}
   */
  _dispatch(action) {
    if (this.mStore) {
      this.mStore.dispatch(action);
    } else {
      this.mReplayActions.push(action);
    }
  }

  /**
   * The view this store will interact with.
   */
  get _view() {
    return this.mPage ? this.mPage.view : null;
  }

  /**
   * Handle updates to the store.
   *
   * @param {Object} state - The previous state.
   * @param {Object} action - The action to perform.
   * @returns {Object} The new state.
   */
  _reduce(state, action) {
    this.mLastActionType = action.type;
    let result = state;

    // override reducer if enabled
    if (this.mReducerOverride && this.mReducerOverride[action.type]) {
      if (typeof this.mReducerOverride[action.type] === 'function') {
        result = this.mReducerOverride[action.type](state, action);
      } else {
        result = Object.assign({}, state, this.mReducerOverride[action.type]);
      }
    // initial state
    } else if (action.type === '@@redux/INIT') {
      result = (!this._view || !this._view.doReduce) ? state : this._view.doReduce(this.mInput, { type: '@@INIT' });
    // if there isn't a reducer just return the state
    } else if (!this._view || !this._view.doReduce) {
      result = state;
    // get state from the view
    } else {
      result = this._view.doReduce(state, action);
    }

    return result;
  }

  /**
   * Notify view that the store has been changed.
   *
   * @returns {void}
   */
  _storeListener() {
    if (this._view) {
      this._view.input = this.getState();
    }
    if (this.mPage && this.mPage.tick) {
      this.mPage.tick();
    }

    // notify listeners of a dispatched action
    if (this.mActionNotify) {
      const opts = { state: this.getState(), action: this.mLastActionType };
      if (typeof this.mActionNotify === 'function') {
        this.mActionNotify(opts);
      } else if (this.mActionNotify[this.mLastActionType] !== undefined) {
        this.mActionNotify[this.mLastActionType](opts);
      }
    }
  }
}
