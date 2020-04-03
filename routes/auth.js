var express = require("express");
var router = express.Router();
var passport = require("passport");

//MODELS
var Student = require("../models/student.js");
var Teacher = require("../models/teacher.js");
var User = require("../models/user.js");
// var Lecture = require("../models/lecture.js");

router.get("/register",function(req,res){
    res.render("register",{currentUser : req.user});
});

router.post("/register",function(req,res){
    var tempUser = new User({username : req.body.username, role : "student"});
    var tempStudent = new Student({
        name : req.body.name,
        rollNumber : req.body.rollNumber,
        batchYear : req.body.batchYear,
        batchName : req.body.batchName
    });


    User.register(tempUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register",{currentUser : req.user});
        }
        passport.authenticate("local")(req,res,function(){
            tempStudent.authId = req.user.id;
            Student.create(tempStudent,function(err,createdStudent){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(createdStudent);
                    // res.redirect("/");
                    res.render("landing",{currentUser:req.user});
                }
            } )
        });
    } );
} );

router.get("/login",function(req,res){
    res.render("login",{currentUser : req.user});
});

router.post("/login",passport.authenticate("local",
    {   
        successRedirect : "/",
        failureRedirect : "/login"
    }) ,function(req,res){

} );

router.get("/logout",function(req,res){
    req.logout();
    res.send("LOGGED OUT");
} );

router.get("/teacher/register",function(req,res){
    res.render("teacherRegister",{currentUser:req.user});
} );

router.post("/teacher/register",function(req,res){
    // res.send("yess");
    var tempTeacher = new Teacher({
        name : req.body.name,
        staffId : req.body.staffId,
    });
    var tempUser = new User({username : req.body.username, role : "teacher"});
    User.register(tempUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register",{currentUser : req.user});
        }
        passport.authenticate("local")(req,res,function(){
            tempTeacher.authId = req.user.id;
            Teacher.create(tempTeacher,function(err,createdTeacher){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(createdTeacher);
                    // res.redirect("/");
                    res.render("landing",{currentUser:req.user});
                }
            } )
        });
    } );
} );

module.exports = router;