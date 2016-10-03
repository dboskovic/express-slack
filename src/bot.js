const client = require('./client');

class Bot {
  /**
   * Constructor
   *
   * @param {object} auth - The team's oauth info
   * @param {object} payload - The message payload to use for context
   */
  constructor(auth, payload) {
    this.token = auth.bot ? auth.bot.bot_access_token : auth.access_token;
    this.client = client.create({ token: this.token });
    this.payload = payload;
  }

  /**
   * Public Reply
   *
   * @param {object} message - The message to reply with
   * @param {boolean} ephemeral - Flag to make the message ephemeral (default to false)
   */
  reply(message, ephemeral) {
    let {response_url, channel_id} = this.payload;
    if (typeof(message) === 'string') message = { text: message };

    if (ephemeral) {
      if (response_url) this.call(response_url, message);
      else console.error("Can't send a private message without a response_url");
    }
    else if (channel_id) {
      message.channel = channel_id;
      this.client.call(message);
    }
  }

  /**
   * Private Reply
   *
   * @param {object} message - The message to reply with
   */
  replyPrivate(message) {
    this.reply(message, true);
  }

  /**
   * Post to API
   *
   * @param {string} endPoint - The api endpoint or method name to call
   * @param {object} payload - The payload to send
   */
  call(endPoint, payload) {
    return this.client.send(endPoint, payload);
  }

  /**
   * Send Message
   *
   * @param {object} message - The message to post
   */
  say(message) {
    return this.client.send(message);
  }
}

module.exports = Bot;