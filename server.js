const express = require("express");
const db2 = require("./dbs");
// const compression = require("compression");
const socketIO = require("socket.io");
const http = require("http");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const port = process.env.PORT;
const RemoteDB = process.env.REMOTE_DB;
const LocalDb = process.env.LOCAL_DB;

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "5mb" }));

const infoRouter = require("./Router");
const schemaRouter = require("./Schema");

//modified

app.use("/info", infoRouter);

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find document!");
});

// connecting db
mongoose.connect(RemoteDB).then((client, err) => {
  if (!err) {
    console.log("db connected");
    // connectDb();
  }
});

db2.conn2.on("open", () => console.log("connected to db2"));

// const connectDb = () => {
//   app.listen(port, () => {
//     console.log(`server started on ${port}`);
//   });
// };

const httpServer = createServer(app);

httpServer.listen(port, () => {
  console.log("server started on 5000");
});

const io = socketIO(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", async (socket) => {
  console.log("A new client connected");
  const findData = await schemaRouter.find();
  socket.on("requestData", () => {
    socket.emit("message", findData);
    socket.broadcast.emit("message", findData);
  });
});
