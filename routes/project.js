if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
async function deleteProject(bucket, dir) {
  const listParams = {
    Bucket: bucket,
    Prefix: dir
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: bucket,
    Delete: { Objects: [] }
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await deleteProject(bucket, dir);
}
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/user/login");
  }
}
const express = require("express");
const router = express.Router();
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("../passport-config");
const zl = require("zip-lib");
const path = require("path");
const AWS = require("aws-sdk");
const fs = require("fs");
const fetch = require("node-fetch");
const { request } = require("http");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
var s3 = new AWS.S3();
router.use(express.urlencoded({ extended: false }));
const sessionMiddleware = session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
});
router.use(flash());
router.use(sessionMiddleware);
router.use(express.static(path.join(__dirname, "../", "public")));

router.use(passport.initialize());
router.use(passport.session());
initializePassport(passport);
// convert a connect middleware to a Socket.IO middleware
// const wrap = middleware => (socket, next) =>
//   middleware(socket.request, {}, next);

// io.use(wrap(sessionMiddleware));
// io.use(wrap(passport.initialize()));
// io.use(wrap(passport.session()));

io.use((socket, next) => {
  if (socket.request.user) {
    // console.log(socket.request.user);
    next();
  } else {
    next(new Error("unauthorized"));
  }
});
router.post("/project/create", checkAuthenticated, (req, res) => {
  //create folder for project inside user folder
  const userid = req.user._id;
  const projectname = req.body.projectName;
  fs.mkdirSync(
    path.join(__dirname, "../", userid.toString() + "/" + projectname),
    { recursive: true }
  );
  //get list of folders inside user folder local
  const userFolder = path.join(__dirname, "../", userid.toString());
  const userFolderList = fs.readdirSync(userFolder);
  res.render("users/dashboard", {
    files: userFolderList,
    name: req.user.name
  });
});

router.get("/project/delete", checkAuthenticated, async (req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  fs.rmSync(
    path.join(__dirname, "../", userid.toString() + "/" + projectname),
    { recursive: true }
  );
  await deleteProject(
    process.env.AWS_S3_BUCKET_NAME,
    userid.toString() + "/" + projectname
  );
  res.redirect("/user/dashboard");
});

router.get("/project/download", checkAuthenticated, (req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  zl.archiveFolder(
    path.join(__dirname, "../", userid.toString(), projectname.toString()),
    path.join(
      __dirname,
      "../",
      userid.toString(),
      projectname.toString() + ".zip"
    )
  ).then(() => {
    res.download(
      path.join(
        __dirname,
        "../",
        userid.toString(),
        projectname.toString() + ".zip"
      )
    );
  });
});
var usersSocket={
  users:[],
  projectPath:'',
  userID:'',
  socketID:''
}
io.on('connection', (socket) => {
  //create room for project and get project name form socket query
  // console.log("user connected");
  const projectname = socket.handshake.query.projectname;
  const userid = socket.request.user._id;
  const projectPath = path.join(
    __dirname,
    "../",
    userid.toString(),
    projectname.toString()
  );
  // console.log(projectname);
  socket.join(projectPath);
  usersSocket.users.push(socket.id);
  usersSocket.projectPath = projectPath;
  usersSocket.userID = userid;
  usersSocket.socketID = socket.id;
  console.log(usersSocket);
  // console.log(socket.rooms);
  io.sockets.in(projectPath).emit('roomConnected', socket.request.user._id.toString() + "/" + projectname);

socket.on("deleteFile", file => {
  // console.log(projectPath);
  // var pp = path.join(projectPath, file.fileName);
  // console.log(pp);
  if (
    fs.existsSync(
      path.join("625ea363d882d34d42aba3cd" + "/", "A", file.fileName)
    )
  ) {
    fs.unlinkSync(
      path.join("625ea363d882d34d42aba3cd" + "/", "A", file.fileName)
    );
    //emit to all users in room
    io.sockets
      .in(usersSocket.socketID)
      .emit("deleteFile", file.projectName, file.fileName);
    // socket.emit("deleteFile", file.projectName, file.fileName);
  }
});
socket.on("join", (socketID) => {
  socket.join(socketID);
})
//listen for addFile event
socket.on("addFile", file => {
  if (
    !fs.existsSync(
      path.join(
        __dirname,
        "../",
        socket.request.user._id.toString(),
        file.projectName,
        file.fileName
      )
    )
  ) {
    fs.writeFileSync(
      path.join(
        __dirname,
        "../",
        socket.request.user._id.toString(),
        file.projectName,
        file.fileName
      ),
      file.fileContent
    );
    socket.emit("addFile", file.projectName, file.fileName);
  }
});

//listen for renameFile event
socket.on("renameFile", file => {
  if (
    fs.existsSync(
      path.join(
        __dirname,
        "../",
        socket.request.user._id.toString(),
        file.projectName,
        file.oldFileName
      )
    )
  ) {
    fs.renameSync(
      path.join(
        projectPath,
        file.oldFileName
      ),
      path.join(
       projectPath,
        file.newFileName
      )
    );
    socket
      .emit("renameFile", file.projectName, file.oldFileName, file.newFileName);
  }
});

socket.on("updateFile", file => {
  fs.writeFileSync(
    path.join(
      projectPath,
      file.fileName
    ),
    file.fileContent
  );
  socket
    .emit("updateFile", file.projectName, file.fileName, file.fileContent);
});

socket.on("getFile", file => {
  //get file content
  const fileContent = fs.readFileSync(
    path.join(
      projectPath,
      file.fileName
    ),
    "utf8"
  );
  socket.emit("fileContent", {
      projectName: file.projectName,
      fileName: file.fileName,
      fileContent: fileContent
    });
});

socket.on("autoSuggest", file => {
  var question = file.lineContent;
  //fetch request to codegrepper
  fetch(
    "https://www.codegrepper.com/api/search.php?q=" +
      question +
      "&search_options=search_titles"
  )
    .then(res => res.json())
    .then(data => {
      socket
        .emit("autoSuggest", { data: data, lineNumber: file.lineNumber });
    });
});
socket.on("compile", async file => {
  await fetch("https://codeorbored.herokuapp.com", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: file.body
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
     socket
        .emit("compileOutput", { output: data.output });
    })
    .catch(error => alert(error.message));
});
  socket.on('disconnect', () => {
    socket.leave(socket.request.user._id.toString() + "/" + projectname);
  });
})
router.get("/project/open", checkAuthenticated, async (req, res) => {
  const userId = req.user._id;
  const projectname = req.query.projectname;

  var fileList = fs
    .readdirSync(path.join(__dirname, "../", userId + "/" + projectname), {
      withFileTypes: true
    })
    .filter(item => !item.isDirectory())
    .map(item => item.name);

  res.render("project/editor", {
    files: fileList,
    projectname: projectname,
    socketID:""
  });
});

router.post("/project/joinRoom",(req,res)=>{
  var projectPath = req.body.roomID;
  //find usersSocket which has the same projectPath
  console.log(usersSocket);
  // var userSocket = usersSocket.values.find(
  //   item => item.projectPath === projectPath
  // );
  // //get socket id from usersSocket
  // console.log(userSocket);
  var socketID = usersSocket.socketID;
  //read files from projectPath
  var fileList = fs
    .readdirSync(path.join(__dirname, "../", projectPath), {
    })

  res.render("project/editor", {
    files: fileList,
    projectname: projectPath.split("/")[1],
    socketID: socketID
  });
})

module.exports = router;
