!function(window) {
'use strict';

function MCQQuestion(question) {
  this.question = question;
  this.type = question.type;
  this.statement = question.description;
  this.answers = JSON.parse(question.config).answer;
}
Object.assign(MCQQuestion.prototype, {
  getQuestion() {
    return {
      type: this.type,
      statement: this.statement,
      answers: this.answer
    };
  },
  parseReferenceAnswer(answer) {
    var ret = [];
    this.answer
      .forEach(
        (answer, index) => answer.correct && ret.push(index));
  },
  parseAnswer(answer) {
    if (answer) {
      var ret = Array(this.answers.length).fill(false);
      var indices = JSON.parse(answer).choices;
      indices.forEach(idx => ret[idx] = true);
      return ret;
    } else
      return [];
  },
  stringifyAnswer(answer) {
    if (answer) {
      var ret = [];
      answer.forEach((tick, idx) => tick && ret.push(idx));
      return JSON.stringify({choices: ret});
    } else
      return JSON.stringify({choices:[]});
  }
});
function parseAnswer(question, answer) {
  var qn_controller;
  switch (question.question_type) {
    case 'mas':
      qn_controller = new MCQQuestion(question);
      return qn_controller.parseAnswer(answer);
  }
}
function stringifyAnswer(question, answer) {
  var qn_controller;
  switch (question.question_type) {
    case 'mas':
      qn_controller = new MCQQuestion(question);
      return qn_controller.stringifyAnswer(answer);
  }
}
  
function MCQQuestionController(question) {
  this.question = new MCQQuestion(question.info);
  this.model = {};
  this.model.choices = this.question.answers;
  this.model.user_answers = this.question.parseAnswer(question.config.answer);
}
  
window.MCQQuestion = MCQQuestion;
window.MCQQuestionController = MCQQuestionController;
  
}(window);