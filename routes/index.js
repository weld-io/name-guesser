var express = require('express');
var router = express.Router();
var emailtools = require('../lib/emailtools');

module.exports.index = function(req, res) {

	console.log('format', req.params);


	if (req.params.format) {
		res.json(emailtools.processUser(req.query));
	}
	else {
		res.render('index', { title: 'Name Guesser' });
	}

};