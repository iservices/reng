import Reng from '../../../local/index';

@Reng.Component({
  selector: 'CountIncrementView',
  template: `<div>
    <form>
      <button id="countIncrement" type="button" (click)="handleClick()">Add</button>
    </form>
  </div>`
})
class CountIncrementView extends Reng.View {
  handleClick() {
    this.emit('Increment');
  }
}

export default CountIncrementView;
