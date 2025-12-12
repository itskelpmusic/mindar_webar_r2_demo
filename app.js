loader.load(
  GLB_URL,
  (gltf) => {
    model = gltf.scene;

    // Log bounding box
    const box = new THREE.Box3().setFromObject(model);
    console.log("BOUNDING BOX:", box);

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log("MODEL SIZE:", size);
    console.log("MODEL CENTER:", center);

    // Normalize model so it's centered
    box.getCenter(model.position).multiplyScalar(-1);

    // Try a much larger scale to make sure we see it
    model.scale.set(1, 1, 1); // was 0.2
    model.visible = false;

    anchor.group.add(model);

    setStatus("model loaded – point at target");
  },
