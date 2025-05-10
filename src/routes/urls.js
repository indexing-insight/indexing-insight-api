import express from "express";
import pages from "../lib/database/models/pages.js";
import rateLimit from "express-rate-limit";
const escapeRegExp = (string) => {
	return string ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null; // $& means the whole matched string
}

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

router.get("/urls/:domain_id([0-9a-fA-F]{24})", async (req, res) => {
	const { domain_id } = req.params
	// check for authorization
	if(!req.domain_ids.includes(domain_id)){
		return res.status(403).json({ error: 'Domain not authoraized' });
	}

	const { 
		url, search_type, segment, 
		verdict, coverageState, canonical,
		sort, order,
	} = req.query
	let { skip = 0, limit = 100 } = req.query
	skip = parseInt(skip)
	limit = parseInt(limit)
	
	let filter = { domain: domain_id, preferred: { $ne: null } }

	if (url) {
		switch (search_type) {
			case "contains":
				filter = { ...filter, url: { $regex: escapeRegExp(url), $options: "i" } }
				break
			case "not_contains":
				filter = { ...filter, url: { $not: { $regex: escapeRegExp(url), $options: "i" } } }
				break
			case "exact":
			default:
				filter = { ...filter, url }
				break
		}
	}
	if (segment) {
		filter = { ...filter, preferred: { $regex: `^${escapeRegExp(segment)}` }  }
	}

	if (verdict) {
		filter = { ...filter, verdict }
	}
	if (coverageState) {
		filter = { ...filter, coverageState }
	}
	if (canonical) {
		switch (canonical) {
			case "Matches":
				filter = { ...filter, is_canonical: true }
				break
			case "Does not match":
				filter = { ...filter, is_canonical: false }
				break
			case "No Data":
				filter = { ...filter, is_canonical: null }
				break
		}
	}
	
	let $sort = {
		url: 1
	}
	let hint = "domain_1_url_1_preferred_1"
	if (sort) {
		switch (sort) {
			case "Index Status":
				$sort = {
					verdict: -1,
					coverageState: 1
				}
				hint = "domain_1_coverageState_1_verdict_1_preferred_1"
				break
			case "Latest Crawl Time":
				$sort = {
					lastCrawlTime: -1
				}
				hint = "domain_1_lastCrawlTime_-1_verdict_1"
				break
			case "Earliest Crawl Time":
				$sort = {
					lastCrawlTime: 1
				}
				hint = "domain_1_lastCrawlTime_-1_verdict_1"
				break
			case "lastCrawlTime":
				$sort = {
					lastCrawlTime: parseInt(order) || -1
				}
				hint = "domain_1_lastCrawlTime_-1_verdict_1"
				break
		}
	}

	// console.log({filter, $sort, hint})

	const count_pages = await pages.countDocuments(filter).exec()
	const list_pages = await pages
		.find(
			filter,
			"url domain verdict coverageState lastCrawlTime is_canonical googleCanonical userCanonical inspection_link is_indexed",
			{ sort: $sort, skip, limit }
		)
		.hint(hint)
		
		.exec()

	const pagination = {
		count: count_pages,
		skip,
		limit,
		end: skip + limit >= count_pages,
		currentpage: Math.ceil(skip / limit) + 1,
		totalPage: Math.ceil(count_pages / limit)
	}
	res.send({ pages: list_pages, pagination })
})

export default router;
