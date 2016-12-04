'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    EvalResponse = mongoose.model('EvalResponse'),
    Participant = mongoose.model('Participant'),
    ParticipantTrack = mongoose.model('ParticipantTrack'),
    config = require('meanio').loadConfig(),
    _ = require('lodash'),
    async = require('async');

module.exports = function(HIEval) {

    return {
        saveEvalResponse: function(req, res) {

            var evalId = req.params['evalId'];
            var siteUrl = req.body.siteUrl;
            var group = req.body.group;
            var participantId = req.params['participantId'];

            var participant = null;

            async.waterfall([
                function(callback){
                    if (participantId) {
                        Participant.findOne({
                            _id: participantId
                        }).exec(function(err, participant) {
                            console.log(participant);
                            if (err || !participant) callback(null, null);
                            else callback(null, participant);
                        });
                    }else{
                        callback(null, null);
                    }
                },
                function(participant, callback) {
                    if (!participant) {
                        participant = new Participant();

                        participant.save(function(err){
                            if (err) {
                                callback(err);
                            }

                            callback(null, participant);
                        });
                    }else{
                        callback(null, participant);
                    }
                },
                function(participant, callback) {
                    var response = new EvalResponse({
                        response: req.body.response,
                        group: group,
                        participant: participant,
                        evalId: evalId,
                        siteUrl: siteUrl
                    });

                    response.save(function(err) {
                        if (err) {
                            callback(err);
                        }

                        callback(null, response);
                    });
                }
                ], function(err, result){
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the response!'
                        });
                    }

                    res.json(result);
                });
        },
        track: function(req, res) {

            var event = req.body.event;
            var participantId = req.params['participantId'];
            var participantIdentifier = req.body.participantIdentifier;
            var participantSource = req.body.participantSource;
            var participantType = req.body.participantType;

            var participant = null;

            async.waterfall([
                function(callback){
                    if (participantId && participantId != 'null') {

                        Participant.findOne({
                            _id: participantId
                        }).exec(function(err, participant) {
                            if (err || !participant) callback(null, null);
                            else callback(null, participant);
                        });
                    }else if (participantIdentifier && participantIdentifier != 'null') {
                        //console.log(participantIdentifier);
                        Participant.findOne({
                            identifier: participantIdentifier
                        }).exec(function(err, participant) {
                            console.log(participant);
                            if (err || !participant) callback(null, null);
                            else callback(null, participant);
                        });
                    }else{
                        callback(null, null);
                    }
                },
                function(participant, callback) {
                    if (!participant) {
                        participant = new Participant({
                            identifier: participantIdentifier,
                            source: participantSource,
                            type: participantType
                        });

                        participant.save(function(err){
                            if (err) {
                                callback(err);
                            }

                            callback(null, participant);
                        });
                    }else{
                        callback(null, participant);
                    }
                },
                function(participant, callback) {
                    var participantTrack = new ParticipantTrack({
                        participant: participant,
                        event: event
                    });

                    participantTrack.save(function(err) {
                        if (err) {
                            callback(err);
                        }

                        callback(null, participantTrack);
                    });
                }
                ], function(err, result){
                    if (err) {
                        return res.status(500).json({
                            error: 'Cannot save the participant tracking information!'
                        });
                    }

                    res.json(result);
                });
        },
        next_eval: function(req, res) {

            var group = req.body.group;
            var max = req.body.max;
            var type = req.body.type;

            //console.log(type);

            var config_file = '../../public/assets/eval/' + req.body.config + '.json';

            var config = require(config_file);

            var sites = config[group]['sites'];

            var evals = [];

            _.forIn(config[group]['evals'], function(instrumentGroup, key) {

                for (var i = 0; i < instrumentGroup['instruments'].length; i++) {
                  evals.push(instrumentGroup['instruments'][i]);
                }
              });

            var counts = {};

            _.each(sites, function(siteUrl){
                _.each(evals, function(evalId){
                    if (evalId == 'final') {
                        return;
                    }
                    var key = siteUrl + '|' + evalId;

                    counts[key] = max;
                });
            });


            EvalResponse
                .find()
                .where('siteUrl').in(sites)
                .where('evalId').in(evals)
                .populate('participant')
                .exec(function(err,data){
                    
                    _.each(data, function(r){

                        //console.log(r['participant']['type']);
                        if (r['participant']['source'] != 'crowd' || r['participant']['type'] != type) {
                            return;
                        }

                        var key = r['siteUrl'] + '|' + r['evalId'];

                        if (key in counts) {

                            counts[key] -= 1
                        }
                    })


                    var cc = [];

                    _.forIn(counts, function(v, k){

                        cc.push({
                            k: k,
                            v: v
                        });
                    });
                    
                    var c = _.sortBy(cc, function(o){
                        return o.v;
                    }).reverse();
                    
                    //console.log(c);
                    var f = _.head(c);

                    var r = f['k'].split('|');

                    //console.log(r);
                    res.json({
                        siteUrl: r[0],
                        evalId: r[1]
                    }); 
                });

            
        }
    };
}