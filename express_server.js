import express from "express";
//import { connectToDb } from "./db_utils/db_connection.js";
import { connectViaMongoose } from "./db_utils/mongoose.js";
import mentorsRouter from "./routes/mentor.js";
import studentsRouter from "./routes/student.js";

const server = express();
const PORT = 4200;

server.use(express.json());

server.use("/mentors",mentorsRouter);
server.use("/students",studentsRouter);

//await connectToDb();
await connectViaMongoose();

server.listen(PORT, ()=>{
    console.log("server listening on port 4200")
});