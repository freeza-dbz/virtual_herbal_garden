import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


//Generating Tokens
const generateAccessAndRefereshTokens = async (userId) => {

    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while generating Tokens")
    }
}

//Registering User
const registerUser = asyncHandler(async (req, res) => {

    // Destructure the request body

    const { fullName, email, username, password } = req.body;

    // Validate the request body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // Check if the user already exists

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists with same email or username")
    }

    //coverImage 

    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required")
    }
    const coverImage = await uploadonCloudinary(coverImageLocalPath);

    //User object for  db
    const user = await User.create({
        fullName,
        email,
        password,
        username,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        " -password -refreshToken "
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    //return res 

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                createdUser,
                "User created successfully",
            )
        )

})

//Loggin in
const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or Email is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = { //isske bare mai padh ki kyu use hota hai
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    }

    return res
        .status(200)
        .cookie("accesToken", accessToken, options) // these cookie are basically used to store the tokens in the user's browser
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                loggedInUser,
                "User logged in successfully"
            )
        )

})

//Refreshing Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {

    const IncomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!IncomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (IncomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token Mismatch")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, NewRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", NewRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: NewRefreshToken
                    },
                    "Access Token Refreshed Successfully"
                )
            )

    } catch (error) {
        throw new ApiError(401, error.message || "Refreshing Access Token Failed")
    }


})

//Logging Out : Auth required
const logoutUser = asyncHandler(async (req, res) => {

    //getting info of user using req.user because of auth middleware
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null,
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(
            200,
            {},
            "User logged out successfully"
        ))

})

//Change Password
const changePassword = asyncHandler(async (req, res) => {


    const { oldPassword, newPassword } = req.body

    const user = User.findById(user?._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect old password ")
    }

    user.password = newPassword

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            "Password updated successfully"
        ))

})

//Update details
const updateDetails = asyncHandler(async (req, res) => {

    const { fullName, email, username } = req.body

    if (!fullName || !email || !username) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            fullName,
            email,
            username
        }
    }, {
        new: true
    }
    )
        .select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Details Updated Successfully"
            )
        )

})

//Update Cover image : Auth required
const updateCoverImage = asyncHandler(async (req, res) => {

    const coverImagePath = req.files?.path

    if (!coverImagePath) {
        throw new ApiError(400, "Cover Image Path requiered")
    }

    const coverImage = uploadonCloudinary(coverImagePath)

    if (!coverImage.url) {
        throw new ApiError(404, "Error occured while uploading new cover image on cloudinary")
    }

    const user = User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    )

})

//Fetch user profile : Auth required
const fetchUserProfile = asyncHandler(async (req, res) =>{

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        )
    )

})


//Save Favorite Herb

//Change/Remove favorite Herb

//Fetch Favorite Herb





//only for admin / ie. me :

//get all user

//delete user



export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changePassword,
    updateDetails,
    updateCoverImage,
    fetchUserProfile,
    
}