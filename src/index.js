import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routesV1 from "./routes/v1.js";
import errorHandler from "./middleware/errorHandler.js";
const { version } = require('../package.json');


const NODE_ENV = process.env.NODE_ENV ? `${process.env.NODE_ENV}` : "local";
dotenv.config({
	path: `.env.${NODE_ENV}`,
});
console.log("NODE_ENV:", NODE_ENV);

// Init express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
if (NODE_ENV === "development" || NODE_ENV === "local") {
	app.use(morgan("dev"));
}
app.use(
	rateLimit({
		windowMs: 1000 * 60, // 60 seconds
		limit: 60, // 60 requests
		identifier: "master-limit",
		standardHeaders: "draft-8",
		validate: { xForwardedForHeader: false },
		handler: function (req, res, next) {
			res.status(429).json({
				error: "rate_limit_exceeded",
				message: "Too many requests. Please try again later.",
				status: 429,
			});
		},
	})
);

app.get("/", (req, res) => {
	res.send({
		message: "Welcome to Indexing Insight API",
		app_url: process.env.APP_URL,
		version
	});
});

// Routes v1
app.use("/v1", routesV1);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ 
		error: "not_found",
		message: "The requested resource was not found.",
		status: 404
	});
});

// Error handler
app.use(errorHandler);

if (NODE_ENV === "local") {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
		console.log("――――――");
	});
}

process.on("uncaughtException", function (err) {
	console.log("Caught exception: " + err);
});

export default app;
