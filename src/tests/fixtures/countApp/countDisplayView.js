import Reng from '../../../local/index';

@Reng.Component({
  selector: 'CountDisplayView',
  template: `<div>
    <span>Count: </span><span id="countDisplay">{{input}}</span>
  </div>`
})
class CountDisplayView extends Reng.View {
}

export default CountDisplayView;
