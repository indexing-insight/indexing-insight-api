import express from "express";
import pages from "../database/models/pages.js";
// import rateLimit from "express-rate-limit";
import UrlReport from "../viewmodel/UrlReport.js";

const router = express.Router();

// const limiterUrlReport = rateLimit({
// 	windowMs: 60 * 1000, // 1 minute
// 	limit: 60, // Limit each API key
// 	identifier: "url-report-limit",
// 	standardHeaders: "draft-8",
// 	validate: { xForwardedForHeader: false },
// 	keyGenerator: function (req) {
// 		return req.api_key_id; // API Key
// 	},
// 	handler: function (req, res, next) {
// 		res.status(429).json({
// 			message: "UrlReport. Too many requests.",
// 			limiter: "60 requests per minute",
// 		});
// 	},
// });

router.get(
	"/url-report/:url_id([0-9a-fA-F]{24})?",
	// limiterUrlReport,
	async (req, res) => {
		const { url_id } = req.params;
		const { url, fields } = req.query;

		// TODO: use private collections

		let projection
		if(fields){
			projection = fields.split(',').map(f=>f.trim())
		}
		if (!url_id && !url) {
			return res.status(400).json({
				error: "missing_parameter",
				message: "Either 'url_id' as parameter or 'url' in query string must be provided.",
				status: 400,
			});
		}
		const filter = { state: "mapped", ...url_id ? { _id: url_id } : { url }};
		const page = await pages
			.findOne(
				filter,
				"url domain verdict coverageState indexingState robotsTxtState pageFetchState googleCanonical userCanonical sitemaps is_indexed inspection_link lastCrawlTime crawledAs last_indexed last_canonical_change last_state_change last_inspection_date createdAt"
			)
			.lean()
			.exec();

		if (!page) {
			return res.status(404).json({
				error: "not_found",
				message: "URL report not found.",
				status: 404,
				details: {
					url_id,
					url,
				},
			});
		}

		if (!req.domain_ids?.includes(page?.domain)) {
			return res.status(403).json({
				error: "forbidden",
				message: "You are not authorized to access this URL report.",
				status: 403,
			});
		}

		res.send(new UrlReport(page).toMap(projection));
	}
);

export default router;
