import { Router } from 'express';
import * as candidateController from '../controllers/candidate.controller';
import { uploadCv } from '../middlewares/upload.middleware';

const router = Router();

router.get('/autocomplete', candidateController.autocomplete);
router.post('/', candidateController.createCandidate);
router.post('/:id/upload-cv', uploadCv, candidateController.uploadCv);

export default router;
