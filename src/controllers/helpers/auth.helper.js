require('dotenv').config();
const   jwt = require("jsonwebtoken"),
        { fbOpts } = require("../../config/config"),
        FBStrategy = require("passport-facebook-token");

exports.getToken = (req, res, next) => {
    let token = req.headers["USER-KEY"] || req.headers.authorization;

    if(!token) res.json({msg: "Token is missing from header"})
    else if(token.startsWith("Bearer ")){
        token = token.slice(7, token.length);

        jwt.verify(token, process.env.JWT_KEY, (err, decode) => {
            if(err){
                if(err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") res.json({msg: "Token either missing or incorrect"})
                else next(err)
            }else {
                res.locals.decoded = decode;
                next();
            }
        })
    } 
}

exports.fbAuth = (passport) => {
    passport.use(new FBStrategy(fbOpts, (accessToken, refreshToken, profile, done)=>{
        done(null, {
            accessToken,
            name: `${profile._json.first_name} ${profile._json.last_name}`,
            email: profile._json.email
        })
    }))
}