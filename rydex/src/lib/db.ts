import mongoose from "mongoose";

const mongo_url = process.env.MONGODB_URL;

if(!mongo_url){
    throw new Error("DB URL not found")
}

let cached = global.mongooseConn; // to prevent multiple connections, defined in global.d.ts

if(!cached){
    cached = global.mongooseConn = {conn: null, promise: null}
}

const connectDB = async() => {
    if(cached.conn){
        return cached.conn;
    }

    if(!cached.promise){
        cached.promise = mongoose.connect(mongo_url).then(c=>c.connection)
    }

    try {
        const conn = await cached.promise
        return conn;
    } catch (error) {
        console.log(error)
    }
}

export default connectDB