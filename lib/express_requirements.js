var _ = require('lodash');
var validator = require('validator');
var path = require('path');

var _options = {
  errorMessageKey: 'errorMessage',
  errorCodeKey: 'errorCode',
  defaultErrorCode: 400,
  defaultErrorMessage: 'bad_request',
  jsonErrorKey: 'error'
};

var use = function(folder, opts) {
  return function(req, res, next) {
    req.requirements = {
      routesFolder: folder,
      options: Object.assign(_options, opts)
    };
    next();
  };
};

var validate = function(key) {
  _error = null;
  _inspectedProperty = null;
  _validators = {};
  _additionalValidators = ['contains', 'equals', 'matches'];
  _.forEach(validator, function(method, methodName) {
    if (methodName.match(/^is/) || _.includes(_additionalValidators, methodName)) {
      _validators[methodName] = method;
    }
  });

  _validators.isArray = function(value, options) {
    try {
      array = JSON.parse(value);
      if (!Array.isArray(array))
        return false;

      if (options) {
        _.forEach(options, function(obj, key) {
          if (key == 'content') {
            var strContent = JSON.stringify(obj);
            array.forEach(function(value, idx, array) {
              checkProperty(value, JSON.parse(strContent));
              if (_error) return;
            });
          } else {
            var optionsCpy = JSON.parse(JSON.stringify(options));
            delete optionsCpy.content;
            checkProperty(value, optionsCpy);
          }

          if (_error) return;
        });
      }
    } catch (e) {
      return false;
    }

    return true;
  };

  _validators.notEmpty = function(value, options) {
    try {
      var array = JSON.parse(value);
      if (Array.isArray(array))
        return array.length > 0;
    } catch (e) { }

    return _validators.isLength(value, { min: 1 });
  }

  return function(req, res, next) {
    _error = null;
    _requirements = {};
    _inspectedProperty = null;

    if (!req.requirements)
      return next(new Error('Requirements route folder must be init!'));

    var keySplit = key.split('.');
    var pathSuffix = '';
    _.forEach(keySplit, function(part, idx) {
      if (idx < keySplit.length - 1)
        pathSuffix += part;
    });

    var requirementsPath = req.requirements.routesFolder + '/' + pathSuffix + '.req';
    var requirementsName = keySplit[keySplit.length - 1];
    _requirements = JSON.parse(JSON.stringify(require(requirementsPath)));

    var requirements = _requirements[requirementsName];
    var scopes = {
      _body: req.body,
      _headers: req.headers,
      _params: req.params
    };

    for (element in requirements) {
      if (scope = scopes[element]) {
        for (property in requirements[element])
          fetchPropertyInContainer(property, [scope], requirements[element][property]);
      } else {
        var scope = [];
        for (tmp in scopes)
          scope.push(scopes[tmp]);
        fetchPropertyInContainer(element, scope, requirements[element]);
      }

      if (error = _error) {
        var errorObj = {};
        errorObj[_options.jsonErrorKey] = error.message;
        return res.status(error.code).json(errorObj);
      }
    }

    next();
  };

  function fetchPropertyInContainer(property, container, options) {
    var found = false;
    _inspectedProperty = property;
    _.forEach(container, function(obj, idx) {
      if (property in obj) {
        found = true;
        if (inherit = options._inheritFrom) {
          mergeRequirementsFrom(inherit, property, options);
        }

        return checkProperty(obj[property], options);
      }
    });

    if (found)
      return;
    if (required = options.required)
      if (required) return formatError(
        required[_options.errorCodeKey] || _options.defaultErrorCode,
        required[_options.errorMessageKey] || "missing_%@_parameter"
        );
  };

  function checkProperty(value, options) {
    delete options._inheritFrom;
    delete options.required;

    _.forEach(options, function(obj, methodName) {
      var errorCode = obj[_options.errorCodeKey];
      var errorMessage = obj[_options.errorMessageKey];
      var parameterOption = obj._parameter;

      delete obj[_options.errorCodeKey];
      delete obj[_options.errorMessageKey];

      obj = (!Object.keys(obj).length ? undefined : obj);
      value = (_.isString(value) ? value : JSON.stringify(value));
      if (!_validators[methodName](value, parameterOption || obj))
        return formatError(parseInt(errorCode), errorMessage);
    });
  };

  function mergeRequirementsFrom(key, value, obj) {
    var requirements = _requirements[key][value];
    var inherit = Object.assign({}, requirements);
    var newObject = Object.assign(requirements, obj);
    Object.assign(obj, newObject);
  }

  function formatError(code, message) {
    if (_error)
      return;
    _error = {
      code: code || _options.defaultErrorCode,
      message: (message || _options.defaultErrorMessage).replace(/%@/, _inspectedProperty)
    };
  };
};

module.exports = {
  use: use,
  validate: validate
};
