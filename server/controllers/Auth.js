const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const mailSender = require('../utils/mailSender');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {passwordUpdated} = require('../mail/templates/passwordUpdate');
require("dotenv").config();

// Sent OTP
exports.sendOTP = async (req, res) => {
    try {
        // Fetch email from request body
        const { email } = req.body;

        // Check if user already exist
        const checkUserPresent = await User.findOne({ email });

        // If user alredy exist, then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered."
            })
        }

        // Generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP Generated:", otp);

        // Check OTP is Unique or not
        const result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
        }

        const otpPayload = { email, otp };

        // Create Entry in Database for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            success: true,
            message: "OTP Sent SUccessfully",
            otp,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// signUp
exports.signUp = async (req, res) => {

    try {

        // Data Fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All Field are required",
            })
        }

        // Check both password is similar or not
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password value does not match, Please Try Again."
            });
        }

        // Check user already exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered.",
            })
        }

        // Find recent OTP stroed in DB for the user
        const recentOtp = await OTP.findOne({ email }).sort({ createAt: -1 }).limit(1);
        console.log("Recent OTP:", recentOtp);

        // Validate OTP
        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: 'OTP Not Found.',
            })
        }
        else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP.',
            })
        }

        // Hash Password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create entry in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        // return response
        return res.status(200).json({
            success: true,
            user,
            message: "User is Registered Successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please Try again.",
            error: error.message,
        })
    }


}


// Login
exports.login = async (req, res) => {
    try {

        // Data Fetch from request body
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All Fields are required, Please Try again."
            })
        }

        // Check User is exist or not
        const user = await User.findOne({ email }).populate('additionalDetails');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, Please Signup First."
            })
        }

        // Check Password is correct or not & Genreate JWT
        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET);
            user.token = token;
            user.password = undefined;

            // Create Cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'Logged In Successfully.'
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is Incorrect."
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login Failure, Please Try again."
        })
    }
}


exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if(oldPassword === newPassword){
			return res.status(400).json({
				success: false,
				message: "New Password cannot be same as Old Password",
			});
		}
		
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				"Study Notion - Password Updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};