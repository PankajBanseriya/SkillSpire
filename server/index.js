const express = require('express');
const app = express();

const userRoutes = require('./routers/User');
const profileRoutes = require('./routers/Profile');
const paymentRoutes = require('./routers/Payments');
const courseRoutes = require('./routers/Course');
const contactUsRoute = require("./routers/ContactUs");

const database = require('./config/database');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {cloudinaryConnect} = require('./config/cloudinary');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 4000;

// database connect
database.connect();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "https://skill-spire-vert.vercel.app",
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
)

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
)

// cloudinary connections
cloudinaryConnect();

// routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/reach", contactUsRoute);

// default route
app.get("/", (req,res) => {
    return res.json({
        success: true,
        message: "Your server is up and running...",
    })
});

app.listen(PORT, ()=>{
    console.log("App is running successfully at PORT Number: ", PORT);
})
