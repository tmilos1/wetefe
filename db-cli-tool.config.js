const conf = require("rc")("wtf");

module.exports = {
  development: {
    storage: conf.db.storage,
    dialect: conf.db.dialect,
  },
};
