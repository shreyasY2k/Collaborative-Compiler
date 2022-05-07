if (process.env.NODE_ENV != "production") {
  //dotenv is used to store environment variables in a .env file which is secure
  require("dotenv").config();
}
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const port = process.env.PORT || 3000;
const { instrument } = require("@socket.io/admin-ui");
global.io = require("socket.io")(server, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});
instrument(io, {
  auth: false
});
const path = require("path");
//Load the Controller files
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const projectRouter = require("./routes/project");

const mongooose = require("mongoose");
//connect to mongo db
mongooose.connect(process.env.DB_URL, { useNewUrlParser: true });
const db = mongooose.connection;
db.on("error", err => {
  console.log(err);
});
db.once("open", () => {
  console.log("connected to database");
});

//set up the view engine to ejs for loading variables in the views
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
//Full public access to the public folder
app.use(express.static(path.join("public")));
//set the controller routes
//root url forward to index.js
app.use("/", indexRouter);
//user url forward to user.js
app.use("/user", userRouter);
//project url forward to project.js
app.use("/user/project", projectRouter);
server.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
