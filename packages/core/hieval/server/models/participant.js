'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  _   = require('lodash');


/**
 * ParticipantSchema
 */
var ParticipantSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    default: "crowd"
  },
  type: {
    type: String,
    default: "public"
  },
  identifier: {
    type: String,
    default: ""
  }
});

/**
 * Validations
 */

/**
 * Statics
 */

mongoose.model('Participant', ParticipantSchema);
