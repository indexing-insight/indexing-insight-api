import express from "express";
// import rateLimit from "express-rate-limit";
import UrlReport from "../viewmodel/UrlReport.js";
import getDomainURLsModel from "../database/models/urls.js";
import domains from "../database/models/domains.js";

const escapeRegExp = (string) => {
	return string ? string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : null; // $& means the whole matched string
};

const VERDICT = {
	indexed: "PASS",
	not_indexed: "NEUTRAL"
}
const router = express.Router();

// const limiterUrls = rateLimit({
// 	windowMs: 60 * 1000, // 1 minute
// 	limit: 60, // Limit each API key
// 	identifier: "urls-limit",
// 	standardHeaders: "draft-8",
// 	keyGenerator: function (req) {
// 		return req.api_key_id; // API Key
// 	},
// 	handler: function (req, res, next) {
// 		res.status(429).json({
// 			message: "Urls. Too many requests.",
// 			limiter: "60 requests per minute",
// 		});
// 	},
// });

router.get(
	"/urls/:domain_id([0-9a-fA-F]{24})",
	// limiterUrls,
	async (req, res) => {
		const { domain_id } = req.params;
		// check for authorization
		if (!req.domain_ids.includes(domain_id)) {
			return res.status(403).json({
				error: "forbidden",
				message: "You are not authorized to access this website.",
				status: 403
			});
		}

		const domain_info = await domains.findOne({ _id: domain_id }).exec();
		const urlCollecitons = getDomainURLsModel(domain_info)
		let { skip = 0, limit = 100 } = req.query;
		skip = parseInt(skip);
		limit = parseInt(limit) || 100;
		if (limit > 100) {
			limit = 100;
		}

		const {
		// 	url, search_type, 
			index_summary,
			segment,
			index_coverage_state
		// 	verdict, canonical, new_pages,
		// 	sort, order,
		} = req.query
		let filter = { 
			...domain_info.urls_collection !== 'private' && {
				domain: domain_id
			}, 
			state: "mapped" 
		};

		// if (url) {
		// 	switch (search_type) {
		// 		case "contains":
		// 			filter = { ...filter, url: { $regex: escapeRegExp(url), $options: "i" } }
		// 			break
		// 		case "not_contains":
		// 			filter = { ...filter, url: { $not: { $regex: escapeRegExp(url), $options: "i" } } }
		// 			break
		// 		case "exact":
		// 		default:
		// 			filter = { ...filter, url }
		// 			break
		// 	}
		// }
		if (segment) {
			filter = { ...filter, preferred: { $regex: `^${escapeRegExp(segment)}` }  }
		}
		if (index_summary) {
			filter = { ...filter, verdict: VERDICT[index_summary] }
		}
		if (index_coverage_state) {
			filter = { ...filter, coverageState: index_coverage_state }
		}
		// if (canonical) {
		// 	switch (canonical) {
		// 		case "Matches":
		// 			filter = { ...filter, is_canonical: true }
		// 			break
		// 		case "Does not match":
		// 			filter = { ...filter, is_canonical: false }
		// 			break
		// 		case "No Data":
		// 			filter = { ...filter, is_canonical: null }
		// 			break
		// 	}
		// }

		// if (new_pages) {
		// 	switch (new_pages) {
		// 		case "yesterday":
		// 			filter = {
		// 				...filter,
		// 				createdAt: {
		// 					$gt: moment.utc().startOf("day").subtract(1, "day").toDate()
		// 				}
		// 			}
		// 			break
		// 		case "3_days":
		// 			filter = {
		// 				...filter,
		// 				createdAt: {
		// 					$gt: moment.utc().startOf("day").subtract(3, "day").toDate()
		// 				}
		// 			}
		// 			break
		// 		case "7_days":
		// 			filter = {
		// 				...filter,
		// 				createdAt: {
		// 					$gt: moment.utc().startOf("day").subtract(7, "day").toDate()
		// 				}
		// 			}
		// 			break
		// 		case "30_days":
		// 			filter = {
		// 				...filter,
		// 				createdAt: {
		// 					$gt: moment.utc().startOf("day").subtract(30, "day").toDate()
		// 				}
		// 			}
		// 			break
		// 	}
		// }

		let $sort = {
			url: 1,
		};
		let hint = "url_preferred";
		// if (sort) {
		// 	switch (sort) {
		// 		case "Index Status":
		// 			$sort = {
		// 				verdict: -1,
		// 				coverageState: 1
		// 			}
		// 			hint = "domain_1_coverageState_1_verdict_1_preferred_1"
		// 			break
		// 		case "Latest Crawl Time":
		// 			$sort = {
		// 				lastCrawlTime: -1
		// 			}
		// 			hint = "domain_1_lastCrawlTime_-1_verdict_1"
		// 			break
		// 		case "Earliest Crawl Time":
		// 			$sort = {
		// 				lastCrawlTime: 1
		// 			}
		// 			hint = "domain_1_lastCrawlTime_-1_verdict_1"
		// 			break
		// 		case "lastCrawlTime":
		// 			$sort = {
		// 				lastCrawlTime: parseInt(order) || -1
		// 			}
		// 			hint = "domain_1_lastCrawlTime_-1_verdict_1"
		// 			break
		// 	}
		// }

		// console.log({filter, $sort, hint})

		const count_pages = await urlCollecitons.countDocuments(filter).exec();
		const list_pages = await urlCollecitons
			.find(
				filter,
				"url domain verdict coverageState lastCrawlTime is_canonical googleCanonical userCanonical inspection_link is_indexed",
				{ sort: $sort, skip, limit }
			)
			.hint(hint)
			.lean()
			.exec();

		const pagination = {
			next_page:
				skip + limit >= count_pages
					? null
					: `/v1/urls/${domain_id}?skip=${
							skip + limit
					  }&limit=${limit}`,
			prev_page:
				skip > 0
					? `/v1/urls/${domain_id}?skip=${
							skip - limit
					  }&limit=${limit}`
					: null,
			end: skip + limit >= count_pages,
			count: count_pages,
			skip,
			limit,
			current_page: Math.ceil(skip / limit) + 1,
			total_page: Math.ceil(count_pages / limit),
		};
		res.send({
			urls: list_pages.map((p) => new UrlReport(p).toList()),
			pagination,
		});
	}
);

export default router;
