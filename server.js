if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const path = require("path");
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const projectRouter = require("./routes/project");
const mongooose = require("mongoose");

mongooose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongooose.connection;
db.on("error", err => {
  console.log(err);
});
db.once("open", () => {
  console.log("connected to database");
});
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(path.join("public")));

const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer, {
});

module.exports.io = io;

httpServer.listen(3000);
app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/user", projectRouter);

// app.listen(process.env.PORT || 3000);
