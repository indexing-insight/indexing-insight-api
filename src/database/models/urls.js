import mongoose from "mongoose"
import pages from "./pages"

const UrlSchema = new mongoose.Schema(
	{
		url: {
			type: String,
			required: true,
			unique: true,
			minlength: 10
		},
		last_inspection_date: Date,
		preferred: String,
		site_properties: {
			type: Array,
			default: []
		},
		verdict: String,
		coverageState: String,
		lastCrawlTime: Date,
		// crawl_history: [Date],
		is_been_indexed: {
			type: Boolean,
			default: false
		},
		sitemap_check: Date,
		state: String,
		possible_property: String
	},
	{ timestamps: true, strict: false }
)
UrlSchema.virtual("is_indexed").get(function () {
	return this.verdict === "PASS"
		? "Yes"
		: this.verdict === "NEUTRAL"
		? "No"
		: "--"
})

UrlSchema.virtual("days_since_last_crawl").get(function () {
	return this.lastCrawlTime ? moment().diff(moment(this.lastCrawlTime),'days') : ''
})
UrlSchema.virtual("lastCrawlTime_format").get(function () {
	return this.lastCrawlTime ? moment(this.lastCrawlTime).format() : ''
})

const getDomainURLsModel = (domain) => {
	return domain.urls_collection === 'private'
		? mongoose.models[`urls.${domain._id}`] ||
				mongoose.model(`urls.${domain._id}`, UrlSchema, `urls.${domain._id}`)
		: pages
}
export default getDomainURLsModel
