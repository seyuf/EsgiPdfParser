'use strict';

var express = require('express');
var controllers = require('./pdfToJson.controllers');

var router = express.Router();

router.get('/:date', controllers.json);
module.exports = router;
