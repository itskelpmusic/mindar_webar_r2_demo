# MindAR + Three.js + Cloudflare R2 WebAR Demo

This project is a minimal example of WebAR that:

- Uses **mind-ar-js** for image tracking in the browser
- Uses **Three.js** + `GLTFLoader` to render a GLB model
- Streams the GLB from **Cloudflare R2** via your existing Worker URL
- Is fully self-hostable (works on GitHub Pages, Netlify, etc.)

## File structure

- `index.html` – main page, includes MindAR, Three.js, and loads `app.js`
- `style.css` – basic full-screen layout
- `app.js` – AR logic: sets up MindAR, loads your GLB from R2, anchors it to an image target
- `assets/target.mind` – **placeholder** MindAR image target file (you must generate this)

## Setup steps

1. Generate a `.mind` image target file from your PNG/JPG using MindAR's image compiler.
   - See: https://github.com/hiukim/mind-ar-js/tree/master/image-target
   - Name it `target.mind` and place it in the `assets/` folder.

2. Replace the GLB URL in `app.js` if needed:

```js
const GLB_URL = "https://frosty-union-c144.itskelpmusic.workers.dev/Lamesh.glb";
```

3. Host this folder on GitHub Pages, Netlify, or any static HTTPS host.

4. Open `index.html` (via the hosted URL) on your mobile browser, allow camera access, and point at the target image you used to generate `target.mind`.

You should see the GLB appear anchored to that image.

## Notes

- `anchor = mindarThree.addAnchor(0)` uses the first image in your `.mind` file.
- Adjust `model.scale.set(...)` in `app.js` as needed to match the physical size of your target.
- You can extend this to multiple image targets by adding more anchors and different GLB URLs.
