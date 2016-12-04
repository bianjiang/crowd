'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  _   = require('lodash');


/**
 * ParticipantTrackSchema
 */
var ParticipantTrackSchema = new Schema({
  logged: {
    type: Date,
    default: Date.now
  },
  participant: {
    type: Schema.ObjectId,
    ref: 'Participant',
    required: true
  },
  event: {
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

mongoose.model('ParticipantTrack', ParticipantTrackSchema);
