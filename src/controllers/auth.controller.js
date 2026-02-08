import User from "../models/User.model.js";
import { generateToken } from "../config/jwt.js";

export const signUp = async (req, res) => {
    try {
        const { displayName, email, password }= req.body;
        if (!displayName || !email || !password) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: "Email already in use" });
        }

        const user = await User.create({ displayName, email, password });
        const token = generateToken(user._id);

        res.status(201).json({ success: true, message: "Account created", user, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Missing email or password" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const token = generateToken(user._id);
        res.status(200).json({ success: true, message: "Login successful", user, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};