import Reng from '../../../local/index';
import Default from './default.component';
import Sub1 from './sub1.component';

@Reng.Component({
  selector: 'Root',
  template:
    `<router-outlet></router-outlet>
    `,
  routes: {
    '': Default,
    'one': Sub1
  }
})
export default class Root extends Reng.View {
}
