import { MindARThree } from "https://unpkg.com/mind-ar@1.2.5/dist/mindar-image-three.prod.js";

const statusEl = document.getElementById("status");
const setStatus = (msg) => {
  if (statusEl) statusEl.textContent = "Status: " + msg;
  console.log(msg);
};

setStatus("initializing");

const start = async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./assets/Lament.mind", // replace with your own .mind file
  });

  const { renderer, scene, camera } = mindarThree;

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  light.position.set(0, 1, 0);
  scene.add(light);

  const anchor = mindarThree.addAnchor(0);

  const loader = new THREE.GLTFLoader();
  let model = null;

  const GLB_URL = "https://frosty-union-c144.itskelpmusic.workers.dev/Lamesh.glb";

  setStatus("loading GLB...");

  loader.load(
    GLB_URL,
    (gltf) => {
      model = gltf.scene;
      model.scale.set(0.2, 0.2, 0.2);
      model.visible = false;
      anchor.group.add(model);
      setStatus("model loaded, point at target");
    },
    (xhr) => {
      if (xhr.total) {
        const pct = (xhr.loaded / xhr.total) * 100;
        setStatus("downloading model: " + pct.toFixed(1) + "%");
      } else {
        setStatus("downloading model...");
      }
    },
    (error) => {
      console.error("Error loading GLB:", error);
      setStatus("failed to load model");
    }
  );

  anchor.onTargetFound = () => {
    if (model) model.visible = true;
    setStatus("target found");
  };

  anchor.onTargetLost = () => {
    if (model) model.visible = false;
    setStatus("target lost (keep camera on image)");
  };

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  setStatus("ready - point camera at target image");
};

start().catch((err) => {
  console.error(err);
  setStatus("error: " + err.message);
});
