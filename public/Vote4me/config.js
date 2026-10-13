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
  cesiumIonToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6Im5nckRFOU5DcDlIVWQ3TFUiLCJqdGkiOiJmOTFkNjZiNS1hZDAwLTRkOTgtYTI4Mi0yM2ZmNTM4NjExYjgiLCJpZCI6NTIzMDAzLCJzdWIiOiJrb25hcmFqZXNoa3VtYXIiLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoiVm90ZTRtZSIsImlhdCI6MTc5MTkwNTUyM30.3dCf7ABnbWE5jQoVHxEa8j4MlhpygCz7O6NCdV74FfI", // restricted to https://0krk0.dev (and localhost:8790 for testing); expires 13 Nov 2026
  googleMapsKey: "",
};
