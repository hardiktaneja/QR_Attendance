var express = require("express");
var router = express.Router();
var qrcode = require("qrcode");

// var Student = require("../models/student.js");
var Teacher = require("../models/teacher.js");
var Lecture = require("../models/lecture.js");

router.get("/teacher",isLoggedIn,roleCheck,function(req,res){
    Teacher.find({authId : req.user.id}).populate("lecturesTaken").exec(function(err,teacher){
        if(err){
            console.log(err);
            res.send("Teacher Not Found !");
        }
        else{
            // console.log(teacher);
            res.render("teacherDashBoard",{fTeacher : teacher[0] ,currentUser:req.user});
        }
    } );
} );

router.get("/teacher/makeQR",isLoggedIn,roleCheck,function(req,res){
    // res.send("QR_Form");
    res.render("makeQRFrom.ejs",{currentUser : req.user});
} );

router.post("/teacher/makeQR", async function(req,res){
    //Getting Parameters from form
    var batchName = req.body.batchName;
    var batchYear = req.body.batchYear;

    //Setting variables in temp-lecture 
    //to be saved in database
    var tempLecture = new Lecture;
    tempLecture.batchName = batchName;
    tempLecture.batchYear = batchYear;
    var date = new Date().toLocaleString();
    tempLecture.date = date;
    tempLecture.teacherID = req.user.id;

    Teacher.find({authId : req.user.id},function(err,foundTeacher){
        if(err){
            console.log(err);
            res.send("Couldn't find the teacher")
        }
        else{
                //Adding temp-lecture to DB
            Lecture.create(tempLecture, async function(err,lecture){
                if(err){
                    console.log("================");
                    console.log(err);
                }
                else{
                    // console.log(foundTeacher);
                    foundTeacher[0].lecturesTaken.push(lecture.id);
                    foundTeacher[0].save();
                    // console.log(foundTeacher);
                    // console.log(lecture);
                    // console.log(lecture.id);
                    try{
                        // var url = "http://localhost:3001/student/"+lecture.id+"/addAttendance";
                        var url = "https://afternoon-woodland-85688.herokuapp.com/"+lecture.id+"/addAttendance";
                        var qCode = await qrcode.toDataURL(url);
                        res.render("displayQR",{response : qCode,currentUser : req.user,lectureId : lecture.id});
                    }      
                    catch(error){
                        console.log("=============================");
                        console.log(error);
                    }
                }
            });
        }
    } );

} );

// router.get("/teacher/getLectures",function(req,res){
//     Lecture.find({},function(err,allLectures){
//         if(err){
//             console.log(err);
//         }
//         else{
//             // console.log(allLectures);
//             res.send(allLectures),{currentUser : req.user};
//         }
//     });
// } );

router.get("/teacher/:id/lecture",function(req,res){
    var lecId = req.params.id;

    Lecture.findById(lecId).populate("students").exec(function(err,lecture){
            if(err){
                console.log(err);
                res.send("Lecture Not Found!");
            }
            else{
                // console.log(lecture);
                res.render("lecture",{currentUser:req.user,fLecture : lecture});
            }
    });
} );

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

function roleCheck(req,res,next){
    if(req.user.role=="teacher"){
        return next() ;
    }
    else{
        res.send("You are not a teacher")
    }
}

module.exports = router ;