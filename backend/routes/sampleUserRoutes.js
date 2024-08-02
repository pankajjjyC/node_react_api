import express from 'express';
import { getSampleUsers, createSampleUser, updateSampleUser, deleteSampleUser, getSampleUserNames } from '../controllers/sampleUserController.js';

const router = express.Router();

router.get('/', getSampleUsers);
router.get('/names', getSampleUserNames);
router.post('/', createSampleUser);
router.put('/:id', updateSampleUser);
router.delete('/:id', deleteSampleUser);

export default router;
