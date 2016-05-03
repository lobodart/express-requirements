# express-requirements
An [express.js](https://github.com/visionmedia/express) middleware to validate whatever comes into your NodeJS API. It works with [node-validator](https://github.com/chriso/validator.js).

## Installation
```
npm install express-requirements
```

## Usage
### Our project
Let's admit that we have the following files tree :
```
|-- app.js
|-- routes
    |-- route.js
    |-- route.req.js
```

### What is `route.req.js` ?
This file contains all of the requirements for one or multiple route(s). It is up to you.

You can rename this file as long as you keep the `.req.js` extension.
Here it is an example of requirements file :
```javascript
module.exports = {
    // Here you give a name to your route requirements
    my_route: {
        // Param firstName is required and must be alpha
        firstName: {
            required: true,
            isAlpha: true
        },
        // ...
    }
}
```

### How to apply my requirements ?
First of all, let's create a basic NodeJS server like that :
```javascript
// app.js
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var requirements = require('express-requirements'); // Require the module

app.use(bodyParser.json());

// Give the requirements root folder to the module
// Usually, you can use the routes root folder
app.use(requirements.use(__dirname + '/routes'));

app.use('/', require('./routes/route'));

app.listen(8888);
```

Finally, go to your `route.js` file to create a very basic route :
```javascript
// route.js
var express = require('express');
var router = express.Router();
var requirements = require('express-requirements');

router.get('/test', requirements.validate('route.my_route'), function(req, res, next) {
  return res.status(200).json({
    success: true
  });
});
```

That's it ! Now, everytime the `/test` route will be call, `express-requirements` will validate fields according to the `.req.js` file.

### What if I have another files tree ?
Let's change our files tree a little :
```
|-- app.js
|-- routes
    |-- route.js
    |-- requirements
        |-- route
            |-- main.req.js
```
The only thing which is going to change is the `route.js` file :
```javascript
// route.js
var express = require('express');
// ...

router.get('/test', requirements.validate('requirements.route.main.my_route'), function(req, res, next) {
  // ...
});
```

When you specify the requirements file to use, the element located after the last point is **always** the name of your route inside the `.req.js` file.

In a nutshell: you can organize your files tree as you want.

## Syntax
### Basic
```javascript
my_route: {
    firstName: {
        required: true, // Default error message will be 'missing_firstName_parameter'
        isAlpha: true, // Default error message will be 'bad_request'
        // ...
    }
}
```

### Custom error message/code
```javascript
my_route: {
    firstName: {
        required: {
            errorMessage: 'You must enter a firstName'
            // Default code is 400
        },
        isAlpha: {
            errorMessage: 'Only alpha in your %@', // Use %@ to retrieve the property name (here it is 'firstName')
            errorCode: 403
        },
        // ...
    }
}
```

### Scopes
```javascript
my_route: {
    // Only checks into the headers scope
    _headers: {
        'Authorization': { required: true }
        'Content-Type': { required: true }
    },
    // Only checks into the params scope
    _params: {
        id: { required: true, notEmpty: true }
    },
    // Only checks into the body scope
    _body: {
        username: { required: true, notEmpty: true }
    }
}
```

### Inheritance/Override
```javascript
my_route: {
    firstName: { required: true, notEmpty: true, isAlpha: true },
    lastName: {
        required: true,
        isAlpha: { errorMessage: '%@ must be alpha' }
    }
},

other_route: {
    firstName: { _inheritFrom: 'my_route' }, // Now firstName has 'notEmpty' and 'isAlpha' as requirements
    lastName: {
        _inheritFrom: 'my_route',
        isAlpha: {  errorMessage: 'Error message overriden for %@' }, // You can override any requirement component ...
        notEmpty: true // ... and even add new one
    }
}
```

> Note that for any inheritance, `required` is **never included**. You have to add it to the inherited route by yourself.

### Validator parameters
```javascript
my_route: {
    firstName: { required: true, isAlpha: true },
    phoneNumber: {
        matches: {
            _parameter: '[0-9]{3}\\-[0-9]{3}\\-[0-9]{4}', // Use _parameter to pass any parameter to a validator
            errorMessage: 'wrong_%@_format'
        }
    }
}
```

## Validators
You can use all the validators which compose [node-validator](https://github.com/chriso/validator.js).
You also have these :
### isArray
```javascript
isArray: true
```

```javascript
isArray: {
    notEmpty: true // You can't add custom errorMessage for this yet
    content: { // Check the content of the array
        isAlpha: { errorMessage: 'must_be_alpha' },
        // You can add other validators for the array content
    }
    
    // Usual parameters
    errorMessage: 'error',
    errorCode: 400
}
```

### notEmpty
```javascript
notEmpty: true
```

```javascript
notEmpty: {
    errorMessage: 'error',
    errorCode: 400
}
```

## What's next ?
- [ ] Posibility to add your own validators
- [ ] Add unit tests for the custom options
