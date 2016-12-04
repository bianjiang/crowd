'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var HIEval = new Module('hieval');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
HIEval.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  HIEval.routes(app, auth, database);

  HIEval.aggregateAsset('css', 'hieval.css');


  return HIEval;
});
