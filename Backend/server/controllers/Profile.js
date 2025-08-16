const Profile = require('../models/Profile');
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');

exports.updateProfile = async (req, res) => {
	try {
		const { dateOfBirth = "", about = "", contactNumber="",firstName,lastName,gender="" } = req.body;
		const id = req.user.id;

		// Find the profile by id
		const userDetails = await User.findById(id);
		const profile = await Profile.findById(userDetails.additionalDetails);

		// Update the profile fields
		userDetails.firstName = firstName || userDetails.firstName;
		userDetails.lastName = lastName || userDetails.lastName;
		profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
		profile.about = about || profile.about;
		profile.gender=gender || profile.gender;
		profile.contactNumber = contactNumber || profile.contactNumber;

		// Save the updated profile
		await profile.save();
		await userDetails.save();

		return res.json({
			success: true,
			message: "Profile updated successfully",
			profile,
			userDetails
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};


// Delete Account
exports.deleteAccount = async (req, res) => {
    try {
        // Get UserId
        const userId = req.user.id;
        // console.log(userId)
        
        // Validation
        const userDetails = await User.findById(userId);
        if(!userDetails){
            return res.status(400).json({
                success: false,
                message: "User not found."
            })
        }

        // delete profile and delete user
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        await User.findByIdAndDelete({_id: userId});

        // Return response
        return res.status(200).json({
            success: true,
            message: "User Deleted Successfully."
        })

    } catch (error) {
        console.log("Error in Deleting user account.", error);
        return res.status(500).json({
            success: false,
            message: "Error in Deleting user account.",
            error: error.message,
        })
    }
}


exports.getAllUserDetails = async (req,res) => {
    try {
        const id = req.user.id;
        const userDetails = await User.findById(id).populate('additionalDetails').exec();

        return res.status(200).json({
            success: true,
            data: userDetails,
            message: "User data fetched successfully.",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error in fetching data from user.",
            error: error.message,
        })
    }
}


exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}