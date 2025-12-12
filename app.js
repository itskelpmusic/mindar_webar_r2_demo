import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";

const statusEl = document.getElementById("status");
const setStatus = (msg) => {
  if (statusEl) statusEl.textContent = "Status: " + msg;
  console.log(msg);
};

setStatus("initializing");

const start = async () => {
  // MindAR setup – uses your Lament.mind file
  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "./assets/Lament.mind", // make sure this file exists
  });

  const { renderer, scene, camera } = mindarThree;

  // Simple light so the model isn't black
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  hemi.position.set(0, 1, 0);
  scene.add(hemi);

  // Anchor = first image in the .mind file (index 0)
  const anchor = mindarThree.addAnchor(0);

  const loader = new GLTFLoader();
  let model = null;

  // Your Cloudflare Worker URL
  const GLB_URL =
    "https://frosty-union-c144.itskelpmusic.workers.dev/Lamesh.glb";

  setStatus("loading GLB…");

  loader.load(
    GLB_URL,
    (gltf) => {
      model = gltf.scene;
      // Adjust as needed for your target size
      model.scale.set(0.2, 0.2, 0.2);
      model.visible = false;
      anchor.group.add(model);
      setStatus("model loaded – point at target");
    },
    (xhr) => {
      if (xhr.total) {
        const pct = (xhr.loaded / xhr.total) * 100;
        setStatus("downloading model: " + pct.toFixed(1) + "%");
      } else {
        setStatus("downloading model…");
      }
    },
    (error) => {
      console.error("Error loading GLB:", error);
      setStatus("failed to load model");
    }
  );

  // Show / hide model when image is found/lost
  anchor.onTargetFound = () => {
    if (model) model.visible = true;
    setStatus("target found");
  };

  anchor.onTargetLost = () => {
    if (model) model.visible = false;
    setStatus("target lost (keep camera on image)");
  };

  // Start AR
  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  setStatus("ready – point at target image");
};

// Start after DOM is ready
start().catch((err) => {
  console.error(err);
  setStatus("error: " + err.message);
});
