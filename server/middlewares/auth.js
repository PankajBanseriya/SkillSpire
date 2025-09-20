const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require("../models/User");

// Authentication
exports.auth = async (req, res, next) => {
    try {

        // Extact Token
        let token = null;

        if (req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization) {
            token = req.headers.authorization.replace("Bearer ", "");
        } else if (req.body.token) {
            token = req.body.token;
        }

        // If token missing, then return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is Missing",
            });
        }

        // Verify the Token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            console.log(decode);
            req.user = decode;
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Token is Invalid."
            });
        }

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating the token",
        });
    }
}

// Authorization - isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Students only."
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be Verified, Please Try again."
        })
    }
}

// Authorization - isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
		// console.log("User Detail: ", userDetails);

		console.log(userDetails.accountType);
        if (userDetails.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Instructor only."
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be Verified, Please Try again."
        })
    }
}

// Authorization - isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin only."
            })
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be Verified, Please Try again."
        })
    }
}