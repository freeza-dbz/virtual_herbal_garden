import { Router } from 'express';
import { upload } from '../middleware/multer.middleware.js';
import {
    addHerb,
    updateHerbName,
    deleteHerb,
    updateHerbDetails,

} from '../controllers/herb.controllers.js';

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

router.route("/updateHerbName").post(updateHerbName);

router.route("/deleteHerb").post(deleteHerb);

router.route("/updateHerbDetails").post(updateHerbDetails);

export default router;
