import jwt from 'jsonwebtoken';

// This function creates the "ID Card" for the user
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '365d', // Keeping the user logged in for 1 year as we discussed
    });
};

// This function checks if the "ID Card" is still valid
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};