import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changePassword,
    updateDetails,
    updateCoverImage,
    fetchUserProfile,

 } from "../controllers/user.controllers.js";

const router = Router();

router.route("/register").post(
    upload.fields(
        [{
            name: "coverImage",
            maxCount: 1
        }]
    ),
    registerUser
)

router.route("/login").post(loginUser);

//secured routes 

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/changePassword").post(changePassword);

router.route("/updateDetails").post(updateDetails);

router.route("/updateCoverImage").post(verifyJWT, updateCoverImage);

router.route("/fetchProfile").post(verifyJWT, fetchUserProfile);



export default router;