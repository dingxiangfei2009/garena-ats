define('qmod', [], function(window) {
'use strict';

function MCQQuestion(question) {
  this.question = question;
  this.type = question.question_type;
  this.statement = question.description;
  this.answers = JSON.parse(question.config).answer;
}
Object.assign(MCQQuestion.prototype, {
  getQuestion() {
    return {
      type: this.type,
      statement: this.statement,
      answers: this.answers
    };
  },
  parseReferenceAnswer(answer) {
    var ret = [];
    this.answers
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
  
function SBCQuestion(question) {
  this.question = question;
  var config = JSON.parse(question.config);
  this.stub = config.stub;
}
Object.assign(SBCQuestion.prototype, {
  getQuestion() {
    return {};
  },
  parseAnswer(answer) {
    if (answer) {
      var parsed = JSON.parse(answer);
      return {
        language: parsed.language,
        code: parsed.code
      };
    } else
      return {};
  },
  stringifyAnswer(answer) {
    if (answer && 'object' === typeof answer)
      return JSON.stringify({
        language: answer.language,
        code: answer.code
      });
    else
      return JSON.stringify({
        language: null,
        code: ''
      });
  }
});
  
function SBCQuestionController() {
}
  
return {
  MCQQuestion: MCQQuestion,
  MCQQuestionController: MCQQuestionController,
  SBCQuestion: SBCQuestion,
  SBCQuestionController: SBCQuestionController
};
  
});