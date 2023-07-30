const hostname = window.location.hostname;

module.exports = {
  api: {
    API_URL: `http://${hostname}:10085/api`,
    URL: `http://${hostname}:10085/api`,
  }
};
