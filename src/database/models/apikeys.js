import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId;

const ApiKeySchema = new mongoose.Schema({
	userId: ObjectId,      // Linked to a user
	keyHash: String,          // Secure random string
	label: String,        // Friendly name (e.g., "My App #1")
	domain_ids: [ObjectId],
	scopes: Array,
	revoked: { 
		type: Boolean,
		default: false
	},     // For disabling keys
	last_used_at: Date,
	expires_at: Date
}, { timestamps: true })

ApiKeySchema.index({ userId: 1 });
ApiKeySchema.index({ keyHash: 1 });

export default mongoose.models.ApiKeys || mongoose.model('ApiKeys', ApiKeySchema)