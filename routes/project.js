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
const io = require("socket.io")(8080, {
  cors: {
    origin: "https://my-collab-editor.herokuapp.com",
    methods: ["GET", "POST"]
  }
});
const fetch = require("node-fetch");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
var s3 = new AWS.S3();
router.use(express.urlencoded({ extended: false }));
router.use(flash());
router.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  })
);
router.use(express.static(path.join(__dirname, "../", "public")));

router.use(passport.initialize());
router.use(passport.session());
initializePassport(passport);

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
  console.log(userFolderList);
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
var userid;
io.on("connection", socket => {
  console.log("a user connected");
  socket.on("deleteFile", file => {
    if (
      fs.existsSync(
        path.join(
          __dirname,
          "../",
          userid.toString(),
          file.projectName,
          file.fileName
        )
      )
    ) {
      fs.unlinkSync(
        path.join(
          __dirname,
          "../",
          userid.toString(),
          file.projectName,
          file.fileName
        )
      );
      socket.emit("deleteFile", file.projectName, file.fileName);
    }
  });

  //listen for addFile event
  socket.on("addFile", file => {
    if (
      !fs.existsSync(
        path.join(
          __dirname,
          "../",
          userid.toString(),
          file.projectName,
          file.fileName
        )
      )
    ) {
      fs.writeFileSync(
        path.join(
          __dirname,
          "../",
          userid.toString(),
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
    console.log("file rename");
    if (
      fs.existsSync(
        path.join(
          __dirname,
          "../",
          userid.toString(),
          file.projectName,
          file.oldFileName
        )
      )
    ) {
      fs.renameSync(
        path.join(
          __dirname,
          "../",
          userid.toString(),
          file.projectName,
          file.oldFileName
        ),
        path.join(
          __dirname,
          "../",
          userid.toString(),
          file.projectName,
          file.newFileName
        )
      );
      socket.emit(
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
        __dirname,
        "../",
        userid.toString(),
        file.projectName,
        file.fileName
      ),
      file.fileContent
    );
    socket.emit("updateFile", file.projectName, file.fileName);
  });

  socket.on("getFile", file => {
    //get file content
    const fileContent = fs.readFileSync(
      path.join(
        __dirname,
        "../",
        userid.toString(),
        file.projectName,
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
        //send response to client
        socket.emit("autoSuggest", { data: data, lineNumber: file.lineNumber });
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
        socket.emit("compileOutput", { output: data.output });
      })
      .catch(error => alert(error.message));
  });

  socket.on("disconnect", () => {
    //destroy socket connection
    console.log("user disconnected");
    socket.removeAllListeners();
    socket.leave(socket.id);
    socket.disconnect();
  });
});
router.get("/project/open", checkAuthenticated, async (req, res) => {
  userid = req.user._id;
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
    projectname: projectname
  });
});

router.get("/project/getFile*", checkAuthenticated, (req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  const file = req.query.filename;
  fs.readFile(
    path.join(__dirname, "../", userid.toString(), projectname, file),
    (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.send(data);
      }
    }
  );
});

router.get("/project/addFile*", checkAuthenticated, (req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  const file = req.query.filename;
  fs.writeFile(
    path.join(__dirname, "../", userid.toString(), projectname, file),
    "",
    err => {
      if (err) {
        console.log(err);
      } else {
        res.send("File created");
      }
    }
  );
});

router.get("/project/updateFile*", checkAuthenticated, (req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  const file = req.query.newfilename;
  const oldfilename = req.query.oldfilename;

  fs.rename(
    path.join(
      __dirname,
      "../",
      userid.toString(),
      projectname.toString(),
      oldfilename.toString()
    ),
    path.join(
      __dirname,
      "../",
      userid.toString(),
      projectname.toString(),
      file.toString()
    ),
    err => {
      if (err) {
        console.log(err);
      } else {
        res.send("File updated");
      }
    }
  );
});

router.get("/project/deleteFile*", checkAuthenticated, (req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  const file = req.query.filename;
  fs.unlink(
    path.join(__dirname, "../", userid.toString(), projectname, file),
    err => {
      if (err) {
        console.log(err);
      } else {
        res.send("File deleted");
      }
    }
  );
});

module.exports = router;
