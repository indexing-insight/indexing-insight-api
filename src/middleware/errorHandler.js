export default (err, req, res, next) => {
	console.error(err);
	res.status(500).json({
		error: "internal_server_error",
		message: err.message || "An unexpected error occurred. Please try again later.",
		status: 500
	});
};