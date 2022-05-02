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
var userSockets=[]
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
  userSockets.push({
    projectPath:projectPath,
    userID:userid.toString(),
    socketID:socket.id
  });
  socket.join(socket.id);
  socket.emit("roomConnected", socket.id);
  socket.emit("path", {projectPath:projectPath,id:socket.id});

socket.on("deleteFile", file => {
  // console.log(file);
  // var userSocket = userSockets.find(userSocket => userSocket.socketID === socket.id);
  // console.log(userSocket);
  if (fs.existsSync(path.join(file.projectPath, file.fileName))) {
    fs.unlinkSync(path.join(file.projectPath, file.fileName));
    io.to(file.id).emit("deleteFile", file.fileName);
  }
});
socket.on("join", (socketID) => {
  var userSocket = userSockets.find(userSocket => userSocket.socketID === socketID.socketID);
  // console.log(userSocket,162);
  socket.join(userSocket.socketID);
  socket.emit("path", { projectPath: userSocket.projectPath, id: userSocket.socketID });
})
//listen for addFile event
socket.on("addFile", file => {
  if (
    !fs.existsSync(
      path.join(
        file.projectPath,
        file.fileName
      )
    )
  ) {
    fs.writeFileSync(
      path.join(
        file.projectPath,
        file.fileName
      ),
      file.fileContent
    );
    io.to(file.id).emit("addFile", file.fileName);
  }
});

//listen for renameFile event
socket.on("renameFile", file => {
  if (
    fs.existsSync(
      path.join(
        file.projectPath,
        file.oldFileName
      )
    )
  ) {
    fs.renameSync(
      path.join(file.projectPath, file.oldFileName),
      path.join(file.projectPath, file.newFileName)
    );
    io.to(file.id).emit(
      "renameFile",
      file.projectName,
      file.oldFileName,
      file.newFileName
    );
  }
});

socket.on("updateFile", file => {
  fs.writeFileSync(
    path.join(
      file.projectPath,
      file.fileName
    ),
    file.fileContent
  );
  io.to(file.id)
    .emit("updateFile", file.projectName, file.fileName, file.fileContent);
});

socket.on("getFile", file => {
  //get file content
  const fileContent = fs.readFileSync(
    path.join(
      file.projectPath,
      file.fileName
    ),
    "utf8"
  );
  io.to(file.id).emit("fileContent", {
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

router.post("/project/joinRoom",checkAuthenticated,(req,res)=>{
  var roomID = req.body.roomID;
  var socketID = userSockets.find(userSocket => userSocket.socketID === roomID);
  var fileList = fs.readdirSync(socketID.projectPath);
  res.render("project/editor", {
    files: fileList,
    projectname: socketID.projectPath.split("\\")[6],
    socketID: socketID.socketID
  });
})

module.exports = router;
