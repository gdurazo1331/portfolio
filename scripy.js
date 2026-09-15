const viewer = document.getElementById("jet-engine-viewer");

function addMotionEffects() {
  const animatedItems = document.querySelectorAll(".project-card, .about-photo-frame, .photo-slide");

  animatedItems.forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const x = (0.5 - py) * 8;
      const y = (px - 0.5) * 12;

      item.style.setProperty("--rotate-x", `${x}deg`);
      item.style.setProperty("--rotate-y", `${y}deg`);
    });

    item.addEventListener("pointerleave", () => {
      item.style.setProperty("--rotate-x", "0deg");
      item.style.setProperty("--rotate-y", "0deg");
    });
  });
}

if (viewer) {
  const missingDependencies = [];

  if (typeof THREE === "undefined") missingDependencies.push("THREE.js");
  if (typeof THREE !== "undefined" && !THREE.OrbitControls) missingDependencies.push("OrbitControls");
  if (typeof THREE !== "undefined" && !THREE.GLTFLoader) missingDependencies.push("GLTFLoader");

  const status = viewer.querySelector(".model-status");

  function createFallbackModel() {
    const fallback = new THREE.Group();
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xff8a3d,
      emissive: 0x2c1507,
      metalness: 0.38,
      roughness: 0.52
    });

    const core = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.4, 1.7, 24),
      new THREE.MeshStandardMaterial({ color: 0xa8b5c5, metalness: 0.75, roughness: 0.42 })
    );
    core.rotation.z = Math.PI / 2;
    fallback.add(core);

    for (let i = 0; i < 5; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8 + i * 0.18, 0.06, 16, 80), ringMaterial);
      ring.rotation.y = i * 0.6;
      ring.rotation.x = Math.PI / 2.5;
      fallback.add(ring);
    }

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0xffd29a, emissive: 0xffa757, emissiveIntensity: 0.9 })
    );
    glow.position.set(0.7, 0, 0);
    fallback.add(glow);

    return fallback;
  }

  if (missingDependencies.length) {
    if (status) {
      status.textContent = "3D viewer dependencies are unavailable, but the rest of the portfolio is still working.";
    }
    console.warn("Jet engine viewer skipped because the required Three.js modules are missing:", missingDependencies);
  } else {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x15191f);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    viewer.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.5;
    controls.maxDistance = 100;

    scene.add(new THREE.HemisphereLight(0xdde7f2, 0x303642, 0.85));

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(4, 3, 6);
    scene.add(keyLight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;

    function resizeViewer() {
      const width = viewer.clientWidth;
      const height = viewer.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }

    resizeViewer();
    window.addEventListener("resize", resizeViewer);

    const loader = new THREE.GLTFLoader();
    loader.load(
      "./models/Jet_Engine.gltf",
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const largestDimension = Math.max(size.x, size.y, size.z);
        const distance = largestDimension * 0.65;

        model.position.sub(center);
        camera.position.set(distance, distance * 0.55, distance);
        camera.near = largestDimension / 1000;
        camera.far = largestDimension * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.update();

        if (status) status.remove();
      },
      undefined,
      (error) => {
        const fallbackModel = createFallbackModel();
        scene.add(fallbackModel);
        camera.position.set(2.6, 1.8, 2.8);
        controls.target.set(0, 0, 0);
        controls.update();

        if (status) {
          status.textContent = "The 3D model did not load, so a fallback preview is being shown instead.";
        }
        console.error("Unable to load the jet engine model:", error);
      }
    );

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  }
}

const faders = document.querySelectorAll(".fade-in");

if ("IntersectionObserver" in window) {
  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -50px 0px" });

  faders.forEach((fader) => appearOnScroll.observe(fader));
} else {
  faders.forEach((fader) => fader.classList.add("visible"));
}

addMotionEffects();
