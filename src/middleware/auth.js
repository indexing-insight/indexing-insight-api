import crypto, { randomBytes } from 'crypto';
import apikeys from '../database/models/apikeys.js';
export function hashKey(key) {
	return crypto
		.createHmac("sha256", process.env.API_KEY_SECRET)
		.update(key)
		.digest("hex");
}
// {
// 	"api_key": "ba126eb37954eae36ed4a51b7f0be296c83656737dcdbeaed5469f5fe8214db4",
// 	"hashed": "9581621e4d73af8bb3d6a72e8f2dea9564644cef2378f2dc32a5efe84a055e86"
// 	}
export const generateApiKey = () => {
	const api_key = randomBytes(32).toString('hex'); // 64-character key

	return {
		api_key,
		hashed: hashKey(api_key)
	}
};

export default async function (req, res, next) {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
	  return res.status(401).json({ error: 'Unauthorized' });
	}
  
	const rawKey = authHeader.split(' ')[1];
	const hashedKey = hashKey(rawKey);
	
	const key = await apikeys.findOne({ keyHash: hashedKey }, "label userId domain_ids scopes");
	if (!key || !!key?.revoked) {
	  return res.status(403).json({ error: 'Invalid API Key' });
	}
  
	req.api_key_id = key._id.toString();
	req.api_key_label = key.label;
	req.user_id = key.userId;
	req.domain_ids = key.domain_ids;
	req.scopes = key.scopes;

	next();
  };