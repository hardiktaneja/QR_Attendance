var express = require("express");
var router = express.Router();
var qrcode = require("qrcode");

// var Student = require("../models/student.js");
var Teacher = require("../models/teacher.js");
var Lecture = require("../models/lecture.js");
var middleware = require("../middleware");

router.get("/teacher",middleware.isLoggedIn,middleware.roleCheckTeacher,function(req,res){
    Teacher.find({authId : req.user.id}).populate("lecturesTaken").exec(function(err,teacher){
        if(err){
            console.log(err);
            req.flash("error","Teacher Not Found!");
            // res.send("Teacher Not Found !");
            res.redirect("back");
        }
        else{
            // console.log(teacher);
            res.render("teacherDashBoard",{fTeacher : teacher[0]});
        }
    } );
} );

router.get("/teacher/makeQR",middleware.isLoggedIn,middleware.roleCheckTeacher,function(req,res){
    // res.send("QR_Form");
    res.render("makeQRFrom.ejs",{currentUser : req.user});
} );

router.post("/teacher/makeQR", async function(req,res){
//     if(req.session.qrCreated){
//         var numOfTry = req.session.numOfTry +1;
//         try{
//             // var url = "http://localhost:3001/student/"+req.session.lectureId+"/"+numOfTry+"/addAttendance";
//             var url = "https://afternoon-woodland-85688.herokuapp.com/student/"+req.session.lectureId+"/"+numOfTry+"/addAttendance";
//             var qCode = await qrcode.toDataURL(url);
//             req.session.numOfTry = numOfTry;
//             req.session.save(function(err){
//                 if(err){
//                     console.log(err);
//                     req.flash("Try Again, Some error occured!");
//                     res.redirect("back");
//                 }
//                 else{
//                     res.render("displayQR",{response : qCode,lectureId : req.session.lectureId});
//                 }
//             } );
//             return;
//         }      
//         catch(error){
//             // console.log("=============================");
//             console.log(error);
//             req.flash("error","QR Couldn't be Created!");
//             // res.send("Teacher Not Found !");
//             res.redirect("back");
//         }
//     }
    //Getting Parameters from form
    var batchName = req.body.batchName;
    var batchYear = req.body.batchYear;

    //Setting variables in temp-lecture 
    //to be saved in database
    var tempLecture = new Lecture;
    tempLecture.batchName = batchName;
    tempLecture.batchYear = batchYear;
    var date = new Date();
    tempLecture.date = date;
    tempLecture.teacherID = req.user.id;

    Teacher.find({authId : req.user.id},function(err,foundTeacher){
        if(err){
            console.log(err);
            req.flash("error","Teacher Not Found!");
            // res.send("Teacher Not Found !");
            res.redirect("back");
        }
        else{
                //Adding temp-lecture to DB
            Lecture.create(tempLecture, async function(err,lecture){
                if(err){
                    console.log(err);
                    req.flash("error","Lecture Not Found!");
                    res.redirect("back");
                }
                else{
                    foundTeacher[0].lecturesTaken.push(lecture.id);
                    foundTeacher[0].save();
                    try{
                        // var url = "http://localhost:3001/student/"+lecture.id+"/addAttendance";
                        var url = "https://afternoon-woodland-85688.herokuapp.com/student/"+lecture.id+"/"+1+"/addAttendance";
                        var qCode = await qrcode.toDataURL(url);
                        req.session.qrCreated = true;
                        req.session.lectureId = lecture.id;
                        req.session.numOfTry = 1;
                        console.log(lecture.id);
                        req.session.save(function(err){
                            if(err){
                                req.flash("Try Agian, Server Problem");
                                res.redirect('back');
                            }
                            else{
                                res.render("displayQR",{response : qCode,lectureId : lecture.id});
                            }
                        } );
                    }      
                    catch(error){
                        console.log(error);
                        req.flash("error","QR Couldn't be Created!");
                        res.redirect("back");
                    }
                }
            });
        }
    } );

} );

router.post("/teacher/refreshQR",async function(req,res){
    if(req.session.qrCreated){
        // console.log("=============================");
        // console.log(req.session.qrCreated);
        var numOfTry = req.session.numOfTry +1;
        try{
            // var url = "http://localhost:3001/student/"+req.session.lectureId+"/"+numOfTry+"/addAttendance";
            var url = "https://afternoon-woodland-85688.herokuapp.com/student/"+req.session.lectureId+"/"+numOfTry+"/addAttendance";
            var qCode = await qrcode.toDataURL(url);
            req.session.numOfTry = numOfTry;
            req.session.save(function(err){
                if(err){
                    console.log(err);
                    req.flash("Try Again, Some error occured!");
                    res.redirect("back");
                }
                else{
                    res.render("displayQR",{response : qCode,lectureId : req.session.lectureId});
                }
            } );
            return;
        }      
        catch(error){
            // console.log("=============================");
            console.log(error);
            req.flash("error","QR Couldn't be Created!");
            // res.send("Teacher Not Found !");
            res.redirect("back");
        }
    }
    else{
        res.send("You cannot do this");
    }
} );


router.get("/teacher/:id/lecture",middleware.isLoggedIn,middleware.roleCheckTeacher,function(req,res){
    var lecId = req.params.id;

    Lecture.findById(lecId).populate("students").exec(function(err,lecture){
            if(err){
                console.log(err);
                req.flash("error","Lecture Not Found!");
                // res.send("Teacher Not Found !");
                res.redirect("back");
                // res.send("Lecture Not Found!");
            }
            else{
                // console.log(lecture);
                res.render("lecture",{fLecture : lecture});
            }
    });
} );

module.exports = router ;