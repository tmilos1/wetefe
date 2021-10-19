"use strict";

const path = require("path");
const glob = require("glob");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("rc")("wtf").db;

const db = {};

let sequelize;

sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const files = glob.sync("components/**/*Model.js");
files.forEach((file) => {
  const model = require(path.join(__dirname, file))(
    sequelize,
    Sequelize.DataTypes
  );
  db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;
if (env == "development" && config.syncModels) {
  db.sequelize.sync();
}
db.Sequelize = Sequelize;

module.exports = db;
