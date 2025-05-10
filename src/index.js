import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import routesV1 from "./routes/v1.js";
import errorHandler from "./middleware/errorHandler.js";
import dbConnect from "./database/mongoose.js";

const NODE_ENV = process.env.NODE_ENV ? `${process.env.NODE_ENV}` : "local";
dotenv.config({
	path: `.env.${NODE_ENV}`,
});

console.log("NODE_ENV:", NODE_ENV);
const app = express();

// Connect to MongoDB
dbConnect();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
if (NODE_ENV === "development" || NODE_ENV === "local") {
	app.use(morgan("dev"));
}
app.use(
	rateLimit({
		windowMs: 1000, // 1 second
		limit: 4, // Limit each IP
		identifier: "master-limit",
		standardHeaders: "draft-8",
		validate:{ xForwardedForHeader: false },
		handler: function (req, res, next) {
			res.status(429).json({
				message: "Too many requests.",
				limiter: "4 requests per second",
			});
		},
	})
);

app.get("/", (req, res) => {
	res.send({
		message: "Welcome to Indexing insight API",
		enpoints: [
			{
				url: "/v1/index-coverage/:domain_id",
			},
			{
				url: "/v1/urls/:domain_id",
			},
			{
				url: "/v1/url-report/:url_id",
			},
		],
	});
});

// Routes v1
app.use("/v1", routesV1);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use(errorHandler);

if(NODE_ENV === "local"){
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
		console.log("――――――");
	});
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});

export default app