$(() =>
require(['bind', 'module_struct', 'data/data', 'el/el', 'compat/observe', 'presenter/presenter', 'qmod'],
function(bind, module, data, el, _proxy, presenter, qmod) {
'use strict';

function BarChartImpl() {
	this.model = {
		extract_max(item) {
			var max = 0;	// assume all positive values
			for (var value of item.values)
				if (max < value.value)
					max = value.value;
			return max;
		},
		sort(a, b) {
			// descending order
			return (a.value < b.value) - (a.value > b.value);
		},
		settings: {
			width: 200,
			height: 200,
			bar_width: 0.8,
			yAxis: {
				width: 10
			},
			xAxis: {
			}
		},
		break_text(text) {
			var arr = text.trim().split(/\s+/);
			if (arr.length) {
				var lines = [arr[0]];
				for (var i = 1, j = 0; i < arr.length; ++i)
					if (lines[j].length > 10)
						lines[++j] = arr[i];
					else {
						lines[j] += ' ';
						lines[j] += arr[i];
					}
				return lines.join('\n');
			} else
				return '';
		}
	};
	this.context = new el.shadow.ShadowContext;
	this.scope = new el.scope.Scope(this.model);
	this.aggregate = new data.Aggregate(this.context, this.scope, 'data.* >>= extract_max', {
		compare(x, y) {
			x = x || 0; y = y || 0;
			return (x > y) - (x < y);
		},
		equal(x, y) {
			return (x || 0) === (y || 0);
		},
		left_fold(x, y) {
			return (x || 0) + (y || 0);
		},
		right_fold(x, y) {
			return (x || 0) + (y || 0);
		}
	});
	this.model.aggregate = this.aggregate.model;
	this.shadow = new el.shadow.object(new Map([
		['max', el.shadow.value(this.context, this.scope, 'aggregate.max * 1.1'), value => {
			debugger;
			return value;
		}],
		['values', el.shadow.value(this.context, this.scope, `
			data.* >>= (\\item => @((item.values.sort(sort^).*), item))
		`)]
		]), this.model);
}
Object.assign(BarChartImpl.prototype, {
	load(data) {
		_proxy(this.model).data = data;
	},
	destroy() {
		this.context.destroy();
	}
});
var BarChart = module('BarChart', {instance: BarChartImpl});

function TestReportControllerImpl() {
    this.model = {
    	question_template: {},
        injectHTML(html) {
            var fragment = document.createElement('template');
            fragment.innerHTML = html;
            return {
                element: fragment,
                scope: new el.scope.Scope
            };
        },
        animate_options: {
        	enter(elements) {
        		$(elements).hide().slideDown(200);
        	},
        	leave(elements) {
        		$(elements).addClass('fadeOut').slideUp(200, function() {this.remove();});
        	}
        }
    };
}

var colors = [
	[218, 45, 60],
	[144, 45, 60],
	[39, 45, 60],
	[284, 45, 60]
];
Object.assign(TestReportControllerImpl.prototype, {
    initialize() {
        // generate chart
        var chart = BarChart.instance();
        this.svg = presenter.svg.SVGPresenter.instance();
        this.svg.bind(this.model.bar_graph_area.element, this.model.bar_chart.element, chart.model);
        var test_info = JSON.parse(this.model.test_info.element.value);

        var self = this;
        function set_selection(token) {
        	for (var i = 0; i < selector.length; ++i)
        		selector[i] = test_info.questions[i].info.topic_token === token;
        }

        // generate more statistics
        _proxy(this.model).test = test_info;
        var selector = Array(test_info.questions.length).fill(true);
        _proxy(this.model).selector = selector;
        var data_scope = new el.scope.Scope({
        	questions: test_info.questions,
        	selector: selector,
        	process(questions) {
        		var digest = new Map;
        		var topic_names = new Map;
        		questions.forEach(function (question) {
        			if (digest.has(question.info.topic_token)) {
        				var question_statistic = digest.get(question.info.topic_token);
        				question_statistic.total += Number(question.info.mark);
        				question_statistic.mark += Number(question.config.mark);
        			} else {
        				topic_names.set(question.info.topic_token, question.info.topic);
        				digest.set(question.info.topic_token, {
        					total: Number(question.info.mark),
        					mark: Number(question.config.mark)
        				});
        			}
        		});
        		var values = [];
        		digest.forEach(function (digest, topic_token) {
        			var color = colors[values.length % colors.length];
        			values.push({
        				name: topic_names.get(topic_token),
        				click_data: {token: topic_token},
        				values: [
        					{
        						name: digest.mark / digest.total > .95 ?
        							'Total ' + digest.total + ' Mark ' + digest.mark :
        							('Total ' + digest.total),
        						value: digest.total,
        						click_data: {token: topic_token},
        						color: [color[0], color[1], color[2] + 35]
        					},
        					{
        						name: digest.mark / digest.total > .95 ?
        							'' : ('Mark ' + digest.mark),
        						value: digest.mark,
        						click_data: {token: topic_token},
        						color: color
        					}
        				],
        				click: set_selection
        			});
        		});
        		return values;
        	}
        });
        var data_context = new el.shadow.ShadowContext;
        var data_shadow = new el.shadow.value(data_context, data_scope, `
        	questions.*.filter((\\ x, index => @(selector.*, selector[index]^))) |
        	process
        `, value => chart.load(value));
        _proxy(chart.model).onclick = function (e, item, item_index) {
        	set_selection(item.click_data.token);
        };

        this.question_controllers = [];
        _proxy(this.model).question_controllers = [];
        test_info.questions.forEach(
            (question, index) => {
                switch(question.info.type) {
                case 'mas':
                    this.question_controllers[index] = new qmod.MCQQuestionController(question);
                    _proxy(this.model.question_controllers)[index] = this.question_controllers[index].model;
                    break;
                case 'sbt':
                	this.question_controllers[index] = new qmod.SBTQuestionController(question);
                	_proxy(this.model.question_controllers)[index] = this.question_controllers[index].model;
                    break;
                case 'sbc':
                    this.question_controllers[index] = new qmod.SBCQuestionController(question);
                    _proxy(this.model.question_controllers)[index] = this.question_controllers[index].model;
                    break;
                }
            });
    }
});
    
var TestReportController = module('TestReportController', {instance: TestReportControllerImpl});
    
var instance = TestReportController.instance();
bind.bind('.test-report-main', instance);
instance.initialize();
}));