var mongoose = require("mongoose");

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

module.exports = Teacher;