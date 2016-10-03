const express = require('express'),
      bodyParser = require('body-parser'),
      Controller = require('./controller');

let controller = null;


/**
 * Middleware Initializer
 *
 * @param {mixed} settings - The middleware settings
 * @return {Router} - A mapped express router
 */
function init(settings) {
  let router = express.Router();
  controller = new Controller(settings);

  // body parser for json
  router.use(bodyParser.urlencoded({ extended: false }));
  router.use(bodyParser.json());

  // middleware
  router.get('/', controller.oauth.bind(controller));
  router.post('/', controller.verification.bind(controller));
  router.post('/', controller.challenge.bind(controller));
  router.post('/', controller.message.bind(controller));

  return router;
}


/**
 * Event handler for incoming messages
 *
 * @param {mixed} names - Any number of event names to listen to. The last will be the callback
 * @return {TinySpeck} The TinySpeck adapter
 */
init.on = function(...names) {
  let callback = names.pop(); // support multiple events per callback
  names.forEach(name => controller.on(name, callback));
}


module.exports = init;