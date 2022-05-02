if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;
global.io = require("socket.io")(server);
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
app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/user", projectRouter);
server.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
