'use strict';

module.exports = function(HIEval, app, auth) {
  
  var hieval = require('../controllers/hieval')(HIEval);
  app.route('/api/hieval/evals/:evalId/participants/:participantId').post(hieval.saveEvalResponse);
  app.route('/api/hieval/track/:participantId').post(hieval.track);
  app.route('/api/hieval/evals/next_eval').post(hieval.next_eval);
};
