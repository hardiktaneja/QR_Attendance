var express = require("express");
var router = express.Router();

var Student = require("../models/student.js");
// var Teacher = require("../models/teacher.js");
var Lecture = require("../models/lecture.js");

router.get("/student/:id/addAttendance",isLoggedIn,function(req,res){
    res.render("rollNumberForm",{id:req.params.id,currentUser : req.user});
} );

router.post("/student/:id/addAttendance",isLoggedIn,function(req,res){
    //Getting Request Params - roll-number, lecture-id
    var rollNumberAdd = req.body.rollNumber;
    var lectureID = req.params.id;

    //Get Lecture from ID
    Lecture.findById(lectureID,function(err,foundLecture){
        //If Error Console.log it
        if(err){
            console.log("COULDN'T FIND THE LECTURE");
            console.log(err);
        }
        //Else Add Students Attendance and Save It
        else{
            Student.findOne({"rollNumber":rollNumberAdd},function(err,foundStudent){
                //If Error Console.log it
                if(err){
                    console.log("WEEEEEE");
                    console.log(err);
                }
                else{
                    // Else add to students and SAVEE!
                    foundLecture.students.push(foundStudent["_id"]);
                    foundLecture.save(function(err,foundLecture){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log(foundLecture);
                            console.log("SUCCESS");
                            res.redirect("/teacher/getLectures");
                        }
                    });
                    
                }
            });
        }
    });
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated() ){
        return next() ;
    }
    res.redirect("/login");
}

function isLoggedInAndRoleCheck(req,res,next){
    if(req.isAuthenticated() && req.user.role=="teacher"){
        return next() ;
    }
    // res.redirect("/login");
    res.send("You are not a teacher")
}

module.exports = router;