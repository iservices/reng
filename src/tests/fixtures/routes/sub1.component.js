import Reng from '../../../local/index';
import Sub2 from './sub2.component';

@Reng.Component({
  selector: 'Sub1',
  template:
    `<div id="sub1">Hello from sub one</div>
    <Sub2></Sub2>
    `,
  directives: [
    Sub2
  ]
})
export default class Sub1 extends Reng.View {
}
