import connectdb from "./db/index.js";
import {app} from "./app.js";

await connectdb()
.then(()=>{
    app.on("error", (err)=>{
        console.log("Error occurred while starting the server:", err)
        throw err;
    })

    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.error("mongoDB connection failed:", err)
    process.exit(1)
})