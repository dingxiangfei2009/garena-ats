$(function(){    
require(['bind', 'module_struct', 'compat/observe', 'el/el', 'qmod'],
function(bind, module, _proxy, el, qmod) {
'use strict';
    
function EvaluateControllerImpl() {
    var collateMarks =
        () =>
            this.test.questions.map(
                (question, index) => ({
                    id: question.config.id,
                    mark: this.model.mark[index]
                }));
    this.model = {
        // question_template: list of question templates
        question_template: {},
        mark: [],
        question_controllers: [],
        injectHTML(html) {
            var fragment = document.createElement('template');
            fragment.innerHTML = html;
            return {
                element: fragment,
                scope: new el.scope.Scope
            };
        },
        submit_marks() {
            $.ajax({
                url: '/evaluate/1',
                method: 'POST',
                data: {
                    marks: JSON.stringify(collateMarks())
                }
            }).success(function() {
                $('#success').modal('show');
            });
        }
    };
}
Object.assign(EvaluateControllerImpl.prototype, {
    initialize() {
        _proxy(this.model).id =
            this.id =
            Number(this.model.test_id_field.element.value);
        var test_info = JSON.parse(this.model.test_info_field.element.value);
        _proxy(this.model).test = this.test = test_info;
        this.question_controllers = [];
        test_info.questions.forEach(
            (question, index) => {
                this.model.mark[index] = question.config.mark;
                switch(question.info.type) {
                case 'mas':
                    this.question_controllers[index] = new qmod.MCQQuestionController(question);
                    _proxy(this.model.question_controllers)[index] = this.question_controllers[index].model;
                    break;
                case 'sbt':
                    this.question_controllers[index] = new qmod.SBTQuestionController(question);
                    _proxy(this.model.question_controllers)[index] = this.question_controllers[index].model;
                    break;
                    break;
                case 'sbc':
                    this.question_controllers[index] = new qmod.SBCQuestionController(question);
                    _proxy(this.model.question_controllers)[index] = this.question_controllers[index].model;
                    break;
                }
            });
        _proxy(this.model).application = test_info.application;
    }
});
    
var EvaluateController = module('EvaluateController', {instance: EvaluateControllerImpl});
    
var evaluater = EvaluateController.instance();
bind.bind('.evaluator-main', evaluater);
evaluater.initialize();

});
});