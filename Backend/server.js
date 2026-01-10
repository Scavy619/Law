import express from "express";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import adminRouter from "./routes/adminRoute.js";
import LawyerRouter from "./routes/lawyerRoute.js";
import videoRouter from "./routes/videoRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import AuthRouter from "./routes/authRoute.js";
import { connectMongoDB } from "./config/mongodb.js";
import { connectCloudinary } from "./config/cloudinary.js";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 3000;

// for development
// app.use(cors({
//   origin: true, // Allow all origins in development
//   credentials: true
// }));

// CORS configuration - must be first
const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl) ONLY in development
      if (!origin) {
        if (process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }
        // In production, block requests without origin
        return callback(new Error("Not allowed by CORS"));
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// json middleware
app.use(express.json());

// cookie parser
app.use(cookieParser());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // each IP gets 100 requests ie about 7 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, try again later.",
});

app.use(limiter);

connectMongoDB(process.env.MONGODB_URI).then(() =>
  console.log("Mongo DB Connected!!"),
);
connectCloudinary().then(() => console.log("Cloudinary Connected!!"));

// api endpoints
app.use("/api/auth", AuthRouter);
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/lawyer", LawyerRouter);
app.use("/api/video", videoRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", time: new Date().toISOString() });
});

app.get("/health2", (req, res) => {
  res.status(200).send("Server is healthy");
});

app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
