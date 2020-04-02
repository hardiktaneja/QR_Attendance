var mongoose = require("mongoose");

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

module.exports = Lecture;