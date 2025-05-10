import express from "express";
import pages from "../lib/database/models/pages.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const limiterUrlReport = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	limit: 60, // Limit each API key
	identifier: 'url-report-limit',
	standardHeaders: "draft-8",
	keyGenerator: function (req) {
		return req.api_key_id // API Key
	},	
	handler: function (req, res, next) {
		res.status(429).json({
			message: "UrlReport. Too many requests.",
			limiter: "60 requests per minute"
		});
	},
})

router.get("/url-report/:url_id([0-9a-fA-F]{24})?", limiterUrlReport, async (req, res) => {
	// console.log("RateLimit h:",res.getHeaders())
	const { url_id } = req.params
	const { url } = req.query

	if(!url_id && !url){
		return res.status(400).json({ error: 'URL or ID must be provided' });
	}
	const filter = url_id ? { _id: url_id } : { url }
	const page = await pages.findOne(
		filter,
		"url domain verdict coverageState indexingState robotsTxtState pageFetchState googleCanonical userCanonical sitemaps is_indexed inspection_link crawledAs last_indexed last_canonical_change last_state_change last_inspection_date createdAt" 
	).exec();

	if(!page){
		return res.status(404).json({ error: 'URL report not found', filter });
	}
	if(!req.domain_ids?.includes(page?.domain)){
		return res.status(403).json({ error: 'Domain not authoraized' });
	}

	res.send(page);
});

export default router;
