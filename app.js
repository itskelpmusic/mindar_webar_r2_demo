import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar/dist/mindar-image-three.prod.js";

const statusEl = document.getElementById("status");
function setStatus(msg) {
  console.log(msg);
  statusEl.textContent = msg;
}

document.addEventListener("DOMContentLoaded", async () => {
  setStatus("initializing AR…");

  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "./assets/90sPop.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // Create anchor for target index 0
  const anchor = mindarThree.addAnchor(0);

  // Setup GLTF loader
  const loader = new GLTFLoader();
  let model = null;

  const GLB_URL =
    "https://frosty-union-c144.itskelpmusic.workers.dev/Lamesh.glb";

  setStatus("loading GLB…");

  loader.load(
    GLB_URL,
    (gltf) => {
      model = gltf.scene;

      // Recommended starting transforms
      model.visible = false; // Make invisible until target found
      model.scale.set(0.2, 0.2, 0.2);
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);

      anchor.group.add(model);

      setStatus("model loaded – point at target");
    },
    (xhr) => {
      if (xhr.total) {
        const pct = (xhr.loaded / xhr.total) * 100;
        setStatus(`downloading model: ${pct.toFixed(1)}%`);
      } else {
        setStatus("downloading model…");
      }
    },
    (error) => {
      console.error("Error loading GLB:", error);
      setStatus("failed to load model");
    }
  );

  // When MindAR detects the printed foamex target
  mindarThree.controller.on("targetFound", () => {
    console.log("FOUND TARGET!");
    setStatus("target found");

    if (model) model.visible = true;
  });

  // When target is not visible
  mindarThree.controller.on("targetLost", () => {
    console.log("LOST TARGET!");
    setStatus("target lost");

    if (model) model.visible = false;
  });

  // Start AR session
  await mindarThree.start();

  // Render loop
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
