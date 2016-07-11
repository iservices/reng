/**
 * Capture information on the definition of a reduce function.
 */
export default class ReduceMetadata {
  /**
   * @constructor
   *
   * @param {Object|Function} reduceDef - The definition for a reduce function.
   */
  constructor(reduceDef) {
    this.reduceDef = reduceDef;
  }
  /**
   * A decorator used to define a reducer for a class.
   *
   * @param {Object} reduceDef - An object that defines the reducer.
   * @return {Function} The function that is used to decorate a class.
   */
  static decorator(reduceDef) {
    return function (target) {
      target.reduce = new ReduceMetadata(reduceDef);
    };
  }

  /**
   * Build out a reduce function from the reduce definition.
   *
   * @param {View} view - The view to build the reduce function for.
   * @return {Function} The reduce function that is built or null if there isn't one.
   */
  createReduceFunction(view) {
    if (!this.reduceDef) {
      return null;
    }

    if (typeof reduceDef === 'function') {
      return view.createReducer(this.reduceDef, view.input);
    }

    const reducers = {};
    const literals = {};
    Object.getOwnPropertyNames(this.reduceDef).forEach(paramName => {
      if (typeof this.reduceDef[paramName] === 'function') {
        reducers[paramName] = view.createReducer(this.reduceDef[paramName], view.input[paramName]);
      } else {
        literals[paramName] = this.reduceDef[paramName];
      }
    });

    return function (state, action) {
      const result = Object.assign({}, state);
      Object.getOwnPropertyNames(reducers).forEach(paramName => {
        result[paramName] = reducers[paramName].reduce(state[paramName], action);
      });
      Object.getOwnPropertyNames(literals).forEach(paramName => {
        result[paramName] = literals[paramName];
      });
      return result;
    }.bind(view); // eslint-disable-line no-extra-bind
  }
}
