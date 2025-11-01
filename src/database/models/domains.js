import mongoose from 'mongoose'

const ObjectId = mongoose.Types.ObjectId;

const DomainSchema = new mongoose.Schema({
	url: String,
	userId: ObjectId,
	full_inspection_cycle: Number,
	count_pages: Number,
	excluded_pages: Number,
	refine_pages: Number,
	sitemaps: Array,
	notifications: {
		default: ["daily"],
		type: Array
	},
	roots: Array,
	last_sitemap_update: Date,
	state: {
		default: 'init',
		type: String
	},
	enabled: { 
		default: false,
		type: Boolean
	},
	proc: {
		default: 'shared-1',
		type: String
	},
	timezone: {
		default: 'UTC',
		type: String
	},
	property_mode: String,
	permission:[{
		_id: ObjectId,
		role: String
	}],
	urls_collection: {
		default: 'shared',
		type: String
	}
}, { timestamps: true,strict: false })

DomainSchema.index({ url: 1 }, { unique: true });
DomainSchema.index({ enabled: 1 });
DomainSchema.index({ userId: 1 });

 
export default mongoose.models.Domains || mongoose.model('Domains', DomainSchema)