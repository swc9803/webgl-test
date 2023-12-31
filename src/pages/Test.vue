<template>
	<div class="wrapper">
		<div ref="containerRef" class="container" />
	</div>
	<div v-for="(content, index) in contents" :key="content" class="message">
		<transition name="fade">
			<div v-show="openBox === index + 1" class="test">
				{{ content.name }}
			</div>
		</transition>
	</div>
</template>

<script setup>
import { watch } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const contents = [
	{ name: '포트폴리오' },
	{ name: '갤러리' },
	{ name: '깃허브' },
	{ name: '코드팬' },
];

const containerRef = ref();
let camera;
let raf;
const openBox = ref(0);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
scene.background = new THREE.Color(0x555555);

let mixer;

let obj;
const loader = new GLTFLoader();
loader.load('/fish.glb', gltf => {
	obj = gltf.scene;
	scene.add(obj);
});

let chest1, chest2, chest3, chest4;
loader.load('/chest.glb', gltf => {
	chest1 = gltf;
	chest1.scene.scale.set(0.02, 0.02, 0.02);
	chest1.scene.rotation.y = Math.PI;
	chest1.scene.position.set(15, 0, 15);

	scene.add(chest1.scene);
});
loader.load('/chest.glb', gltf => {
	chest2 = gltf;
	chest2.scene.scale.set(0.02, 0.02, 0.02);
	chest2.scene.rotation.y = Math.PI;
	chest2.scene.position.set(-15, 0, 15);

	scene.add(chest2.scene);
});
loader.load('/chest.glb', gltf => {
	chest3 = gltf;
	chest3.scene.scale.set(0.02, 0.02, 0.02);
	chest3.scene.rotation.y = Math.PI;
	chest3.scene.position.set(15, 0, -15);

	scene.add(chest3.scene);
});
loader.load('/chest.glb', gltf => {
	chest4 = gltf;
	chest4.scene.scale.set(0.02, 0.02, 0.02);
	chest4.scene.rotation.y = Math.PI;
	chest4.scene.position.set(-15, 0, -15);

	scene.add(chest4.scene);
});

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

	if (mixer) mixer.update(0.01);

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
		const speed = 15;
		const duration = distance / speed;

		gsap.killTweensOf(obj.position);
		gsap.to(obj.position, {
			x: intersectionPoint.x,
			z: intersectionPoint.z,
			duration,
			onUpdate: () => {
				const box1distance = obj.position.distanceTo(chest1.scene.position);
				const box2distance = obj.position.distanceTo(chest2.scene.position);
				const box3distance = obj.position.distanceTo(chest3.scene.position);
				const box4distance = obj.position.distanceTo(chest4.scene.position);

				if (box1distance <= 5) {
					openBox.value = 1;
				} else if (box2distance <= 5) {
					openBox.value = 2;
				} else if (box3distance <= 5) {
					openBox.value = 3;
				} else if (box4distance <= 5) {
					openBox.value = 4;
				} else {
					openBox.value = 0;
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
.wrapper {
	width: 100%;
	height: calc(var(--vh) * 100);
	.container {
		width: 100%;
		height: 100%;
	}
}
.message {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 60%;
	height: 60%;
	pointer-events: none;
	z-index: 3;
	.test {
		width: 100%;
		height: 100%;
		padding: 20px;
		font-size: 2em;
		text-align: center;
		color: white;
		background: rgb(175, 175, 175);
		transform-origin: center;
		opacity: 0.2;
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: 0.7s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
	// opacity: 0;
	transform: scaleY(0);
}
</style>
