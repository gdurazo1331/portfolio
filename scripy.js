const viewer = document.getElementById("jet-engine-viewer");

if (viewer) {
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
		"models/Jet_Engine.gltf",
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

			const status = viewer.querySelector(".model-status");
			if (status) status.remove();
		},
		undefined,
		() => {
			const status = viewer.querySelector(".model-status");
			if (status) status.textContent = "Unable to load the 3D model.";
		}
	);

	function animate() {
		requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
	}

	animate();
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
