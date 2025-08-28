import mongoose from "mongoose";

const herbSchema = new mongoose.Schema({
    herbPhoto: {
        type: String, //from cloudonary
        required: true,
    },
    herbHindiName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    herbEnglishName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    herbLatinName: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    disease: {
        type: String,
        required: true,
    },
    about: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    }
}, {
    timestamps: true
}, {
    versionKey: false
})

export const Herb = mongoose.model("Herb", herbSchema)