import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import { addHerb } from '../controllers/herb.controllers.js';

const router = Router();

router.route("/addHerb").post(
    upload.fields(
        [{
            name: 'herbPhoto',
            maxCount: 1
        }]
    ),
    addHerb
)

export default router;
