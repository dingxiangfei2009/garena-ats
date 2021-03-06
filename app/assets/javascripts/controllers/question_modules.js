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
    case 'sbc':
      qn_controller = new SBCQuestion(question);
      return qn_controller.parseAnswer(answer);
    case 'sbt':
      qn_controller = new SBTQuestion(question);
      return qn_controller.parseAnswer(answer);
    case 'fib':
      qn_controller = new FIBQuestion(question);
      return qn_controller.parseAnswer(answer);
  }
}
function stringifyAnswer(question, answer) {
  var qn_controller;
  switch (question.question_type) {
    case 'mas':
      qn_controller = new MCQQuestion(question);
      return qn_controller.stringifyAnswer(answer);
    case 'sbc':
      qn_controller = new SBCQuestion(question);
      return qn_controller.stringifyAnswer(answer);
    case 'sbt':
      qn_controller = new SBTQuestion(question);
      return qn_controller.stringifyAnswer(answer);
    case 'fib':
      qn_controller = new FIBQuestion(question);
      return qn_controller.stringifyAnswer(answer);
  }
}

function MCQQuestionController(question) {
  this.question = new MCQQuestion(question.info);
  this.model = {
    choices: this.question.answers,
    user_answers: this.question.parseAnswer(question.config.answer)
  };
}

var ace_language_modes = new Map([
  ['javascript', 'javascript'],
  ['ruby', 'ruby'],
  ['cxx', 'c_cpp']
]);

function SBCQuestion(question) {
  this.question = question;
  this.statement = question.description;
  this.type = question.question_type;
  var config = JSON.parse(question.config);
  this.stub = config.stub;
  this.suggested_answer = config.suggested_answer;
}
SBCQuestion.languages = ace_language_modes;
Object.assign(SBCQuestion.prototype, {
  getQuestion() {
    return {
      type: this.type,
      statement: this.statement,
      code: this.stub
    };
  },
  parseAnswer(answer) {
    if (answer) {
      var parsed = JSON.parse(answer);
      return {
        language: parsed.language,
        code: parsed.code
      };
    } else
      return {
        language: null,
        code: this.stub || ''
      };
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

function SBCQuestionController(question, editable) {
  var self = this;
  this.question = new SBCQuestion(question.info);
  var answer = this.question.parseAnswer(question.config.answer);
  this.model = {
    answer: answer,
    set codeArea(element) {
      var editor = self.candidate_answer_editor = ace.edit(element.element);
      editor.setTheme('ace/theme/twilight');
      editor.getSession().setMode(
        'ace/mode/' + ace_language_modes.get(answer.language));
      editor.setValue(answer.code);
      editor.setReadOnly(!Boolean(editable));
    },
    set answerArea(element) {
      var editor = self.suggested_answer_editor = ace.edit(element.element);
      editor.setTheme('ace/theme/twilight');
      editor.getSession().setMode(
        'ace/mode/' + ace_language_modes.get(self.question.suggested_answer.language));
      editor.setValue(self.question.suggested_answer.code);
      editor.setReadOnly(!Boolean(editable));
    }
  };
}


function SBTQuestion(question) {
  this.question = question;
  this.statement = question.description;
  this.type = question.question_type;
  var config = JSON.parse(question.config);
  this.suggested_answer = config.answer.value;
}
Object.assign(SBTQuestion.prototype, {
  getQuestion() {
    return {
      type: this.type,
      statement: this.statement
    };
  },
  parseAnswer(answer) {
    return answer || '';
  },
  stringifyAnswer(answer) {
    return answer || '';
  }
});

function SBTQuestionController(question, editable) {
  var self = this;
  this.question = new SBTQuestion(question.info);
  var answer = this.question.parseAnswer(question.config.answer);
  this.model = {
    answer: answer,
    suggested_answer: this.question.suggested_answer
  };
}

function FIBQuestion(question) {
  this.question = question;
  this.statement = question.description;
  this.type = question.question_type;
  var config = JSON.parse(question.config);
  this.suggested_answer = config.answer.blanks;
  this.questionStatement = config.answer.statement;
}
Object.assign(FIBQuestion.prototype, {
  getQuestion() {
    var segments = [];
    this.questionStatement
    .split(/\{\{\s*blank\s*\}\}/)
    .map(text => ({
      blank: false,
      content: text
    })).forEach(statement => segments.push(statement, {blank: true}));
    segments.pop();
    return {
      type: this.type,
      statement: this.statement,
      questionStatement: this.questionStatement,
      segments: segments
    };
  },
  parseAnswer(answer) {
    if (answer) {
      return JSON.parse(answer);
    }
    else {
      return [];
    }
  },
  stringifyAnswer(answer) {
    if (answer) {
      return JSON.stringify(answer);
    }
    else {
      return '[]';
    }
  }
});

function FIBQuestionController(question, editable) {
  var self = this;
  this.question = new FIBQuestion(question.info);
  var answer = this.question.parseAnswer(question.config.answer);
  this.model = {
    answer: answer,
    question: this.question.getQuestion(),
    suggested_answer: this.question.suggested_answer
  };
}


return {
  MCQQuestion: MCQQuestion,
  MCQQuestionController: MCQQuestionController,
  SBCQuestion: SBCQuestion,
  SBCQuestionController: SBCQuestionController,
  SBTQuestion: SBTQuestion,
  SBTQuestionController: SBTQuestionController,
  FIBQuestion: FIBQuestion,
  FIBQuestionController: FIBQuestionController,
  parseAnswer: parseAnswer,
  stringifyAnswer: stringifyAnswer
};

});
