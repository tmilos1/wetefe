const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const conf = require("rc")("wtf", { PORT: 3001 });
require("./db-models-loader");

const acronyms = require("./components/acronyms");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/acronym", acronyms.routes);

app.listen(conf.PORT, () => {
  console.log("Listening on port " + conf.PORT);
});

module.exports = app; // for testing
