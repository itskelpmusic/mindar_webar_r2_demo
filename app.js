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
    container: document.body,
    imageTargetSrc: "./assets/90sPop.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // -----------------------------------
  // ANCHOR
  // -----------------------------------
  const anchor = mindarThree.addAnchor(0);

  // -----------------------------------
  // TEMP TEST CUBE (to confirm rendering)
  // -----------------------------------
  const testGeom = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const testMat = new THREE.MeshNormalMaterial();
  const testCube = new THREE.Mesh(testGeom, testMat);
  testCube.visible = false;
  anchor.group.add(testCube);

  // -----------------------------------
  // LOAD GLB MODEL
  // -----------------------------------
  const loader = new GLTFLoader();
  let model = null;

  const GLB_URL =
    "https://frosty-union-c144.itskelpmusic.workers.dev/Lamesh.glb";

  setStatus("loading GLB…");

  loader.load(
    GLB_URL,
    (gltf) => {
      model = gltf.scene;

      // Compute and log bounding box
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      console.log("BOUNDING BOX:", box);
      console.log("MODEL SIZE:", size);
      console.log("MODEL CENTER:", center);

      // Normalize the model so its geometric center sits at (0,0,0)
      box.getCenter(model.position).multiplyScalar(-1);

      // Try large scale first so we can see it
      model.scale.set(1, 1, 1);
      model.visible = false;

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

  // -----------------------------------
  // TRACKING EVENTS
  // -----------------------------------
  mindarThree.controller.on("targetFound", () => {
    console.log("FOUND TARGET!");
    setStatus("target found");

    if (testCube) testCube.visible = true;
    if (model) model.visible = true;
  });

  mindarThree.controller.on("targetLost", () => {
    console.log("LOST TARGET!");
    setStatus("target lost");

    if (testCube) testCube.visible = false;
    if (model) model.visible = false;
  });

  // -----------------------------------
  // START AR SESSION
  // -----------------------------------
  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
