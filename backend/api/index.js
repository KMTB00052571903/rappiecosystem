const serverless = require('serverless-http');

let handler;

module.exports = async (req, res) => {
  if (!handler) {
    const app = require('../dist/app').default;
    handler = serverless(app);
  }
  return handler(req, res);
};
