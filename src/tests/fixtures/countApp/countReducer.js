import Reng from '../../../local/index';

class CountReducer extends Reng.Reducer {

  actionIncrement(state) {
    return state + 1;
  }
}

export default CountReducer;
