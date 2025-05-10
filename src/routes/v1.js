import express from 'express';
import urlsRoutes from './urls.js';
import urlReportRoutes from './url-report.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);
router.use(urlReportRoutes);
router.use(urlsRoutes);

export default router;