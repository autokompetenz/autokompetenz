const { cors } = require('../lib/middleware');

module.exports = async function handler(req, res) {
  if (cors(req, res)) return;
  res.json({ status: 'ok', service: 'Auto Kompetenz GmbH API', version: '2.0.0', time: new Date().toISOString() });
};
