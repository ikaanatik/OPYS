import multer from "multer";
import path from "path";

// Multer config
const fileUpload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    // if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
    //   cb(new Error("Please just upload image."), false);
    //   return;
    // }
    cb(null, true);
  },
});
export default fileUpload;
