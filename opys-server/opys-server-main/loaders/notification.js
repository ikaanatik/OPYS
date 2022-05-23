import webPush from "web-push";
const vapidKeys = {
  publicKey: process.env.WEB_PUSH_PUBLIC_KEY,
  privateKey: process.env.WEB_PUSH_PRIVATE_KEY,
};
export default () => {
  webPush.setVapidDetails(
    "mailto:opys.suport@gmail.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
};
