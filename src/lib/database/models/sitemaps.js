import mongoose from 'mongoose'
const ObjectId = mongoose.Types.ObjectId;

const SitemapSchema = new mongoose.Schema({
    domain: ObjectId,
    url: String,
    type: String,
    state: {
        type: String,
        default: "pending"
    },
    count: Number,
    unique_urls: Number,
    error: Object,
    audit: Object,
    sitemaps_index: {
        type: Array,
        default: undefined
    },
    removed_at: Date
}, { timestamps: true })

SitemapSchema.index({ domain:1, url: 1 }, { unique: true });
SitemapSchema.index({ domain:1, sitemaps_index: 1 });
SitemapSchema.index({ domain:1, state: 1 });
export default mongoose.models.Sitemaps || mongoose.model('Sitemaps', SitemapSchema)