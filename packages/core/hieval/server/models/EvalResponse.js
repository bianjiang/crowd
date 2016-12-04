'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * EvalResponseSchema
 */
var EvalResponseSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  response: {
    type: String,
    required: true
  },
  participant: {
    type: Schema.ObjectId,
    ref: 'Participant',
    required: true
  },
  evalId: {
    type: String,
    required: true
  },
  siteUrl: {
    type: String,
    required: true
  },
  group: {
    type: String,
    required: true
  }
});

/**
 * Validations
 */

/**
 * Statics
 */

mongoose.model('EvalResponse', EvalResponseSchema);
