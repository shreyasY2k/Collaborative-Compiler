if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
async function findProjectRoom(id, projectName) {
  const userProjects = await userProjectsFilesRooms.findOne({
    userID: id,
    projectPath: path.join(__dirname, "../", id.toString() + "/" + projectName)
  });
  return userProjects;
}
async function findProjectRoomById(id) {
  const userProjects = await userProjectsFilesRooms.findOne({
    roomID: id
  });
  return userProjects;
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
const userProjectsFilesRooms = require("../models/userProjectsFilesRooms");
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
  //create a unique room if for the project and add it to folder array
  const room = Math.random().toString(36).substring(7);
  //add these to the database
  const userProjectsFilesRoomsSchema = new userProjectsFilesRooms({
    userId: userid,
    roomID: room,
    projectPath: path.join(
      __dirname,
      "../",
      userid.toString() + "/" + projectname
    ),
    files: []
  });
  userProjectsFilesRoomsSchema.save();

  //insert to userProjectsFilesRooms
  // userProjectsFilesRooms.insertOne({
  //   userId: userid,
  //   roomID: room,
  //   projectPath: path.join(__dirname, "../", userid.toString() + "/" + projectname),
  //   files: []
  // });
  // userProjectRooms.push({
  //   userID: req.user._id.toString(),
  //   projectPath: path.join(
  //     __dirname,
  //     "../",
  //     userid.toString() + "/" + projectname
  //   ),
  //   roomID: room
  // });
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
io.on('connection', (socket) => {

socket.on("deleteFile", file => {
  if (fs.existsSync(path.join(file.projectPath, file.fileName))) {
    fs.unlinkSync(path.join(file.projectPath, file.fileName));
    io.to(file.id).emit("deleteFile", file.fileName);
  }
});
socket.on("join", async (socketID) => {
  var userPRooms = await findProjectRoomById(socketID.socketID);
  console.log(userPRooms);
  // console.log(userSocket,162);
  socket.join(userPRooms.roomID);
  socket.emit("path", {
    projectPath: userPRooms.projectPath,
    id: userPRooms.roomID
  });
})
//listen for addFile event
socket.on("addFile", async file => {
  if (
    !fs.existsSync(
      path.join(
        file.projectPath,
        file.fileName
      )
    )
  ) {
    //generate a unique id for the file and add it to the database
    const fileId = Math.random().toString(36).substring(7);
    //add filename:fileId to the database where roomID is the roomID of the project
    const query  = userProjectsFilesRooms.updateOne(
      { roomID: file.id },
      { $push: { files: { $each: [{ fileName: file.fileName, fileRoom:fileId }] } } }
    );
    await query.exec();
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

socket.on("getFile", async file => {
  //get file content
  const fileContent = fs.readFileSync(
    path.join(
      file.projectPath,
      file.fileName
    ),
    "utf8"
  );
  //search for file in database and get fileId
  const query = userProjectsFilesRooms.findOne({
    roomID: file.id,
    files: { $elemMatch: { fileName: file.fileName } }
  });
  //join the room
  const fileId = await query.exec();
  socket.join(fileId.fileRoom);
  io.to(fileId.fileRoom).emit("fileContent", {
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
  });
})

router.get("/project/open", checkAuthenticated, async (req, res) => {
  const userId = req.user._id;
  const projectname = req.query.projectname;
  const projectRoom = await findProjectRoom(userId, projectname);
  var fileList = fs
    .readdirSync(path.join(__dirname, "../", userId.toString() + "/" + projectname), {
      withFileTypes: true
    })
    .filter(item => !item.isDirectory())
    .map(item => item.name);
    console.log(projectRoom);
  res.render("project/editor", {
    files: fileList,
    projectname: projectname,
    roomID: projectRoom.roomID,
    projectPath: projectRoom.projectPath
  });
});

router.post("/project/joinRoom",checkAuthenticated, async(req,res)=>{
  var roomId = req.body.roomID;
  const projectRoom = await findProjectRoomById(roomId);
  var fileList = fs.readdirSync(projectRoom.projectPath);
  res.render("project/editor", {
    files: fileList,
    projectname: projectRoom.projectPath.split("\\")[6],
    roomID: projectRoom.roomID
  });
})

module.exports = router;
