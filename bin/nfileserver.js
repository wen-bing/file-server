#!/usr/bin/env node

/**
* Dependencies
*/
var program = require('commander');
var exec = require('child_process').exec;

var pkg = require('../package.json');
var fileserver = require('../file-server');

program
	.version(pkg.version)
	.option('-p, --port <port>', 'specify the port [5000]', Number, 5000)
	.parse(process.argv);

//start server
fileserver.startup(program.port);