const Section = require('../models/Section');
const Course = require('../models/Course');
const SubSection = require('../models/SubSection');

exports.createSection = async (req, res) => {
    try {
        // Data Fetch
        const { sectionName, courseId } = req.body;

        // Data Vaalidation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties.",
            });
        }

        const isCourseExist = await Course.findById(courseId);
		if (!isCourseExist) {
			return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Create Section in DB
        const newSection = await Section.create({ sectionName });

        // Update course with section Object ID
        const updatedCourse = await Course.findByIdAndUpdate(courseId,
            {
                $push: {
                    courseContent: newSection._id,
                }
            },
            { new: true }
        ).populate({
            path: "courseContent",
            populate: {
                path: "subSection", 
            }
        })
            .exec();


        // Return response
        return res.status(200).json({
            success: true,
            updatedCourse,
            message: "Section created and course updated successfully.",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in creating section. Please Try again",
            error: error.message,
        })
    }
}


exports.updateSection = async (req, res) => {
    try {
        // Data fetch from input
        const { sectionName, sectionId, courseId } = req.body;

        // Data Validation
        if (!sectionName || !sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing Properties.",
            });
        }

        // Update Data in DB
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true});
        const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();

        // Return Response
        return res.status(200).json({
            success: true,
            data: updatedCourse,
            message: "Section updated successfully.",
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Unable to update section. Please Try again",
            error: error.message,
        });
    }
}

exports.deleteSection = async (req, res) => {
	try {
		const { sectionId,courseId } = req.body;
		await Section.findByIdAndDelete(sectionId);
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		res.status(200).json({
			success: true,
			message: "Section deleted",
			data: updatedCourse,
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};  