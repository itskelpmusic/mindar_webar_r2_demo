import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";

const statusEl = document.getElementById("status");
function setStatus(msg) {
  console.log(msg);
  statusEl.textContent = msg;
}

// RUN IMMEDIATELY — no DOMContentLoaded timing issues
(async () => {
  setStatus("initializing AR…");

  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc: "./assets/90sPop.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // -----------------------------------
  // ANCHOR
  // -----------------------------------
  const anchor = mindarThree.addAnchor(0);

  // -----------------------------------
  // DEBUG CUBE
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

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      console.log("BOUNDING BOX:", box);
      console.log("MODEL SIZE:", size);
      console.log("MODEL CENTER:", center);

      // Center model
      box.getCenter(model.position).multiplyScalar(-1);

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
    (err) => {
      console.error("Error loading GLB:", err);
      setStatus("failed to load model");
    }
  );

  // -----------------------------------
  // TRACKING EVENTS
  // -----------------------------------
  mindarThree.on("targetFound", () => {
    console.log("FOUND TARGET!");
    setStatus("target found");

    testCube.visible = true;
    if (model) model.visible = true;
  });

  mindarThree.on("targetLost", () => {
    console.log("LOST TARGET!");
    setStatus("target lost");

    testCube.visible = false;
    if (model) model.visible = false;
  });

  // -----------------------------------
  // START AR ENGINE
  // -----------------------------------
  await mindarThree.start();

  setStatus("camera started — point at target");

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
})();
