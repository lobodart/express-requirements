var express = require('express');
var router = express.Router();
var requirements = require('../../../lib/express_requirements');

router.get('/test', requirements.validate('route.simple_get'), function(req, res, next) {
  return res.status(200).json({
    success: true
  });
});

router.get('/test/:id', requirements.validate('route.fancy_get'), function(req, res, next) {
  return res.status(200).json({
    success: true
  });
});

module.exports = router;