import mongoose from "mongoose";
import { DB_NAME, DB_USER } from "../constants.js";

const connectdb = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`mongoDB connection established!! DB host: ${connectionInstance.connection.host}`);
    } catch (err) {
        console.error(`Error connecting to mongoDB: ${err.message}`);
        process.exit(1);
    }
}


export default connectdb;
