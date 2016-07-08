import Reng from '../../../local/index';
import QuestionListView from './questionListView';
import QuestionAddView from './questionAddView';
import QuestionReducer from './questionReducer';

@Reng.Component({
  selector: 'QuestionAppView',
  template: `<div>
    <QuestionAddView [emitter]="{ type: 'DISPATCH' }"></QuestionAddView>
    <div>Size: <span id="questionSize">{{input.questions.length}}</span></div>
    <QuestionListView [input]="input.questions"></QuestionListView>
  </div>`,
  directives: [QuestionAddView, QuestionListView],
  reduce: { questions: QuestionReducer }
})
export default class QuestionAppView extends Reng.View {
}
