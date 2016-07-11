import Reng from '../../../local/index';

@Reng.Component({
  selector: 'QuestionAddView',
  template: `<div>
    <form>
      <input id="questionSubject" [(ngModel)]="data.subject" type="text" placeholder="subject">
      <input id="questionBody" [(ngModel)]="data.body" type="text" placeholder="body">
      <button id="questionAdd" type="button" (click)="handleClick()">Create</button>
    </form>
  </div>`
})
export default class QuestionAddView extends Reng.View {
  handleClick() {
    // emit an addQuestion event
    this.emit(
      'AddQuestion',
      {
        subject: this.data.subject,
        body: this.data.body
      });

    // clear out inputs after creating question
    this.data.subject = '';
    this.data.body = '';
  }
}
