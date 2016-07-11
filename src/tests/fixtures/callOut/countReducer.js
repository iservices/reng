import Reng from '../../../local/index';

class CountReducer extends Reng.Reducer {

  actionIncrement(state) {
    const self = this;
    self.http.request({ method: 'GET', url: 'http://fake.org/functions/increment', body: state })
      .then(result => {
        self.emit('IncrementComplete', {
          result,
          error: null
        });
      })
      .catch(error => {
        self.emit('IncrementComplete', {
          result: 0,
          error
        });
      });

    return state;
  }

  actionIncrementComplete(state, event) {
    if (event.args.error) {
      this.errors.handle(event.args.error);
      return state;
    }
    return event.args.result;
  }
}

export default CountReducer;
