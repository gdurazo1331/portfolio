const viewer = document.getElementById("jet-engine-viewer");

const timelineSteps = [...document.querySelectorAll(".timeline-step")];
const projectOrder = ["level1-rocket", "irec-rocket", "apogee-sim", "drone"];
const projectCards = [...document.querySelectorAll(".project-card")].sort(
  (firstCard, secondCard) => projectOrder.indexOf(firstCard.dataset.project) - projectOrder.indexOf(secondCard.dataset.project)
);
const timelineFill = document.querySelector(".timeline-fill");

function updateTimeline() {
  if (!timelineSteps.length || !projectCards.length || !timelineFill) return;

  const viewportCenter = window.innerHeight * 0.45;
  let activeCardIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  projectCards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const distance = viewportCenter < rect.top
      ? rect.top - viewportCenter
      : viewportCenter > rect.bottom
        ? viewportCenter - rect.bottom
        : 0;
    if (distance < closestDistance) {
      closestDistance = distance;
      activeCardIndex = index;
    }
  });

  const activeCard = projectCards[activeCardIndex];
  const project = activeCard ? activeCard.dataset.project : "level1-rocket";
  const activeIndex = Math.max(0, timelineSteps.findIndex((step) => step.dataset.target === project));

  timelineSteps.forEach((step, index) => {
    step.classList.toggle("active", index === activeIndex);
    const targetCard = document.querySelector(`[data-project="${step.dataset.target}"]`);
    const targetRect = targetCard ? targetCard.getBoundingClientRect() : null;
    const distance = targetRect
      ? viewportCenter < targetRect.top
        ? targetRect.top - viewportCenter
        : viewportCenter > targetRect.bottom
          ? viewportCenter - targetRect.bottom
          : 0
      : 1000;
    const scale = Math.max(0.82, Math.min(1.35, 1.35 - distance / 520));
    step.style.setProperty("--timeline-scale", scale.toFixed(2));
  });

  const trackHeight = timelineSteps[0].closest(".timeline-track").clientHeight;
  const fillHeight = ((activeIndex + 1) / timelineSteps.length) * (trackHeight - 8);
  timelineFill.style.top = "0px";
  timelineFill.style.height = `${fillHeight}px`;
}

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

function addPhotoLightbox() {
  const lightbox = document.getElementById("photo-lightbox");
  const lightboxImage = document.getElementById("photo-lightbox-image");
  const lightboxCaption = document.getElementById("photo-lightbox-caption");
  const closeButton = lightbox?.querySelector(".photo-lightbox-close");
  const photoImages = document.querySelectorAll(".photo-slide img");

  if (!lightbox || !lightboxImage || !lightboxCaption || !closeButton || !photoImages.length) return;

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
  }

  photoImages.forEach((image) => {
    image.addEventListener("click", () => {
      const figure = image.closest(".photo-slide");
      const caption = figure?.querySelector("figcaption")?.textContent || "";
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || caption;
      lightboxCaption.textContent = caption;
      lightbox.hidden = false;
      document.body.classList.add("lightbox-open");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
}

timelineSteps.forEach((step) => {
  step.addEventListener("click", () => {
    const target = document.querySelector(`[data-project="${step.dataset.target}"]`);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

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

window.addEventListener("scroll", updateTimeline, { passive: true });
window.addEventListener("resize", updateTimeline);
updateTimeline();
addMotionEffects();
addPhotoLightbox();
