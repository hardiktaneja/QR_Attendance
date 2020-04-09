var express = require("express");
var app = express();
// var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var qrcode = require("qrcode");
app.set("view engine","ejs");
var fs = require("fs");
// var bodyparser = require("body-parser");
var mongoose = require("mongoose"),
    flash = require("connect-flash"),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

//MODELS
var Student = require("./models/student.js");
var Teacher = require("./models/teacher.js");
var Lecture = require("./models/lecture.js");

app.use(flash() );

//ROUTESS

var authRoutes = require("./routes/auth.js");
var teacherRoutes = require("./routes/teacher.js");
var studentRoutes = require("./routes/student.js");

app.use(express.static(__dirname + '/public'));

//ADMIN 
var passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user");

mongoose.connect("mongodb://localhost/qr_attendance",{ useNewUrlParser: true,useUnifiedTopology: true });
// var str1 = "mongodb://hardik:redsozpasta123@ds231956.mlab.com:31956/qr_attendance";
// mongoose.connect(str1,{ useNewUrlParser: true,useUnifiedTopology: true });

app.use(bodyparser.urlencoded({extended : true}));

//PASSPORT
app.use(require("express-session")({
    secret : "Major Project 100 marks",
    resave : false,
    saveUninitialized : false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie :{
        maxAge : 60 * 60 * 1000
    }
}));
app.use(passport.initialize() );
app.use(passport.session() );
passport.use(new LocalStrategy(User.authenticate() ) );
passport.serializeUser(User.serializeUser() );
passport.deserializeUser(User.deserializeUser() );

app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
    res.locals.success=req.flash("success");
    next();
 });

app.use(authRoutes);
app.use(teacherRoutes);
app.use(studentRoutes);

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
    res.render("landing");
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

var port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log("Server Has Started!");
});

// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log("Server Has Started!");
//  });
