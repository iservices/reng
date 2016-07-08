import View from './view';
import Component from './component';

/**
 * Class used for unit testing purposes.
 */
@Component({
  selector: 'TestView',
  template:
    `<div>
    </div>`
})
export default class ReducerTestView extends View {
  /**
   * Get the reducer that has been set for this view.
   */
  get reducer() {
    return this.mReducer;
  }

  set reducer(value) {
    this.mReducer = value;
  }

  /**
   * Create a new instance of the given reducer type and set it up with this view.
   *
   * @param {Class} Type - The type of reducer to create.
   * @param {Object} [initialState] - The initial state the reducer should return.
   * @return {Reducer} A new instance of the reducer requested.
   */
  createReducer(Type, initialState) {
    this.reducer = super.createReducer(Type, initialState);
    return this.reducer;
  }

  /**
   * Perform a reduce operation.
   *
   * @param {Object} state - The current state.
   * @param {Object} action - The action to carry out on the state.
   * @returns {Object} The new state.
   */
  doReduce(state, action) {
    return this.reducer ? this.reducer.reduce(state, action) : state;
  }
}
