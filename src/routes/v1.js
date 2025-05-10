import express from 'express';
import urlsRoutes from './urls.js';
import urlReportRoutes from './url-report.js';
import auth from '../middleware/auth.js';
import domains from '../database/models/domains.js';
import users from '../database/models/users.js';

const router = express.Router();
router.use(auth);
router.get("/", async (req, res, next)=>{
	const domains_list = await domains.find({_id:{$in: req.domain_ids}}, "url").exec()
	const user_info = await users.findOne({_id: req.user_id }, "email").exec()
	res.send({
		_id: req.api_key_id,
		api_key_label: req.api_key_label,
		account: user_info,
		domains_access: domains_list,
		// scopes: req.scopes,
	})
})
router.use(urlReportRoutes);
router.use(urlsRoutes);

export default router;