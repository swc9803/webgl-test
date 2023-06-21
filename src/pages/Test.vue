<template>
	<p class="center">Box{{ close }}</p>
	<div class="wrapper">
		<div ref="containerRef" class="container" />
	</div>
</template>

<script setup>
import gsap from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const containerRef = ref();
let camera;
let raf;
const close = ref(0);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
scene.background = new THREE.Color(0x555555);

// torus
// const geometry = new THREE.TorusGeometry(0.7, 0.3, 12, 80);
// const material = new THREE.MeshStandardMaterial({ color: objColor });
// const obj = new THREE.Mesh(geometry, material);
// obj.position.set(0, 0, 0);
// scene.add(obj);
let obj;
const loader = new GLTFLoader();
loader.load('/fish.glb', gltf => {
	obj = gltf.scene;
	scene.add(obj);
});

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const box1 = new THREE.Mesh(boxGeometry, boxMaterial);
box1.position.set(15, 0, 15);
scene.add(box1);
const box2 = new THREE.Mesh(boxGeometry, boxMaterial);
box2.position.set(-15, 0, 15);
scene.add(box2);
const box3 = new THREE.Mesh(boxGeometry, boxMaterial);
box3.position.set(15, 0, -15);
scene.add(box3);
const box4 = new THREE.Mesh(boxGeometry, boxMaterial);
box4.position.set(-15, 0, -15);
scene.add(box4);

// plane
// const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
// const planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.rotation.set(-Math.PI / 2, 0, 0);
// plane.position.set(0, -1, 0);
// scene.add(plane);

const floorGeometry = new THREE.CircleGeometry(22, 32);
const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.set(-Math.PI / 2, 0, 0);
floor.position.set(0, -1, 0);
scene.add(floor);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

function init() {
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(
		containerRef.value.offsetWidth,
		containerRef.value.offsetHeight,
	);
	containerRef.value.appendChild(renderer.domElement);
}

const cameraY = 13; // obj로부터의 카메라 높이
const cameraZ = 13; // obj로부터의 카메라 거리
const offset = new THREE.Vector3(0, cameraY, -cameraZ);
function animate() {
	camera.updateMatrixWorld();
	renderer.render(scene, camera);
	raf = requestAnimationFrame(animate);

	if (obj) {
		const targetPosition = obj.position.clone().add(offset);
		camera.position.copy(targetPosition);
		camera.lookAt(obj.position);
	}
}

const onResize = () => {
	camera.aspect =
		containerRef.value.offsetWidth / containerRef.value.offsetHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(
		containerRef.value.offsetWidth,
		containerRef.value.offsetHeight,
	);
};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const onClick = e => {
	mouse.x = (e.clientX / containerRef.value.offsetWidth) * 2 - 1;
	mouse.y = -(e.clientY / containerRef.value.offsetHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObject(floor);

	if (intersects.length > 0) {
		const intersectionPoint = intersects[0].point;
		console.log('클릭 좌표:', intersectionPoint);

		const distance = obj.position.distanceTo(intersectionPoint);
		const speed = 5;
		const duration = distance / speed;

		gsap.killTweensOf(obj.position);
		gsap.to(obj.position, {
			x: intersectionPoint.x,
			z: intersectionPoint.z,
			duration,
			onUpdate: () => {
				const box1distance = obj.position.distanceTo(box1.position);
				const box2distance = obj.position.distanceTo(box2.position);
				const box3distance = obj.position.distanceTo(box3.position);
				const box4distance = obj.position.distanceTo(box4.position);
				if (box1distance <= 3) {
					close.value = 1;
				} else if (box2distance <= 3) {
					close.value = 2;
				} else if (box3distance <= 3) {
					close.value = 3;
				} else if (box4distance <= 3) {
					close.value = 4;
				} else {
					close.value = 0;
				}
			},
		});

		const lookAtPoint = new THREE.Vector3(
			intersectionPoint.x,
			obj.position.y,
			intersectionPoint.z,
		);
		obj.lookAt(lookAtPoint);
	}
};

onMounted(() => {
	camera = new THREE.PerspectiveCamera(
		80,
		containerRef.value.offsetWidth / containerRef.value.offsetHeight,
		0.1,
		1000,
	);
	// camera.position.set(0, 2, 3);
	// camera.lookAt(0, 0, 0);

	init();
	animate();

	window.addEventListener('resize', onResize);
	containerRef.value.addEventListener('click', onClick);
});

onBeforeUnmount(() => {
	cancelAnimationFrame(raf);
	renderer.dispose();

	window.removeEventListener('resize', onResize);
});
</script>

<style lang="scss" scoped>
.center {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	color: white;
	font-size: 5em;
	z-index: 1;
}
.wrapper {
	width: 100%;
	height: calc(var(--vh) * 100);
	.container {
		position: relative;
		width: 100%;
		height: 100%;
	}
}
</style>
