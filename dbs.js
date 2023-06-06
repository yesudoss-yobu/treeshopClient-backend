const mongoose = require("mongoose");
require("dotenv").config();
const schema = require("./DummySchema");

const conn1 = mongoose.createConnection(process.env.REMOTE_DB);

const conn2 = mongoose.createConnection(process.env.SAMPLE_REMOTE_DB);
const model2 = conn2.model("dummy", schema);

module.exports = { conn2: conn2, model2: model2 };
