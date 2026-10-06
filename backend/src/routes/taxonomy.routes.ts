import { Router } from 'express';
import { TaxonomyController } from '../controllers/taxonomy.controller.js';

const router = Router();

router.get('/categories', TaxonomyController.getCategories);
router.get('/skills', TaxonomyController.getSkills);

export const taxonomyRoutes = router;
