
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/qr_attendance",{ useNewUrlParser: true,useUnifiedTopology: true });

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

// ADD A NEW STUDENT
var stud = new Student;
stud.name = "ABC"
stud.rollNumber = 00151202816;

Student.create(stud,function(err,s){
    if(err){
        console.log(err);
    }
    else{
        console.log(s);
    }
} )
// var lect = new Lecture;
// lect.batchName="ECE";
// lect.batchYear = "2013";
// lect.date = new Date();

// // Lecture.create(lect,function(err,l){
// //     if(err){
// //         console.log(err);
// //     }
// //     else{
// //         console.log(l);
// //     }

// // } )

// Lecture.findById("5e7b54c983101e12de9d105a",function(err,foundLecture){
//     if(err){
//         console.log(err);
//     }
//     else{
//         // console.log(foundLecture);
//         Student.findOne({"rollNumber":"35151202816"},function(err,foundStudent){
//             if(err){
//                 console.log("WEEEEEE");
//                 console.log(err);
//             }
//             else{
//                 // console.log(foundStudent.name);
//                 foundLecture.students.push(foundStudent["_id"]);
//                 foundLecture.save(function(err,foundLecture){
//                     if(err){
//                         console.log(err);
//                     }
//                     else{
//                         console.log(foundLecture);
//                         console.log("SUCCESS");
//                     }
//                 });
                
//             }
//         } ) ;       
//     }
// } );

