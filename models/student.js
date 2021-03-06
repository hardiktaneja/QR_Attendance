var mongoose = require("mongoose");
var studentSchema = new mongoose.Schema({
        name: String,
        rollNumber: Number,
        batchName : String,
        batchYear : Number,
        authId :{
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        lecturesAttended :[{
            type : mongoose.Schema.Types.ObjectId,
            ref : "Lecture"
        }]
    });
    // studentSchema.plugin(passportLocalMongoose);
    
    module.exports = mongoose.model("Student",studentSchema);