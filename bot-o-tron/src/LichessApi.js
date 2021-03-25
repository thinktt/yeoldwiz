const axios = require("axios");
const oboe = require("oboe");
/**
 * Programatic interface to the web API of lichess https://lichess.org/api#tag/Chess-Bot
 *  
 */
class LichessApi {

  /**
   * Initialise with access token from https://lichess.org/account/oauth/token/create.
   */
  constructor(token) {
    this.baseURL = "https://lichess.org/";
    this.headers = { "Authorization": `Bearer ${token}` };
    this.axiosConfig = {
      baseURL: this.baseURL,
      headers: this.headers
    };
  }

  acceptChallenge(challengeId) {
    return this.post(`api/challenge/${challengeId}/accept`);
  }

  declineChallenge(challengeId) {
    return this.post(`api/challenge/${challengeId}/decline`);
  }

  upgrade() {
    return this.post("api/bot/accounts/upgrade");
  }

  accountInfo() {
    return this.get("api/account");
  }

  makeMove(gameId, move) {
    return this.post(`api/bot/game/${gameId}/move/${move}`);
  }

  abortGame(gameId) {
    return this.post(`api/bot/game/${gameId}/abort`);
  }

  resignGame(gameId) {
    return this.post(`api/bot/game/${gameId}/resign`);
  }

  streamEvents(handler) {
    return this.stream("api/stream/event", handler);
  }

  streamGame(gameId, handler) {
    return this.stream(`api/bot/game/stream/${gameId}`, handler);
  }

  chat(gameId, room, text) {
    return this.post(`api/bot/game/${gameId}/chat`, {
      room,
      text
    });
  }

  currentGames() {
    return this.get('https://lichess.org/api/account/playing')
  }

  logAndReturn(data) {
    // console.log(JSON.stringify(data.data));
    return data;
  }

  // Get the full public game page, useful for parsing info regular api 
  // doesn't have
  gamePage(gameId) {
    return this.get(`https://lichess.org/${gameId}`)
  }
  

  get(URL) {
    // temporary hack to supress health check logging
    if (URL != 'https://lichess.org/api/account/playing') console.log(`GET ${URL}`)
    return axios.get(URL + "?v=" + Date.now(), this.axiosConfig)
      .then(this.logAndReturn)
      .catch(err => console.log(err));
  }

  post(URL, body) {
    console.log(`POST ${URL} ` + JSON.stringify(body || {}));
    return axios.post(URL, body || {}, this.axiosConfig)
      .then(this.logAndReturn)
      .catch(err => console.log(err.response || err));
  }

  /**
   * Connect to stream with handler.
   * 
   * The axios library does not support streams in the browser so use oboe.
   */
  stream(URL, handler) {
    console.log(`GET ${URL} stream`);
    return oboe({
        method: "GET",
        url: this.baseURL + URL,
        headers: this.headers,
      })
      .node("!", function(data) {
        // console.log("STREAM data : " + JSON.stringify(data));
        handler(data);
      }).fail(function(errorReport) {
        console.error(JSON.stringify(errorReport));
      });
  }
}

module.exports = LichessApi;
