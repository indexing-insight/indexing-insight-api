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

export default mongoose.models.Pages || mongoose.model("Pages", PageSchema);
