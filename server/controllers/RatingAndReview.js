const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const { default: mongoose } = require('mongoose');

// Create Rating
exports.createRating = async (req, res) => {
    try {

        // Get userId
        const userId = req.user.id;

        // data fetch
        const { rating, review, courseId } = req.body;

        // data validation - check user is enrolled in course or not
        const courseDetails = await Course.findOne(
            {
                _id: courseId, studentsEnrolled: { $elemMatch: { $eq: userId } },
            })

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: "Student is not enrolled in the course."
            })
        }

        // check user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        })
        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "Course is already reviewed by the user."
            })
        }

        // create rating and review in DB
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            course: courseId,
            user: userId,
        })

        // update course with this rating/review
        await Course.findByIdAndUpdate(
            { _id: courseId },
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            { new: true },
        )

        // Return Response
        return res.status(200).json({
            success: true,
            ratingReview,
            message: "Rating and Review created successfully.",
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get Average Rating
exports.getAverageRating = async (req, res) => {
    try {

        // get Course Id
        const courseId = req.body.courseId;

        // Calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                }
            },
        ])

        // Return Rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            })
        }

        // If no rating/review exist
        return res.status(200).json({
            success: true,
            message: "Average Rating is 0, no rating & review given till now",
            averageRating: 0,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get All Rating 
exports.getAllRating = async (req, res) => {
    try {

        const allReviews = await RatingAndReview.find({})
                                    .sort({ rating: "desc" })
                                    .populate({
                                        path: 'user',
                                        select: 'firstName lastName email image',
                                    })
                                    .populate({
                                        path: "course",
                                        select: "courseName",
                                    })
                                    .exec();

        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        });
    
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
