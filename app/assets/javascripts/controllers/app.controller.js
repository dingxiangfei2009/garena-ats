(function() {
/* global angular */
/*var BIND_HANDLERS = new Map;

function delegate_property_setter(constructor, property, event_name) {
  if (!BIND_HANDLERS.has(constructor))
    BIND_HANDLERS.set(constructor, {});
  var o = Object.getOwnPropertyDescriptor(constructor.prototype, property);
  var getter = o.get;
  var setter = o.set;
  Object.defineProperty(constructor.prototype, property, {
    configurable: true,
    enumerable: true,
    get: o.get,
    set (x) {
      var self = this;
      var before = getter.call(this);
      setter.call(this, x);
      var after = getter.call(this);
      if (before !== after)
        if ('function' === typeof event_name)
          requestAnimationFrame(function() {
            event_name(self);
          });
        else if (Array.isArray(event_name))
          requestAnimationFrame(function() {
            event_name.forEach(function (ev) {
              self.dispatchEvent(new Event(ev));
            });
          });
        else
          requestAnimationFrame(() => self.dispatchEvent(new Event(event_name)));
      return x;
    }
  });
  BIND_HANDLERS.get(constructor)[property] = setter;
}

delegate_property_setter(HTMLInputElement, 'value', ['input', 'change']);
delegate_property_setter(HTMLInputElement, 'checked', ['input', 'change', 'click']);
delegate_property_setter(HTMLOptionElement, 'selected', function (element) {
  element.parentElement.dispatchEvent(new Event('change'));
});
delegate_property_setter(HTMLTextAreaElement, 'value', ['input', 'change']);*/

var app = angular.module('app', ['templates', 'ui.ace', 'timer']);

app.directive('multipleChoice', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '='
      },
      templateUrl: '/templates/multiple-choice.html'
  };
});

app.directive('multipleAnswer', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      scope: {
        'data': '=',
        'display': '='
      },
      templateUrl: '/templates/multiple-answer.html'
  };
});

app.directive('subjectiveText', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '='
      },
      templateUrl: '/templates/subjective-text.html'
  };
});

app.directive('subjectiveCode', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      scope: {
        data: '='
      },
      templateUrl: '/templates/subjective-code.html'
  };
});
}());