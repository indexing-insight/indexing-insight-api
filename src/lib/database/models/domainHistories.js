import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const DomainHistorySchema = new mongoose.Schema(
	{ 
		timestamp: Date, 
		metadata: {
			domain: ObjectId,
			preferred: String
		},
		count_pages: Number, 
		indexed: Number, 
		not_indexed: Number, 
		pending: Number
	},
	{
		timeseries: {
			timeField: "timestamp",
			metaField: "metadata",
			bucketMaxSpanSeconds: 86400, // daily
			bucketRoundingSeconds: 86400,
		},
		expireAfterSeconds: 7776000 // 90 days
	}
);

export default mongoose.models.DomainHistories || mongoose.model("DomainHistories", DomainHistorySchema);
