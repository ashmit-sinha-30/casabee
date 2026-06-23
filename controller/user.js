const User = require("../models/user");
const { userSchema } = require("../schema")

module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signup = async(req,res)=>{
    try{
        const { error } = userSchema.validate(req.body);
    
        if (error) {
            let errMsg = error.details.map((el) => el.message).join(",");
            req.flash("error", errMsg);
            return res.redirect("/signup");
        }

        let {username, email, password} = req.body;
        const newUser = new User ({email, username});
        const registeredUser = await User.register(newUser,password);
        req.login(registeredUser, (err)=>{
            if(err){
                return next(err);
            }
        req.flash("success", "Welcome to CasaBee!");
        res.redirect("/listings");
        });
    }catch(e){
        console.log(e.message);
        req.flash("error", e.message);
        res.redirect("/signup");
    }

};

module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.login = async(req,res)=>{
    req.flash("success", "Welcome back to CasaBee!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
    console.log(res.locals.redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You are successfully logged out!");
        res.redirect("/listings");
    });
};