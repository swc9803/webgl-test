<template>
	<div class="wrapper">
		<div ref="containerRef" class="container" />
	</div>
</template>

<script setup>
import gsap from 'gsap';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const containerRef = ref();
let camera;
let raf;

const objColor = 0xffffff;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
scene.background = new THREE.Color(0x555555);

// torus
const geometry = new THREE.TorusGeometry(0.7, 0.3, 12, 80);
const material = new THREE.MeshStandardMaterial({ color: objColor });
const obj = new THREE.Mesh(geometry, material);
obj.position.set(0, 0.8, 0);
scene.add(obj);

// plane
const canvas = document.createElement('canvas');
canvas.width = 30;
canvas.height = 30;
const context = canvas.getContext('2d');
const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, 'blue');
gradient.addColorStop(1, 'yellow');
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);
const texture = new THREE.CanvasTexture(canvas);
const planeMaterial = new THREE.MeshStandardMaterial({ map: texture });
const planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.set(-Math.PI / 2, 0, 0);
plane.position.set(0, -0.1, 0);
scene.add(plane);

// light
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

const cameraY = 10; // obj로부터의 카메라 높이
const cameraZ = 4; // obj로부터의 카메라 거리
const offset = new THREE.Vector3(0, cameraY, -cameraZ);
function animate() {
	camera.updateMatrixWorld();
	obj.rotation.y += 0.01;
	renderer.render(scene, camera);
	raf = requestAnimationFrame(animate);

	const targetPosition = obj.position.clone().add(offset);
	camera.position.copy(targetPosition);
	camera.lookAt(obj.position);
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
	const intersects = raycaster.intersectObject(plane);

	if (intersects.length > 0) {
		const intersectionPoint = intersects[0].point;
		console.log('클릭 좌표:', intersectionPoint);

		const distance = obj.position.distanceTo(intersectionPoint);
		const speed = 5;
		const duration = distance / speed;
		gsap.to(obj.position, {
			x: intersectionPoint.x,
			z: intersectionPoint.z,
			duration,
		});
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
