var express = require("express");
var app = express();
// var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var qrcode = require("qrcode");
app.set("view engine","ejs");
var fs = require("fs");
// var bodyparser = require("body-parser");
var mongoose = require("mongoose");

app.use(express.static(__dirname + '/public'));


//ADMIN 
var passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user");

mongoose.connect("mongodb://localhost/qr_attendance",{ useNewUrlParser: true,useUnifiedTopology: true });

app.use(bodyparser.urlencoded({extended : true}));

//Mongoose Schema Setup
var studentSchema = new mongoose.Schema({
    name: String,
    rollNumber: Number,
    batchName : String,
    batchYear : Number,
    authId :{
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
});

var Student = mongoose.model("Student",studentSchema);

var teacherSchema = new mongoose.Schema({
    name : String,
    staffId : Number,
    lecturesTaken :[{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Lecture"
    }],
    authId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
});

var Teacher = mongoose.model("Teacher",teacherSchema);
//Lecture Schema
var lectureSchema = new mongoose.Schema({
    batchName : String,
    batchYear : Number,
    date : Date,
    students :[{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],
    teacherID : {
        type :mongoose.Schema.Types.ObjectId,
        ref : "Teacher"
    }
});

var Lecture = mongoose.model("Lecture",lectureSchema);



//PASSPORT

app.use(require("express-session")({
    secret : "Major Project 100 marks",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize() );
app.use(passport.session() );
passport.use(new LocalStrategy(User.authenticate() ) );
passport.serializeUser(User.serializeUser() );
passport.deserializeUser(User.deserializeUser() );

// async function run() {
//     const res = await qrcode.toDataURL('http://asyncawait.net');
  
//     fs.writeFileSync('./qr.html', `<img src="${res}">`);
//     console.log('Wrote to ./qr.html');
//     return res;
//   }

//  var tempLecture = {
//       batchName : "",
//       batchYear : "",
//       Date : "",
//       students :[]
//   };

  
app.get("/",async function(req,res){
    res.render("landing",{currentUser:req.body.user});
} );

app.get("/register",function(req,res){
    res.render("register",{currentUser : req.user});
});

app.post("/register",function(req,res){
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
                    res.redirect("/");
                }
            } )
        });
    } );
} );

app.get("/login",function(req,res){
    res.render("login",{currentUser : req.user});
});

app.post("/login",passport.authenticate("local",
    {   
        successRedirect : "/",
        failureRedirect : "/login"
    }) ,function(req,res){

} );

app.get("/logout",function(req,res){
    req.logout();
    res.send("LOGGED OUT");
} );
app.get("/teacher",isLoggedInAndRoleCheck,function(req,res){
    Teacher.find({authId : req.user.id}).populate("lecturesTaken").exec(function(err,teacher){
        if(err){
            console.log(err);
            res.send("Teacher Not Found !");
        }
        else{
            console.log(teacher);
            res.render("teacherDashBoard",{fTeacher : teacher[0] ,currentUser:req.user});
        }
    } );
} );
app.get("/teacher/register",function(req,res){
    res.render("teacherRegister",{currentUser:req.user});
} );

app.post("/teacher/register",function(req,res){
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
                    res.redirect("/");
                }
            } )
        });
    } );
} );

app.get("/teacher/makeQR",isLoggedInAndRoleCheck,function(req,res){
    // res.send("QR_Form");
    res.render("makeQRFrom.ejs",{currentUser : req.user});
} );

app.post("/teacher/makeQR", async function(req,res){
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
                    console.log(foundTeacher);
                    foundTeacher[0].lecturesTaken.push(lecture.id);
                    foundTeacher[0].save();
                    console.log(foundTeacher);
                    console.log(lecture);
                    console.log(lecture.id);
                    try{
                        var url = "http://localhost:3001/student/"+lecture.id+"/addAttendance";
                        var qCode = await qrcode.toDataURL(url);
                        res.render("displayQR",{response : qCode,currentUser : req.user});
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

app.get("/teacher/getLectures",function(req,res){
    Lecture.find({},function(err,allLectures){
        if(err){
            console.log(err);
        }
        else{
            // console.log(allLectures);
            res.send(allLectures),{currentUser : req.user};
        }
    });
} );

app.get("/student/:id/addAttendance",isLoggedIn,function(req,res){
    res.render("rollNumberForm",{id:req.params.id,currentUser : req.user});
} );

app.post("/student/:id/addAttendance",function(req,res){
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

var port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log("Server Has Started!");
});
