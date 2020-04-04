middlewareObj = {};

middlewareObj.isLoggedIn = function (req,res,next){
    if(req.isAuthenticated() ){
        return next() ;
    }
    req.flash("error","Please Login First!");
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
};

// middlewareObj.isLoggedInAndRoleCheck = function (req,res,next){
//     if(req.isAuthenticated() && req.user.role=="teacher"){
//         return next() ;
//     }
//     // res.redirect("/login");
//     req.flash("error","Please Login First!");
//     res.send("You are not a teacher")
// };

middlewareObj.roleCheckTeacher = function(req,res,next){
    if(req.user.role=="teacher"){
        return next() ;
    }
    else{
        req.flash("error","You are not a teacher!");
        res.redirect('back');
    }
};

middlewareObj.roleCheckStudent = function(req,res,next){
    if(req.user.role == "student"){
        return next();
    }
    else{
        req.flash("error","You are not a Student!");
        res.redirect('back');
    }
};

module.exports = middlewareObj;