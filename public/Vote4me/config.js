/*
  Vote4me · 3D Edinburgh settings.

  The walk streams Google Photorealistic 3D Tiles. It needs ONE of these two keys.
  Both are meant to be public in a web page; protect them by restricting them to
  your domain (see README in this folder).

  Option A (free, no card): a Cesium ion access token.
    Sign up at https://ion.cesium.com/signup, open Access Tokens, create a token
    with the default "assets:read" scope, and add https://0krk0.dev under
    "Allowed URLs". The free Community plan includes 1,000 Google 3D Tiles
    sessions a month for personal, non-commercial use.

  Option B: a Google Maps Platform API key with the Map Tiles API enabled
    (Google Cloud project with billing switched on). Restrict it to the
    Map Tiles API and to the referrer https://0krk0.dev/*.

  Fill in one, leave the other empty.
*/
window.VOTE4ME_CONFIG = {
  cesiumIonToken: "",
  googleMapsKey: "",
};
