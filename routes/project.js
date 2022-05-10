//Output only to room
//Socket emit on get file only to requester
//change emit events to broadcast so that sender doesnot need to wait for response

if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
async function findProjectRoom(userid, projectName) {
    const userProjects = await userProjectsFilesRooms.findOne({
        userId: userid.toString(),
        projectName: projectName
    });
    return userProjects;
}
async function findProjectRoomById(roomid) {
    const userProjects = await userProjectsFilesRooms.findOne({
        roomID: roomid.toString()
    });
    return userProjects;
}
// async function deleteProject(bucket, dir) {
//   const listParams = {
//     Bucket: bucket,
//     Prefix: dir
//   };

//   const listedObjects = await s3.listObjectsV2(listParams).promise();

//   if (listedObjects.Contents.length === 0) return;

//   const deleteParams = {
//     Bucket: bucket,
//     Delete: { Objects: [] }
//   };

//   listedObjects.Contents.forEach(({ Key }) => {
//     deleteParams.Delete.Objects.push({ Key });
//   });

//   await s3.deleteObjects(deleteParams).promise();

//   if (listedObjects.IsTruncated) await deleteProject(bucket, dir);
// }
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
const activeCollabRooms = require("../models/activeCollabRooms");
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
var s3 = new AWS.S3();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
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
router.post("/create", checkAuthenticated, (req, res) => {
    //create folder for project inside user folder
    const userid = req.user._id;
    const projectname = req.body.projectName;
    fs.mkdirSync(
        path.join(__dirname, "../", userid.toString() + "/" + projectname), { recursive: true }
    );
    //create a unique room if for the project and add it to folder array
    const room = Math.random().toString(36).substring(7);
    //add these to the database
    const userProjectsFilesRoomsSchema = new userProjectsFilesRooms({
        userId: userid.toString(),
        projectName: projectname,
        roomID: room,
        projectPath: path.join(
            __dirname,
            "../",
            userid.toString() + "/" + projectname
        ),
        files: []
    });
    userProjectsFilesRoomsSchema.save();

    //get list of folders inside user folder local
    const userFolder = path.join(__dirname, "../", userid.toString());
    const userFolderList = fs.readdirSync(userFolder);
    var images = ['/img/photos/img1.jpg', '/img/photos/img2.jpg', '/img/photos/img3.jpg', '/img/photos/img4.jpg', '/img/photos/img5.jpg', '/img/photos/img6.jpg', '/img/photos/img7.jpg', '/img/photos/img8.jpg', '/img/photos/img9.jpg', '/img/photos/img10.jpg', '/img/photos/img11.jpg']
        //create an aray of images equal to the number of folders
    var imageArray = [];
    for (var i = 0; i < userFolderList.length; i++) {
        imageArray.push(images[Math.floor(Math.random() * images.length)]);
    }
    res.render("users/dashboard", {
        name: req.user.name,
        image: imageArray,
        files: userFolderList,
        name: req.user.name,
        error: ''
    });
});

router.get("/delete", checkAuthenticated, async(req, res) => {
    const userid = req.user._id;
    const projectname = req.query.projectname;
    fs.rmSync(
        path.join(__dirname, "../", userid.toString() + "/" + projectname), { recursive: true }
    );
    // await deleteProject(
    //   process.env.AWS_S3_BUCKET_NAME,
    //   userid.toString() + "/" + projectname
    // );
    await userProjectsFilesRooms.deleteOne({
        userId: userid.toString(),
        projectname: projectname
    });
    res.redirect("/user/dashboard");
});

router.get("/download", checkAuthenticated, (req, res) => {
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

router.get("/open", checkAuthenticated, async(req, res) => {
    const userId = req.user._id;
    const projectname = req.query.projectname;
    const projectRoom = await findProjectRoom(userId.toString(), projectname);
    // console.log("projectRoom: " + projectRoom);
    var fileList = fs
        .readdirSync(
            path.join(__dirname, "../", userId.toString() + "/" + projectname), {
                withFileTypes: true
            }
        )
        .filter(item => !item.isDirectory())
        .map(item => item.name);
    res.render("project/editor", {
        isHost: true,
        files: fileList,
        projectname: projectname,
        projectRoomID: projectRoom.roomID,
        projectPath: projectRoom.projectPath
    });
});

io.on("connection", socket => {
    socket.on("join", async data => {
        var isHost = false;
        var userPRooms = await findProjectRoomById(data.projectRoomID);
        if (userPRooms.userId.toString() === socket.request.user._id.toString()) {
            isHost = true;
        }
        socket.join(userPRooms.roomID);
        socket.emit("roomDetails", {
            userName: socket.request.user.name,
            projectPath: userPRooms.projectPath,
            projectRoomID: userPRooms.roomID,
            isHost: isHost
        });
    });
    //listen for addFile event
    socket.on("addFile", async data => {
        if (!fs.existsSync(path.join(data.projectPath, data.fileName))) {
            const fileRoomID = Math.random().toString(36).substring(7);
            const query = userProjectsFilesRooms.updateOne({ roomID: data.projectRoomID }, {
                $push: {
                    files: {
                        $each: [{ fileName: data.fileName, fileRoom: fileRoomID }]
                    }
                }
            });
            await query.exec();
            fs.writeFileSync(
                path.join(data.projectPath, data.fileName),
                data.fileContent
            );
            io.to(data.projectRoomID).emit("addFile", data.fileName);
        }
    });

    socket.on("deleteFile", async data => {
        if (fs.existsSync(path.join(data.projectPath, data.fileName))) {
            fs.unlinkSync(path.join(data.projectPath, data.fileName));
            //remove file from database
            const query = userProjectsFilesRooms.updateOne({ roomID: data.projectRoomID }, {
                $pull: {
                    files: { fileName: data.fileName }
                }
            });
            await query.exec();
            io.to(data.projectRoomID).emit("deleteFile", data.fileName);
        }
    });

    //listen for renameFile event
    socket.on("renameFile", async data => {
        if (fs.existsSync(path.join(data.projectPath, data.oldFileName))) {
            fs.renameSync(
                path.join(data.projectPath, data.oldFileName),
                path.join(data.projectPath, data.newFileName)
            );

            var newFileRoomID = Math.random().toString(36).substring(7);

            const deleteFileName = userProjectsFilesRooms.updateOne({ roomID: data.projectRoomID }, {
                $pull: {
                    files: { fileName: data.oldFileName }
                }
            });
            await deleteFileName.exec();
            const addFileName = userProjectsFilesRooms.updateOne({ roomID: data.projectRoomID }, {
                $push: {
                    files: {
                        $each: [{ fileName: data.newFileName, fileRoom: newFileRoomID }]
                    }
                }
            });
            await addFileName.exec();
            io.to(data.projectRoomID).emit("renameFile", {
                projectName: data.projectName,
                oldFileName: data.oldFileName,
                newFileName: data.newFileName
            });
        }
    });
    socket.on("getFile", async data => {
        //get file content
        const fileContent = fs.readFileSync(
            path.join(data.projectPath, data.fileName),
            "utf8"
        );
        //search the files array in room id document for the file name
        const query = userProjectsFilesRooms.findOne({ roomID: data.projectRoomID }, { files: { $elemMatch: { fileName: data.fileName } } });
        const file = await query.exec();
        socket.join(file.files[0].fileRoom);
        socket.emit("fileContent", {
            fileRoomID: file.files[0].fileRoom,
            projectName: data.projectName,
            fileName: data.fileName,
            fileContent: fileContent
        });
    });
    socket.on('message', async data => {
        // console.log(data);
        socket.broadcast.to(data.fileRoomID).emit('text', data.text);
    })
    socket.on("updateFile", data => {
        fs.writeFileSync(
            path.join(data.projectPath, data.fileName),
            data.fileContent
        );
        socket.broadcast.to(data.fileRoomID).emit("updateFileC", {
            projectName: data.projectName,
            fileName: data.fileName,
            fileContent: data.fileContent
        });
    });
    socket.on("autoSuggest", file => {
        var question = file.lineContent;
        var fileRoomID = file.fileRoomID;
        //fetch request to codegrepper
        fetch(
                "https://www.codegrepper.com/api/search.php?q=" +
                question +
                "&search_options=search_titles"
            )
            .then(res => res.json())
            .then(data => {
                io.to(fileRoomID).emit("autoSuggest", {
                    data: data,
                    lineNumber: file.lineNumber
                });
            });
    });

    socket.on("chat", data => {
        socket.broadcast.to(data.projectRoomID).emit("chat", {
            userName: data.userName,
            message: data.message,
            isHost: data.isHost
        });
    })


    socket.on("compile", async file => {
        var fileRoomID = file.fileRoomID;
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
                io.to(fileRoomID).emit("compileOutput", { output: data.output });
            })
            .catch(error => alert(error.message));
    });
    socket.on("disconnect", () => {});
});

router.post("/joinRoom", checkAuthenticated, async(req, res) => {
    var roomId = req.body.roomID;
    //check if room id exists in database
    if (await activeCollabRooms.findOne({ collabRoomID: roomId })) {
        const projectRoom = await findProjectRoomById(roomId);
        var fileList = fs.readdirSync(projectRoom.projectPath);
        res.render("project/editor", {
            isHost: false,
            files: fileList,
            projectname: projectRoom.projectName,
            projectRoomID: projectRoom.roomID
        });
    } else {
        res.redirect("/user/dashboard");
    }
});

router.post(
    "/startCollaboration",
    checkAuthenticated,
    async(req, res) => {
        var roomId = req.body.projectRoomID;
        const collabRoomId = await activeCollabRooms.findOne({
            collabRoomID: roomId
        });
        if (collabRoomId == null) {
            const query = new activeCollabRooms({
                collabRoomID: roomId
            });
            await query.save();
        }
        res.send({ status: "success" });
    }
);

router.post(
    "/stopCollaboration",
    checkAuthenticated,
    async(req, res) => {
        var roomId = req.body.projectRoomID;
        await activeCollabRooms.findOneAndDelete({
            collabRoomID: roomId
        });
        res.send({ status: "success" });
    }
);

module.exports = router;