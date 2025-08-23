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
    },
    herbEnglishName: {
        type: String,
        required: true,
        trim: true,
    },
    herbLatinName: {
        type: String,
        required: true,
        trim: true,
    },
    disease: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

export const Herb = mongoose.model("Herb", herbSchema)