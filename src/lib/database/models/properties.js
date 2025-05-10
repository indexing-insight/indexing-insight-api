import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId;

const PropertySchema = new mongoose.Schema({
	domain: ObjectId,
	siteUrl: String,
	last_inspect: Date,
	userId: ObjectId,
	permissionLevel: String
}, { timestamps: true, strict: false, versionKey: false })

PropertySchema.virtual("site").get(function () {
	return this.siteUrl.replace("sc-domain:", "")
})
PropertySchema.virtual("type").get(function () {
	return this.siteUrl.startsWith("sc-domain:") ? "Domain property" : "URL prefix"
})

PropertySchema.index({ domain: 1, siteUrl: 1 }, { unique: true });
PropertySchema.index({ permissionLevel: 1 });

export default mongoose.models.Properties || mongoose.model('Properties', PropertySchema)