$(() =>
require(['bind', 'module_struct', 'data/data', 'el/el', 'compat/observe', 'presenter/presenter'],
function(bind, module, data, el, _proxy, presenter) {
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
		bar_height(graph_height, value) {
			return graph_height * value / this.max;
		},
		bar_y(graph_height, value) {
			return graph_height * (1 - value / this.max);
		}
	};
	this.context = new el.shadow.ShadowContext;
	this.scope = new el.scope.Scope(this.model);
	this.aggregate = new data.Aggregate(this.context, this.scope, 'data.* >>= extract_max');
	this.model.aggregate = this.aggregate.model;
	this.shadow = new el.shadow.object(new Map([
		['max', el.shadow.value(this.context, this.scope, 'aggregate.max * 1.1')],
		['values', el.shadow.value(this.context, this.scope, `
			data.* >>= (\\item => @(!#(item.values.sort(sort^).*), item))
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
    this.model = {};
}
Object.assign(TestReportControllerImpl.prototype, {
    initialize() {
        // generate chart
        var chart = BarChart.instance();
        this.svg = presenter.svg.SVGPresenter.instance();
        this.svg.bind(this.model.bar_graph_area.element, this.model.bar_chart.element, chart.model);

        var test_info = JSON.parse(this.model.test_info.element.value);
        debugger;

        function set_selection(token) {
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
        			values.push({
        				name: topic_names.get(topic_token),
        				values: [
        					{name: 'Total', value: digest.total, click_data: {token: topic_token}},
        					{name: 'Mark', value: digest.mark, click_data: {token: topic_token}}
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
        debugger;
    }
});
    
var TestReportController = module('TestReportController', {instance: TestReportControllerImpl});
    
var instance = TestReportController.instance();
bind.bind('.test-report-main', instance);
instance.initialize();
}));