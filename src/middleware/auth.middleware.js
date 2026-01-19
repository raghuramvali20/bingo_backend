import { verifyToken } from "../config/jwt.js";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
    let token;
    // check the if the authorization header exists and starts with Bearer
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try{
            //extract the token string
            token = req.headers.authorization.split(" ")[1];
            //verify the token and get decoded payload 
            const decoded = verifyToken(token);
            //find the user in db
            req.user = await User.findById(decoded.id).select("-googleId -facebookId");
            if(!req.user){
                return res.status(404).json({success: false, message: "User no longer exists"});
            }
            next();//move to the controller
        }
        catch (error) {
            return res.status(401).json({success: false, message: "Not authorized, token failed"});
        }
    }
    if(!token){
        return res.status(401).json({success: false, message: "Not authorized, no token provided"});
    }
   
}