if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}
const express = require("express");
const router = express.Router();
//passwords hashing package
const bcrypt = require("bcrypt");
const User = require("../models/user");
//User authentication package
const passport = require("passport");
const flash = require("express-flash");
//session initalization package
const session = require("express-session");
const initializePassport = require("../passport-config");
//CRUD on locally stored files
const fs = require("fs");
const path = require("path");
//package to connect to s3 bucket
const AWS = require("aws-sdk");
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
var s3 = new AWS.S3();
router.use(express.urlencoded({ extended: false }));
router.use(flash());
const sessionMiddleware = session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
});
router.use(
    sessionMiddleware
);
router.use(express.static(path.join(__dirname, "../", "public")));

router.use(passport.initialize());
router.use(passport.session());
initializePassport(passport);
// router.get("/", (req, res) => {
//   res.render("index");
// });

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) =>
    middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

router.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("users/login", { message: "" });
});

router.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("users/register", { message: "" });
});

router.get("/dashboard", checkAuthenticated, (req, res) => {
    const userId = req.user._id;
    //if user folder exists
    if (fs.existsSync(path.join(__dirname, "../", userId.toString()))) {
        //get list of folders inside user folder local
        const userFolder = path.join(__dirname, "../", userId.toString());
        const userFolderList = fs.readdirSync(userFolder);
        var images = ['/img/photos/img1.jpg', '/img/photos/img2.jpg', '/img/photos/img3.jpg', '/img/photos/img4.jpg', '/img/photos/img5.jpg', '/img/photos/img6.jpg', '/img/photos/img7.jpg', '/img/photos/img8.jpg', '/img/photos/img9.jpg', '/img/photos/img10.jpg', '/img/photos/img11.jpg']
        var imageArray = [];
        for (var i = 0; i < userFolderList.length; i++) {
            imageArray.push(images[Math.floor(Math.random() * images.length)]);
        }
        res.render("users/dashboard", {
            name: req.user.name,
            image: imageArray,
            files: userFolderList,
            name: req.user.name,
            error: req.flash("error")[0]
        });
    } else {
        fs.mkdirSync(path.join(__dirname, "../", userId.toString()), {
            recursive: true
        });
        s3.listObjectsV2({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Prefix: userId.toString() + "/",
                Delimiter: "/"
            },
            function(err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                } else {
                    //list only folders inside the user folder
                    var folders = data.CommonPrefixes.map(function(item) {
                        return item.Prefix.split("/")[1];
                    });
                    //for each folder create a folder locally inside user folder and add their files to it
                    folders.forEach(function(folder) {
                        fs.mkdirSync(path.join(__dirname, "../", userId.toString(), folder), {
                            recursive: true
                        });
                        s3.listObjectsV2({
                                Bucket: process.env.AWS_S3_BUCKET_NAME,
                                Prefix: userId.toString() + "/" + folder + "/",
                                Delimiter: "/"
                            },
                            function(err, data) {
                                if (err) {
                                    console.log(err, err.stack); // an error occurred
                                } else {
                                    var files = data.Contents.map(function(item) {
                                        return item.Key;
                                    });
                                    for (var i = 1; i < files.length; i++) {
                                        fileName = files[i].split("/")[2];
                                        s3.getObject({
                                                Bucket: process.env.AWS_S3_BUCKET_NAME,
                                                Key: files[i]
                                            },
                                            function(err, data) {
                                                if (err) {
                                                    console.log(err, err.stack); // an error occurred
                                                } else {
                                                    fs.writeFileSync(
                                                        path.join(
                                                            __dirname,
                                                            "../",
                                                            userId.toString(),
                                                            folder,
                                                            fileName
                                                        ),
                                                        data.Body
                                                    );
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        );
                    });
                    const userFolder = path.join(__dirname, "../", userId.toString());
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
                }
            }
        );
    }
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
                            s3.putObject({
                                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                                    Key: user._id.toString() + "/",
                                    Body: ""
                                },
                                function(err, data) {
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

//on user logout or session timeout upload user folder to s3


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