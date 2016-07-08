import Reng from '../../../local/index';

@Reng.Component({
  selector: 'QuestionListView',
  template: `<div>
    <div *ngFor="let question of input">
      <b>{{question.subject}}</b> - {{question.body}}
    </div>
  </div>`
})
export default class QuestionListView extends Reng.View {
}
