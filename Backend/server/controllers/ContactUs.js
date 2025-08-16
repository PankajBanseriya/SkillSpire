const mailSender = require('../utils/mailSender');

exports.contactUs = async (req, res) => {
    try {

        const { firstName, lastName, email, message, phoneNo } = req.body;
        if (!firstName || !email || !message) {
            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            });
        }

        const data = {
            firstName,
            lastName: `${lastName ? lastName : "null"}`,
            email,
            message,
            phoneNo: `${phoneNo ? phoneNo : "null"}`,
        };
        const info = await mailSender(
            process.env.CONTACT_MAIL,
            "Enquery",
            `<html><body>${Object.keys(data).map((key) => {
                return `<p>${key} : ${data[key]}</p>`;
            })}</body></html>`
        );

        const mailSender = await mailSender(
            email,
            "Confirmation mail by StudyNotion",
            "Your message has been sent successfully",
        )

        if (info) {
            return res.status(200).send({
                success: true,
                message: "Your message has been sent successfully",
            });
        } else {
            return res.status(403).send({
                success: false,
                message: "Something went wrong",
                error: error.message,
            });
        }


    } catch (error) {
        return res.status(500).send({
                success: false,
                message: error.message,
            });
    }
}