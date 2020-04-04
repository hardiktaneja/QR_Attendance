var express = require("express");
var router = express.Router();
var passport = require("passport");

//MODELS
var Student = require("../models/student.js");
var Teacher = require("../models/teacher.js");
var User = require("../models/user.js");
// var Lecture = require("../models/lecture.js");

router.get("/register",function(req,res){
    res.render("register");
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
            req.flash("error",err.message);
            res.redirect("back");
        }
        passport.authenticate("local")(req,res,function(){
            tempStudent.authId = req.user.id;
            Student.create(tempStudent,function(err,createdStudent){
                if(err){
                    console.log(err);
                    req.flash("error","Couldn't create Student!");
                }
                else{
                    console.log(createdStudent);
                    // res.redirect("/");
                    req.flash("success","Succesfully Registered!");
                    res.render("landing");
                }
            } )
        });
    } );
} );

router.get("/login",function(req,res){
    res.render("login",{message : req.flash("error") });
});

router.post("/login",passport.authenticate("local",
    {   
        successRedirect : "/checkPrev",
        failureRedirect : "/login"
    }) ,function(req,res){

} );

router.get("/checkPrev",function(req,res){
    res.redirect(req.session.returnTo || '/');
} );

router.get("/logout",function(req,res){
    req.logout();
    req.flash("success","Logged you out!");
    res.redirect("/");
    req.session.destroy();
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
            req.flash("error",err.message);
            return res.render("register",{});
        }
        passport.authenticate("local")(req,res,function(){
            tempTeacher.authId = req.user.id;
            Teacher.create(tempTeacher,function(err,createdTeacher){
                if(err){
                    req.flash("error","Couldn't create Teacher!");
                    console.log(err);
                    res.redirect("back");
                }
                else{
                    console.log(createdTeacher);
                    // res.redirect("/");
                    req.flash("success","Successfully Registered!");
                    res.render("landing");
                }
            });
        });
    });
} );

module.exports = router;