import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Herb } from "../models/herbs.models.js";
import jwt from "jsonwebtoken"
import { uploadonCloudinary } from "../utils/cloudinary.js";

//admin controllers :

//add herbs 
const addHerb = asyncHandler(async (req, res) => {

    const { herbHindiName, herbEnglishName, herbLatinName, disease, about, description } = req.body;

    if (
        [herbHindiName, herbEnglishName, herbLatinName, disease, about].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All details are required")
    }

    const existedHerb = await Herb.findOne({
        $or: [{ herbHindiName }, { herbEnglishName }, { herbLatinName }]
    })

    if (existedHerb) {
        throw new ApiError(400, "Herb already existed")
    }

    //herb photo

    const herbPhotoLocalPath = req.files?.herbPhoto[0]?.path;

    if (!herbPhotoLocalPath) {
        throw new ApiError(400, "Herb photo is required")
    }

    const herbPhoto = await uploadonCloudinary(herbPhotoLocalPath);

    //uploading herb in db
    const herb = await Herb.create({
        herbHindiName,
        herbEnglishName,
        herbLatinName,
        disease,
        about,
        description,
        herbPhoto: herbPhoto?.url || ""
    });


    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                herb,
                "Herb added successfully"
            )
        );

})







export {
    addHerb,
    
}