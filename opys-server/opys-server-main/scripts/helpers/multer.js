import aws from "aws-sdk";
import fs from "fs";
import env from "dotenv";
import { v4 } from "uuid";
env.config();

const {
  S3_ENDPOINT,
  BUCKET_NAME,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  S3_REGION,
} = process.env;

const spacesEndpoint = new aws.Endpoint(S3_ENDPOINT);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
  region: S3_REGION,
});

function uploadFile(file, path) {
  const buffer = new Buffer.from(
    file.uri.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const uploadParams = {
    Bucket: BUCKET_NAME + path,
    Body: buffer,
    Key: v4(),
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: file.type,
  };
  return s3.upload(uploadParams).promise().catch();
}
// uploads a file to s3
function uploadFileReq(file, path) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: BUCKET_NAME + path,
    Key: v4(),
    ACL: "public-read",
    Body: fileStream,
    Key: file.filename,
    ContentType: file.mimetype,
  };

  return s3.upload(uploadParams).promise();
}
function deleteObject(Key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key,
  };
  return s3.deleteObject(params).promise().catch();
}

export { uploadFile, uploadFileReq, deleteObject, s3 };
