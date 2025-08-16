const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Reset Password Token
exports.resetPasswordToken = async (req, res) => {
    try {
        // Get email from req body
        const email = req.body.email;

        // Check User for this email, email validation
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: "Your Email is not registered."
            })
        }
        // Geneate Token
        const token = crypto.randomBytes(20).toString("hex");

        // Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            { new: true }
        )

        // Create URL
        const url = `http://localhost:3000/update-password/${token}`

        // Send mail containing the url
        await mailSender(email, "Password Reset", `Your Link for email verification is:<br> ${url} <br>Please click this url to reset your password.`)

        // Return response
        return res.status(200).json({
            success: true,
            message: "Email send Successfully, Please Check Your Email to Continue Further"
        });
    } catch (error) {
        console.log(error);
        return res.json(500).json({
            success: false,
            message: "Something went wrong while sending reset password mail."
        })
    }

}

// Reset Passsword
exports.resetPassword = async (req,res) => {
    try {
        // Data fetch
        const {password, confirmPassword, token} = req.body;

        // Validation
        if(password !== confirmPassword){
            return res.json({
                success: false,
                message: "Password and Confirm Password Does not Match",
            })
        }

        // Get User Details from DB using token
        const userDetails = await User.findOne({token: token});

        // Check token is valid or not
        if(!userDetails){
            return res.json({
                success: false,
                message: "Token is Invalid."
            })
        }

        // Check token is expire or not
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success: false,
                message: "Token is expired, Please regenerate the token."
            })
        }

        // Hash Password
        const hasedPassword = await bcrypt.hash(password, 10);

        // Update password in DB
        await User.findOneAndUpdate(
            {token: token},
            {password: hasedPassword},
            {new: true},
        );

        // Return Response
        return res.status(200).json({
            success: true,
            message: "Password reset successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Somthing went wrong while reset password",
            error: error.message,
        })

    }
}