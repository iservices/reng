import Reng from '../../../local/index';

class CountReducer extends Reng.Reducer {

  actionIncrement(state) {
    const self = this;
    self.http.request({ method: 'GET', url: 'http://fake.org/functions/increment', body: state })
      .then(result => {
        self.store.dispatch({
          type: 'IncrementComplete',
          result,
          error: null
        });
      })
      .catch(error => {
        self.store.dispatch({
          type: 'IncrementComplete',
          result: 0,
          error
        });
      });

    return state;
  }

  actionIncrementComplete(state, action) {
    if (action.error) {
      this.errors.handle(action.error);
      return state;
    }
    return action.result;
  }
}

export default CountReducer;
