# /Vote4me

Self-hosted first-person walk around McEwan Hall, Bristo Square, Teviot, the Informatics Forum,
George Square and the Meadows (2.5 km square), rendered with three.js (loaded from jsDelivr).
No map keys and no third-party 3D services.

## Data

| File | What | Source and licence |
| --- | --- | --- |
| `terrain.bin.gz` | Ground height, 1 m grid in the central 1.25 km, 2 m beyond | LiDAR for Scotland Phase 5 DTM (50 cm), © Scottish Government and Fugro (2021), OGL v3 |
| `bt/<cell>.bin.gz` | Full-detail buildings in 125 m grid cells, streamed around you (nearest and in front first) and dropped behind you | OpenStreetMap (ODbL) + LiDAR Phase 5 DSM (OGL v3) |
| `hlod.bin.gz` | The whole city's 7,192 buildings in light form (simplified outlines and LiDAR roofs) for the skyline beyond the streaming radius | same |
| `world.json.gz` | Streets, paths, kerbs, railings, benches, lamps, bus stops, signs, 20,204 trees (positions, heights and crown widths from the canopy height model) | OpenStreetMap (ODbL) + LiDAR Phase 5 |
| `env.f16.gz`, `sky.jpg` | Sky lighting | Poly Haven (CC0) |
| `tex/` | Photo-scanned PBR materials (sandstone, slate, setts, paving, bark…) | Poly Haven (CC0) |
| `hero_*.jpg` | Photographs projected onto McEwan Hall, Teviot Row House and the Informatics Forum; `*_m.jpg` are masks | Wikimedia Commons (CC BY-SA) |
| `img/` | Campaign posters and the ballot QR code | Rajesh Kumar Kona |

All binary files are gzip; the page decompresses them with `DecompressionStream`.

## Streaming and frame rate

- Full detail only within a few hundred metres (200–520 m by quality level); everything further is the
  light far-field version. Tiles load in the background a few milliseconds per frame.
- Trees: 20,204 from the LiDAR, drawn with full leaf clusters within 60–150 m and a light version beyond.
- Terrain in 125 m tiles at 1, 2, 4 or 8 m spacing by distance.
- Shadows re-render only when the shadow window moves (and every few frames for swaying leaves).
- "Hold 60 fps" lowers the render resolution when the GPU can't keep up and raises it again up to
  the Max resolution slider when it can.
- TAA (temporal anti-aliasing) on High and Ultra.

## Accuracy

- LiDAR was reprojected from British National Grid with the OSTN15 grid and checked against the
  OSM footprints by cross-correlation (offset 0.0 m east, 0.5 m north).
- Roof shapes and wall tops follow the 50 cm DSM, smoothed slightly; trees overhanging a roof
  and small rooftop details can still show up as bumps.
- Facades away from the three photographed buildings use generic sandstone and window
  textures in the right colour family, not the real windows.
- The LiDAR was flown in 2020–21; anything built or demolished since is not in it.

## What it would take to go further

Street-level realism needs street-level capture. The plan is Gaussian-splat captures
(`.spz` / `.ply`) of individual frontages layered over the LiDAR model, with walking and collision
staying on the LiDAR geometry. This is not wired in yet:

1. Walk each frontage with a phone (Scaniverse or Polycam export `.spz`/`.ply`), or film it and
   run COLMAP + gsplat on a GPU (a free Colab T4 is enough for one building).
2. Align each splat to the LiDAR model (three or more matched corners).
3. Render them with Spark (MIT), which needs the page upgraded from three.js r160 to r180+.

4K at 60 fps depends on the GPU: the page picks a quality tier from the device and adapts while
you walk. Settings → Quality → Ultra forces the highest tier.
