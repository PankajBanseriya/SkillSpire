const Category = require('../models/Category')

// Create tags
exports.createCategory = async (req,res) => {
    try {
        // Data Fetch from req body
        const {name, description} = req.body;

        // Validation
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }
        
        // Create entry in DB
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log(categoryDetails);

        // Return response
        return res.status(200).json({
            success: true,
            message: "Category created Successfully.",
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// Get all tags 
exports.showAllCategories = async (req,res) => {
    try {
        const allCategory = await Category.find({}, {name:true, description: true});
        res.status(200).json({
            success: true,
            message: "All Category Given Successfully.",
            allCategory,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


// Category Page detail
exports.categoryPageDetails = async (req,res) => {
    try {

        // get category Id
        const {categoryId} = req.body;

        // get courses for specified category Id
        const selectedCategory = await Category.findById(categoryId).populate('courses').exec();

        // validation
        if(!selectedCategory){
            return res.status(404).json({
            success: false,
            message: "Data Not Found",
        })
        }

        // get courses for different categories
        const differentCategories = await Category.find({
            _id: {$ne: categoryId},
        }).populate("courses").exec();

        // get top selling courses
        const allCategories = await Category.find().populate('courses').exec();
		const allCourses = allCategories.flatMap((category) => category.courses);
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);


        // return response
         return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
                mostSellingCourses,
            },
        })
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}