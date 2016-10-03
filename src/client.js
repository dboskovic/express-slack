const axios = require('axios'),
      WebSocket = require('ws'),
      qs = require('querystring');

const AUTH_PARAMS = ["client_id", "scope", "redirect_uri", "team", "state"],
      TOKEN_PARAMS = ["client_id", "client_secret", "code", "redirect_uri"];


class Client {
  /**
   * Contructor
   *
   * @param {Object} defaults - The default config for the instance
   */
  constructor(defaults) {    
    this.defaults = defaults || {}; // message defaults
  }

  /**
   * Create an instance of the TinySpeck adapter
   *
   * @param {Object} defaults - The default config for the instance
   * @return {TinySpeck} A new instance of the TinySpeck adapter
   */
  instance(defaults) {
    let options = Object.assign({}, this.defaults, defaults);
    return new this.constructor(options);
  }

  /**
   * Send data to Slack's API
   *
   * @param {string} endPoint - The method name or url (optional - defaults to chat.postMessage)
   * @param {object} args - The JSON payload to send
   * @return {Promise} A promise with the API result
   */
  send(...args) {
    let endPoint = 'chat.postMessage'; // default action is post message

    // if an endpoint was passed in, use it
    if (typeof args[0] === 'string') endPoint = args.shift();

    // use defaults when available
    let message = Object.assign({}, this.defaults, ...args);  

    // call update if ts included
    if (message.ts && endPoint === 'chat.postMessage') endPoint = 'chat.update';

    return this.post(endPoint, message);
  }

  /**
   * Start RTM
   *
   * @param {object} options - Optional arguments to pass to the rtm.start method
   * @return {WebSocket} A promise containing the WebSocket
   */
  rtm(options) {
    return new Promise((resolve, reject) => {
      this.send('rtm.start', options).then(res => {
        let ws = new WebSocket(res.url);
        resolve(ws);
      }).catch(reject);
    });
  }

  /**
   * OAuth Authorization Url
   *
   * @param {object} params - The OAuth querystring params
   * @return {string} The authorization url
   */
  authorizeUrl(params) {
    let whitelisted = AUTH_PARAMS.reduce((keys, key) => {
      if (params[key]) keys[key] = params[key];
      return keys;
    }, {});
    return "https://slack.com/oauth/authorize?" + qs.stringify(whitelisted);
  }

  /**
   * OAuth Access
   *
   * @param {object} params - The authorization params
   * @return {promise} A Promise containing the authorization results
   */
  access(params) {
    let whitelisted = TOKEN_PARAMS.reduce((keys, key) => {
      if (params[key]) keys[key] = params[key];
      return keys;
    }, {});
    return this.post('oauth.access', whitelisted);
  }

  /**
   * Install App
   *
   * @param {object} params - The authorization params with code
   * @return {promise} A Promise containing the installation results
   */
  install(params) {
    return new Promise((resolve, reject) => {
      this.access(params).catch(reject).then(auth => {
        let args = { token: auth.access_token };
        this.post('auth.test', args).catch(reject).then(info => {
          resolve(Object.assign({}, info, auth));
        });
      });
    });
  }

  /**
   * POST data to Slack's API
   *
   * @param {string} endPoint - The method name or url
   * @param {object} payload - The JSON payload to send
   * @param {boolean} stringify - Flag to stringify the JSON body
   * @return {Promise} A promise with the api result
   */
  post(endPoint, payload, stringify) {
    if (!/^http/i.test(endPoint) || stringify === true) {
      
      // serialize JSON params
      if (payload.attachments)
        payload.attachments = JSON.stringify(payload.attachments);

      // serialize JSON for POST
      payload = qs.stringify(payload);
    }

    let req = axios({ 
      url: endPoint,
      data: payload ,
      method: 'post',
      baseURL: 'https://slack.com/api/',
      headers: { 'user-agent': 'TinySpeck' }
    });

    return new Promise((resolve, reject) => {
      req.catch(reject).then(r => {
        if (r.data.ok && r.data.ok === false) reject(r.data);
        else resolve(r.data)
      });
    });
  }
}

module.exports = new Client();