import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId;

const UserSchema = new mongoose.Schema({
    name: String,
	email: {
		type: String,
		trim: true,
		lowercase: true
	},
	image: String,
	emailVerified: Date,
	role: {
		default: 'owner',
		type: String
	},
	plan: {
		// default: 'TIER_1',
		type: String
	},
	locked: {
		default: false,
		type: Boolean
	},
	last_login: Date,
	signup_at: Date,
	customer_id: String, 
	sub_id: String, 
	sub_status: String,
	trans_id: String, 
	trans_status: String,
	product_id: String, 
	price_id: String,
	next_billed_at: Date,
	cancelled_at: Date,
	scheduled_change: Object,
	marketing_consent: Boolean,
	invited_by: ObjectId,
	invited_at: Date,
}, { timestamps: true })

UserSchema.index({ createdAt: -1 });

export default mongoose.models.Users || mongoose.model('Users', UserSchema)