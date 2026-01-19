import User from "../models/User.model.js";
import { generateToken } from "../config/jwt.js";

export const socialLogin = async (req, res) => {
    try{
        const {displayName, email, avatar, googleId, facebookId} = req.body;

        let user = await User.findOne({email});
        
        //check user
        if(user){
            //if they exist update their social id
            if(googleId) user.googleId = googleId;
            if(facebookId) user.facebookId = facebookId;
            user.avatar = avatar;
            await user.save();
        }
        else{
            // if user not exists create a new user
            user = await User.create({
                displayName,
                email,
                avatar,
                googleId,
                facebookId,
            })
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user,
            token
        })

    }catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
};