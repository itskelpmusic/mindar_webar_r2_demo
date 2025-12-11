import * as THREE from "https://unpkg.com/three@0.152.2/build/three.module.js";
import { GLTFLoader } from "https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js";
import { MindARThree } from "https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.module.js";

const statusEl = document.getElementById("status");
const setStatus = (msg) => {
  statusEl.textContent = "Status: " + msg;
  console.log(msg);
};

setStatus("initializing");

const start = async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./assets/Lament.mind"
  });

  const { renderer, scene, camera } = mindarThree;

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  scene.add(light);

  const anchor = mindarThree.addAnchor(0);

  const loader = new GLTFLoader();
  let model;

  const GLB_URL = "https://frosty-union-c144.itskelpmusic.workers.dev/Lamesh.glb";

  setStatus("loading GLB...");

  loader.load(
    GLB_URL,
    (gltf) => {
      model = gltf.scene;
      model.scale.set(0.2, 0.2, 0.2);
      model.visible = false;
      anchor.group.add(model);
      setStatus("Model loaded — point at target image");
    },
    (xhr) => {
      if (xhr.total) {
        const pct = (xhr.loaded / xhr.total) * 100;
        setStatus(`Downloading model: ${pct.toFixed(1)}%`);
      }
    },
    (error) => {
      console.error(error);
      setStatus("Failed to load GLB");
    }
  );

  anchor.onTargetFound = () => {
    if (model) model.visible = true;
    setStatus("Target found");
  };

  anchor.onTargetLost = () => {
    if (model) model.visible = false;
    setStatus("Target lost");
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
};

start().catch((err) => {
  console.error(err);
  setStatus("Error: " + err.message);
});
