/* eslint-disable */
console.log("ciao");

document.addEventListener("DOMContentLoaded", async () => {
  console.debug("Waiting for MusicKit JS to load...");
  var mkit = typeof MusicKit !== "undefined" ? MusicKit : null;

  while (mkit === null) {
    mkit = typeof MusicKit !== "undefined" ? MusicKit : null;
    console.debug("Waiting for MusicKit JS to load...");
  }

  // @ts-check
  try {
    console.log("configuring...");
    mkit.configure({
      developerToken: "{{DEVELOPER_TOKEN}}",
      app: {
        name: "Raycast Music",
        build: "0.0.1",
      },
    });

    const instance = mkit.getInstance();

    if (instance.isAuthorized) {
      console.warn("already authroized");
      return;
    }

    console.log("signing in...");
    const accessToken = await instance.authorize();
    console.log("signed in!");
    // if (!accessToken) {
    //   throw new Error("Authentication Failed: Missing accessToken");
    // }

    // window.location.href = `raycast://extensions/fedevitaledev/music?accessToken=${accessToken}`;
  } catch (e) {
    alert(
      "Something went wrong while authenticating. Please check the console for more details",
    );
    console.error(e);
  }
});
