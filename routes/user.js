if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const initializePassport = require("../passport-config");
const fs = require("fs");
const zl = require("zip-lib");
const archiver = require("archiver");
const JSZip = require("jszip");
const path = require("path");
const AWS = require("aws-sdk");
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
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("users/login", { message: "" });
});

router.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("users/register", { message: "" });
});

router.get("/dashboard", checkAuthenticated, (req, res) => {
  const userId = req.user._id;
  fs.mkdirSync(path.join(__dirname, "../", userId.toString()),{recursive:true});
  s3.listObjectsV2(
    { Bucket: "sahapaathi", Prefix: userId.toString() + "/", Delimiter: "/" },
    function (err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
      } else {
        //list only folders inside the user folder
        var folders = data.CommonPrefixes.map(function (item) {
          return item.Prefix.split("/")[1];
        });
        // console.log(folders);
        //for each folder create a folder locally inside user folder and add their files to it
        folders.forEach(function (folder) {
          fs.mkdirSync(path.join(__dirname, "../", userId.toString(), folder),{recursive:true});
          s3.listObjectsV2(
            {
              Bucket: "sahapaathi",
              Prefix: userId.toString() + "/" + folder + "/",
              Delimiter: "/"
            },
            function (err, data) {
              if (err) {
                console.log(err, err.stack); // an error occurred
              } else {
                //list only files inside the folder
                var files = data.Contents.map(function (item) {
                  return item.Key;
                });
                console.log(files);
                //for each file download it and save it locally
                files.forEach(function (file) {
                  s3.getObject(
                    { Bucket: "sahapaathi", Key: file },
                    function (err, data) {
                      if (err) {
                        console.log(err, err.stack); // an error occurred
                      } else {
                        // console.log(data);
                        // console.log(file);
                        fs.writeFileSync(
                          path.join(
                            __dirname,
                            "../",
                            userId.toString(),
                            folder+"/",
                            file.split("/")[2]
                          ),
                          data.Body
                        );
                      }
                    }
                  );
                });
              }
            }
          );
        });
        // console.log(folders,2);
        res.render("users/dashboard", {
          files: folders,
          name: req.user.name
        });
      }
    }
  );
});

router.post("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

// Register User
router.post("/register", checkNotAuthenticated, (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  let newUser = new User({
    name: name,
    email: email,
    password: password
  });

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(err => {
        if (err) {
          //render the register page again with the error message
          res.render("users/register", {
            messages: { error: "Email Already Taken" }
          });
          return;
        } else {
          //find the userid
          User.findOne({ email: email }, (err, user) => {
            if (err) {
              console.log(err);
            } else {
              s3.putObject(
                {
                  Bucket: "sahapaathi",
                  Key: user._id.toString() + "/",
                  Body: ""
                },
                function (err, data) {
                  if (err) {
                    console.log(err, err.stack);
                  } else {
                    res.redirect("/user/login");
                  }
                }
              );
            }
          });
        }
      });
    });
  });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/user/dashboard",
    failureRedirect: "/user/login",
    failureFlash: true
  })
);

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/user/login");
  }
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/user/dashboard");
  }
  next();
}

module.exports = router;
