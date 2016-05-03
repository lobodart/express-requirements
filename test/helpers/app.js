var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var requirements = require('../../lib/express_requirements');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());
app.use(requirements.use(__dirname + '/routes'));

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.use('/', require('./routes/route'));

module.exports = app;