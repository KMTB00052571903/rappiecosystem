const app = require('../dist/app.js')
const serverless = require('serverless-http')

module.exports = serverless(app)