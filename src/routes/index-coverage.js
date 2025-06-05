import express from "express";
import pages from "../database/models/pages.js";
import domains from "../database/models/domains.js";

const escapeRegExp = (string) => {
	return string ? string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : null; // $& means the whole matched string
};

const router = express.Router();

router.get("/index-coverage/:domain_id([0-9a-fA-F]{24})", async (req, res) => {
	const { domain_id } = req.params;
	// check for authorization
	if (!req.domain_ids.includes(domain_id)) {
		return res.status(403).json({ error: "Domain not authoraized" });
	}

	const domain_info = await domains.findOne({ _id: domain_id }).exec();

	let filter = {};
	const preferred = req.query.segment;
	if (preferred) {
		filter = {
			...filter,
			preferred: { $regex: `^${escapeRegExp(preferred)}` },
		};
	}

	// get list of coveragestate per not indexed pages
	const not_indexed_states = await pages
		.aggregate([
			{
				$match: {
					domain: domain_info._id,
					preferred: { $ne: null },
					verdict: "NEUTRAL",
					...filter,
				},
			},
			{
				$group: {
					_id: "$coverageState",
					count: {
						$sum: 1,
					},
				},
			},
			{
				$project: {
					_id: 0,
					label: "$_id",
					count: 1,
				},
			},
			{
				$sort: {
					count: -1,
				},
			},
		])
		.exec();

	const metrics = await pages
		.aggregate([
			{
				$match: {
					domain: domain_info._id,
					preferred: { $ne: null },
					...filter,
				},
			},
			{
				$group: {
					_id: "$verdict",
					count: { $sum: 1 },
				},
			},
		])
		.exec();
		
	res.send({
		domain_id,
		preferred,
		...metrics.reduce(
			(acc, c) => ({
				...acc,
				[c._id || "pending"]: c.count,
				total: (acc.total || 0) + (c.count || 0),
			}),
			{}
		),
		not_indexed_states,
	});
});

export default router;
