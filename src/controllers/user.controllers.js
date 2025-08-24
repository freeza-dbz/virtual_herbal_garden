import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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





export {
    registerUser,
    loginUser,
}