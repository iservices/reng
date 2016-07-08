import Reng from '../../../local/index';

export default class QuestionReducer extends Reng.Reducer {

  onInit() {
    this.mQuestionIdNext = 0;
  }

  actionAddQuestion(state, action) {
    return [...state, {
      id: ++this.mQuestionIdNext,
      subject: action.subject,
      body: action.body
    }];
  }
}
