import Mongoose from "mongoose";

const db = Mongoose.connection;
db.once("open", () => {
  console.log("Connected to the database");
});

const connectDB = async () => {
  await Mongoose.connect(process.env.MONGODB_PRODUCTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default connectDB;

// process.env.NODE_ENV === "production"
//   ? process.env.MONGODB_PRODUCTION_URL
//   : `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
