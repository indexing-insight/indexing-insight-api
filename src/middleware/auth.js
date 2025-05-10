import crypto, { randomBytes } from "crypto";
import apikeys from "../database/models/apikeys.js";
export function hashKey(key) {
	return crypto
		.createHmac("sha256", process.env.API_KEY_SECRET)
		.update(key)
		.digest("hex");
}

export const generateApiKey = () => {
	const api_key = randomBytes(32).toString("hex"); // 64-character key

	return {
		api_key,
		hashed: hashKey(api_key),
	};
};

export default async function (req, res, next) {
	const authHeader = req.headers["authorization"];
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const rawKey = authHeader.split(" ")[1];
	const hashedKey = hashKey(rawKey);

	const key = await apikeys.findOneAndUpdate(
		{ keyHash: hashedKey },
		{ $set: { last_used_at: new Date() } },
		{
			projection: {
				label: 1,
				userId: 1,
				domain_ids: 1,
				scopes: 1,
			},
		}
	);
	if (!key || !!key?.revoked) {
		return res.status(403).json({ error: "Invalid API Key" });
	}

	req.api_key_id = key._id.toString();
	req.api_key_label = key.label;
	req.user_id = key.userId;
	req.domain_ids = key.domain_ids;
	req.scopes = key.scopes;

	next();
}
