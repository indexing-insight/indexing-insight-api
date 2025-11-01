import express from "express";
import domains from "../database/models/domains.js";
// import rateLimit from "express-rate-limit";
import UrlReport from "../viewmodel/UrlReport.js";
import getDomainURLsModel from "../database/models/urls.js";

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
	"/domain/:domain_id([0-9a-fA-F]{24})/url-id/:url_id([0-9a-fA-F]{24})",
	// limiterUrlReport,
	async (req, res) => {
		const { domain_id, url_id } = req.params;
		const { fields } = req.query;

		// check authorized
		const domain_info = await domains.findOne({_id: domain_id},"_id url urls_collection").lean()
		console.log(req.domain_ids, domain_info)
		if (!req.domain_ids?.includes(domain_info?._id)) {
			return res.status(403).json({
				error: "forbidden",
				message: "You are not authorized to access this URL report.",
				status: 403,
			});
		}
		// get urls collections
		const urlsColleciton = getDomainURLsModel(domain_info)

		let projection
		if(fields){
			projection = fields.split(',').map(f=>f.trim())
		}

		const filter = { state: "mapped", _id: url_id };
		const page = await urlsColleciton
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
					domain_id,
					url_id
				},
			});
		}
		
		res.send(new UrlReport(page).toMap(projection));
	}
);

export default router;
