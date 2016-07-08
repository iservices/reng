import Reng from '../../../local/index';
import CountDisplayView from './countDisplayView';
import CountIncrementView from './countIncrementView';
import CountReducer from './countReducer';

@Reng.Component({
  selector: 'CountApp',
  template: `<div>
    <CountDisplayView [input]="input.count"></CountDisplayView>
    <CountIncrementView [emitter]="{ type: 'DISPATCH' }"></CountIncrementView>
  </div>`,
  directives: [CountDisplayView, CountIncrementView]
})
class CountApp extends Reng.View {

  onInit() {
    this.countReducer = this.createReducer(CountReducer, this.input.count);
  }

  reduce(state, action) {
    return {
      count: this.countReducer.reduce(state.count, action)
    };
  }
}

export default CountApp;
