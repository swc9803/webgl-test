<template>
	<div class="wrapper">
		<div ref="containerRef" class="container" />
	</div>
</template>

<script setup>
import gsap from 'gsap';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const containerRef = ref();
const objRef = ref();
let camera;
let raf;

const fogColor = 0x004fff;
const objColor = 0xffffff;
const floorColor = 0x555555;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
scene.background = new THREE.Color(fogColor);
scene.fog = new THREE.Fog(fogColor, 2, 16); // 거리

// torus
const geometry = new THREE.TorusGeometry(0.7, 0.3, 12, 80);
const material = new THREE.MeshStandardMaterial({ color: objColor });
const obj = new THREE.Mesh(geometry, material);
obj.position.set(0, 0.8, 0);
scene.add(obj);
objRef.value = obj;

// plane
const planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
const planeMaterial = new THREE.MeshStandardMaterial({ color: floorColor });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.set(-0.5 * Math.PI, 0, 0);
plane.position.set(0, -0.5, 0);
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
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.minDistance = 3;
	controls.maxDistance = 6;
	controls.maxPolarAngle = Math.PI / 2 - 0.1;
	controls.update();
}

function animate() {
	camera.updateMatrixWorld();
	obj.rotation.y += 0.01;
	renderer.render(scene, camera);
	raf = requestAnimationFrame(animate);
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

const onKeyDown = e => {
	if (e.key === 'd') {
		gsap.to(objRef.value.position, { x: '+=0.1', duration: 0.1 });
	} else if (e.key === 'a') {
		gsap.to(objRef.value.position, { x: '-=0.1', duration: 0.1 });
	} else if (e.key === 'w') {
		gsap.to(objRef.value.position, { z: '-=0.1', duration: 0.1 });
	} else if (e.key === 's') {
		gsap.to(objRef.value.position, { z: '+=0.1', duration: 0.1 });
	}
};
const onKeyUp = e => {
	// if (e.key === 'd') {
	// 	gsap.killTweensOf(objRef.value.position);
	// }
};
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const onMouseClick = e => {
	// 마우스의 클릭 위치를 정규화된 장치 좌표(normalized device coordinates)로 변환
	mouse.x = (e.clientX / containerRef.value.offsetWidth) * 2 - 1;
	mouse.y = -(e.clientY / containerRef.value.offsetHeight) * 2 + 1;

	// Raycaster를 사용하여 마우스와 plane이 교차하는지 검출
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObject(plane);

	if (intersects.length > 0) {
		const intersectionPoint = intersects[0].point;
		console.log('Intersection Point:', intersectionPoint);

		gsap.to(objRef.value.position, { x: intersectionPoint.x, duration: 2 });
		gsap.to(objRef.value.position, { z: intersectionPoint.z, duration: 2 });
	}
};

onMounted(() => {
	containerRef.value.addEventListener('click', onMouseClick);
	window.addEventListener('keydown', onKeyDown);
	window.addEventListener('keyup', onKeyUp);
	camera = new THREE.PerspectiveCamera(
		80,
		containerRef.value.offsetWidth / containerRef.value.offsetHeight,
		0.1,
		1000,
	);
	camera.position.set(0, 2, 3);
	camera.lookAt(0, 0, 0);

	init();
	animate();

	window.addEventListener('resize', onResize);
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
