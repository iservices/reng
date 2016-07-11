import Reng from '../../../local/index';
import CountDisplayView from './countDisplayView';
import CountIncrementView from './countIncrementView';
import CountReducer from './countReducer';

@Reng.Component({
  selector: 'CountApp',
  template: `<div>
    <CountDisplayView [input]="input.count"></CountDisplayView>
    <CountIncrementView [emitter]="{ type: { Increment: 'DISPATCH' } }"></CountIncrementView>
  </div>`,
  directives: [CountDisplayView, CountIncrementView]
})
@Reng.Reduce({ count: CountReducer })
class CountApp extends Reng.View {
}

export default CountApp;
