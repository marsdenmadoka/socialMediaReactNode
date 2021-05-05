const jwt = require("jsonwebtoken");
const config = require("config");

//middleware function takes 3 thhings req,res,next
module.exports = function (req, res, next) {
  //Get token from headers
  const token = req.header("x-auth-token");

  //check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token,authoriation denied" });
  }
  
  //verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "invalid token" });
  }
};
