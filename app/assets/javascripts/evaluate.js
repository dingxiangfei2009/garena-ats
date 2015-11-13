require(['bind', 'module_struct', 'compat/observe', 'el/el', 'qmod', 'domReady!'],
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
            }
        },
        submit_marks() {
            console.log(collateMarks());
            $.ajax({
                url: '/evaluate/1',
                method: 'POST',
                data: {
                    data: JSON.stringify(collateMarks())
                }
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
        debugger;
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
                    question_controllers[index] = null;
                    break;
                case 'sbc':
                    question_controllers[index] = null;
                    break;
                }
            });
        _proxy(this.model).application = test_info.application;
    }
});
    
var EvaluateController = module('EvaluateController', {instance: EvaluateControllerImpl});
    
var evaluater = EvaluateController.instance();
bind.bind('#main', evaluater);
evaluater.initialize();

});