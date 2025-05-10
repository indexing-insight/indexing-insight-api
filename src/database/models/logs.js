import mongoose from 'mongoose'

const LogSchema = new mongoose.Schema({
    message: String
}, { strict: false, timestamps: true })

export default mongoose.models.Logs || mongoose.model('Logs', LogSchema)