import Reng from '../../../local/index';

export default class QuestionReducer extends Reng.Reducer {

  onInit() {
    this.mQuestionIdNext = 0;
  }

  actionAddQuestion(state, event) {
    return [...state, {
      id: ++this.mQuestionIdNext,
      subject: event.args.subject,
      body: event.args.body
    }];
  }
}
