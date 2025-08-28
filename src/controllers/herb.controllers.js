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

//update herb
const updateHerbName = asyncHandler(async (req, res) => {

    const { herbEnglishName, herbHindiName, herbLatinName } = req.body;

    const herb = await Herb.findOne({
        $or: [{ herbEnglishName }, { herbHindiName }, { herbLatinName }]
    })

    if (!herb) {
        throw new ApiError(404, "Provide one old herb name to update")
    }

    herb.set(req.body)
    await herb.save();

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                herb,
                "Herb updated successfully"
            )
        )


})

//deleting herb 
const deleteHerb = asyncHandler(async (req, res) => {

    const { herbHindiName } = req.body;

    if (!herbHindiName) {
        throw new ApiError(400, "Herb Hindi Name is required")
    }

    const herb = await Herb.findOneAndDelete({ herbHindiName })

    if (!herb) {
        throw new ApiError(404, "Herb not found")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {},
                "Herb deleted successfully"
            )
        )

})

//update descriptions 
const updateHerbDetails = asyncHandler(async (req, res) => {

    const { herbHindiName, about, description, disease } = req.body;

    if (!herbHindiName) {
        throw new ApiError(400, "Herb Hindi Name is required")
    }

    if (
        [about, description, disease].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All details are required")
    }

    const herb = await Herb.findOneAndUpdate(
        { herbHindiName }, {
        $set: {
            about,
            description,
            disease
        }
    },
        {
            new: true
        }
    )

    if (!herb) {
        throw new ApiError(404, "Herb not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                herb,
                "Herb details updated successfully"
            )
        );

})






export {
    addHerb,
    updateHerbName,
    deleteHerb,
    updateHerbDetails

}