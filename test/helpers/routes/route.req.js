module.exports = {
    simple_get: {

        firstName: {
            required: true,
            notEmpty: true,
            isAlpha: true
        },
        lastName: {
            required: {
                errorMessage: '%@_is_required'
            },
            notEmpty: {
                errorMessage: '%@_is_empty'
            },
            isAlpha: {
                errorMessage: '%@_must_be_alpha'
            }
        },
        age: {
            isInt: {
                errorMessage: '%@_must_be_integer'
            }
        },
        data: {
            matches: {
                _parameter: '[0-9]{3}\\.[a-z]{2}',
                errorMessage: 'wrong_%@'
            }
        },
        license: {
            isDivisibleBy: {
                _parameter: 2,
                errorMessage: '%@_not_divisble_by_2'
            }
        },
        ids: {
            isArray: {
                notEmpty: true,
                content: {
                    isInt: {
                        errorMessage: '%@_must_be_array_of_int'
                    }
                },
                errorMessage: '%@_must_be_array'
            }
        },
        // Should check headers only
        _headers: {
            'x-auth': {
                isAlpha: true
            },
            'id': {
                isAlpha: true
            }
        }
    },

    fancy_get: {
        // Should check in params only
        _params: {
            id: {
                isInt: {
                    errorMessage: '%@_must_be_integer'
                }
            }
        },
        
        firstName: {
            _inheritFrom: 'simple_get'
        },
        lastName: {
            required: true,
            _inheritFrom: 'simple_get'
        },
        age: {
            _inheritFrom: 'simple_get',
            isInt: {
                errorMessage: null,
                errorCode: 403
            }
        }
    }
}
