import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const PageSchema = new mongoose.Schema(
	{
		url: String,
		domain: ObjectId,
		last_inspection_date: Date,
		preferred: String,
		site_properties: {
			type: Array,
			default: [],
		},
		verdict: String,
		coverageState: String,
		lastCrawlTime: Date,
		// crawl_history: [Date],
		is_been_indexed: {
			type: Boolean,
			default: false,
		},
		state: {
			type: String,
			default: "to_map",
		},
		possible_property: String,
	},
	{
		timestamps: true,
		strict: false,
		toObject: { virtuals: true },
		toJSON: { virtuals: true },
	}
);
PageSchema.virtual("is_indexed").get(function () {
	return this.verdict === "PASS"
		? "Yes"
		: this.verdict === "NEUTRAL"
		? "No"
		: "--";
});

PageSchema.index({ url: 1, domain: 1 }, { sparse: true, unique: true });
PageSchema.index({ domain: 1, preferred: 1, last_inspection_date: -1 });
PageSchema.index({ domain: 1, site_properties: 1, last_inspection_date: -1 });
PageSchema.index({ domain: 1, verdict: 1, preferred: 1 });
PageSchema.index({ state: 1, domain: 1 });
PageSchema.index({ possible_property: 1, domain: 1, state: 1 });

// index query pages with pagination and different sorting
PageSchema.index({ domain: 1, url: 1, preferred: 1 });
PageSchema.index({ domain: 1, coverageState: 1, verdict: 1, preferred: 1 });
PageSchema.index({ domain: 1, lastCrawlTime: -1, verdict: 1 });

// PageSchema.pre('find', function() {
// 	if (!this.getQuery().domain) {
// 	  this.error(new Error('Not allowed to query without setting domain'));
// 	}
// });
export default mongoose.models.Pages || mongoose.model("Pages", PageSchema);
