import dotenv from "dotenv";
import db from './db.js'
import notification from "./notification.js";
export default function () {
    dotenv.config();
    db()
    notification()
}