var express = require("express");
var app = express();
// var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var qrcode = require("qrcode");
app.set("view engine","ejs");
var fs = require("fs");
// var bodyparser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/qr_attendance",{ useNewUrlParser: true,useUnifiedTopology: true });

app.use(bodyparser.urlencoded({extended : true}));

//Mongoose Schema Setup
var studentSchema = new mongoose.Schema({
    name: String,
    rollNumber: Number
});

var Student = mongoose.model("Student",studentSchema);

var lectureSchema = new mongoose.Schema({
    batchName : String,
    batchYear : Number,
    date : Date,
    students :[{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }]
});

var Lecture = mongoose.model("Lecture",lectureSchema);

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
    // try{
    //     var response = await qrcode.toDataURL('https://www.google.com/');
    //     // var resp = qr.toDataURL();
    //     // console.log(response);
    //     // fs.writeFileSync('./qr.html', `<img src="${response}">`);
    //     // console.log('Wrote to ./qr.html');
    //     res.render("displayQR",{response : response});
    // }
    // catch(err){
    //     console.log(err);
    // }
    
    res.send("JaiMataDi");
} );

app.get("/teacher/makeQR",function(req,res){
    // res.send("QR_Form");
    res.render("makeQRFrom.ejs");
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

    //Adding temp-lecture to DB
    Lecture.create(tempLecture, async function(err,lecture){
        if(err){
            console.log("================");
            console.log(err);
        }
        else{
            console.log(lecture);
            console.log(lecture.id);
            try{
                var url = "http://localhost:3001/student/"+lecture.id+"/addAttendance";
                var qCode = await qrcode.toDataURL(url);
                res.render("displayQR",{response : qCode});
            }
            catch(error){
                console.log("=============================");
                console.log(error);
            }
        }
    } );
} );

app.get("/teacher/getLectures",function(req,res){
    Lecture.find({},function(err,allLectures){
        if(err){
            console.log(err);
        }
        else{
            console.log(allLectures);
            res.send(allLectures);
        }
    });
} );

app.get("/student/:id/addAttendance",function(req,res){
    res.render("rollNumberForm",{id:req.params.id});
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

var port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log("Server Has Started!");
});
