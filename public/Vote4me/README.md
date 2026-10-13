# /Vote4me

First-person walk through Google Photorealistic 3D Tiles of the University of Edinburgh
(Bristo Square, McEwan Hall, Teviot, the Informatics Forum, George Square), with campaign
posters standing on the route and a link to the EUSA ballot.

Plain static files, copied as-is by Vite from `public/`, served at https://0krk0.dev/Vote4me/.
CesiumJS 1.145.0 loads from jsDelivr.

## Switch it on
Put ONE key in `config.js`:

- **Cesium ion token (free, no card).** ion.cesium.com → Access Tokens → Create token
  (default `assets:read` scope), Allowed URLs: `https://0krk0.dev`. Community plan:
  1,000 Google 3D Tiles sessions a month, personal / non-commercial use.
- **Google Maps Platform key.** Enable the Map Tiles API on a project with billing,
  restrict the key to that API and to the referrer `https://0krk0.dev/*`.

Each page visit opens one session (one root-tileset request).

Google's on-screen logo and data credits must stay visible (bottom left).
