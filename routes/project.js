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
  fs.mkdirSync(path.join(__dirname,"../", userid.toString() + "/" + projectname),{recursive:true});
      res.redirect("/user/dashboard");
});

router.get("/project/delete", checkAuthenticated, async (req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  fs.rmdirSync(path.join(__dirname,"../", userid.toString() + "/" + projectname));
  await deleteProject("sahapaathi", userid.toString() + "/" + projectname);
  res.redirect("/user/dashboard");
});

router.get("/project/download", checkAuthenticated, (req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  zl.archiveFolder(
    path.join(__dirname,"../",userid.toString(),projectname.toString()),path.join(__dirname,"../",userid.toString(),projectname.toString()+".zip")).then(()=>{
      res.download(path.join(__dirname,"../",userid.toString(),projectname.toString()+".zip"));
    }
    )
  });

router.get("/project/open", checkAuthenticated,async(req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  var fileList=  fs.readdirSync(path.join(__dirname,"../", userid + "/" + projectname),{withFileTypes:true}).filter(item=>!item.isDirectory()).map(item=>item.name)

// fs.mkdirSync(path.join(__dirname, "../", userid.toString(), projectname), {
//   recursive: true
// });
//   const s3 = new AWS.S3();

// const params = {
//   Bucket: "sahapaathi",
//   Delimiter: "/",
//   Prefix: userid.toString() + "/" + projectname + "/"
// };

// const data = await s3.listObjects(params).promise().then(data => {
//   return data;
// }).catch(err => {
//   console.log(err);
// });


// for (let index = 1; index < data["Contents"].length; index++) {
//   const params = {
//     Bucket: "sahapaathi",
//     Key: data["Contents"][index]["Key"]
//   };
//   const data2 = await s3.getObject(params).promise();
//   fs.writeFileSync(
//     path.join(
//       __dirname,"../" ,data["Contents"][index]["Key"]),
//     data2["Body"],
//   );
// }
//   fs.readdir(
//     path.join(__dirname, "../", userid.toString(), projectname),
//     (err, files) => {
//       if (err) {
//         console.log(err);
//       } else {
//         res.render("project/editor", {
//           files: files,
//           projectname: projectname,
//           userid: userid
//         });
//       }
//     }
//   );
res.render("project/editor", {
  files: fileList,
  projectname: projectname,
  userid: userid

});
});

router.get("/project/getfile*", checkAuthenticated, (req, res) => {
  const userid = req.user._id;
  const projectname = req.query.projectname;
  const file = req.query.filename;
//send the file content form local file system
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
})



module.exports = router;
