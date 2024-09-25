/* import mongodb from "mongodb"

const localurl = "mongodb://localhost:27017";
const dbname = "mentor-student1";

const client = new mongodb.MongoClient(localurl);
export const db = client.db(dbname);

export const connectToDb = async () => {
    try {
        await client.connect();
        console.log("connected to DB");
    }
    catch (e) {
        console.log("connection failed with error " + " " + e);
        process.exit();
    }
} */