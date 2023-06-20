<template>
	<header>
		<div class="wrapper">
			<nav>
				<RouterLink to="/">Home</RouterLink>
				<RouterLink to="/test">Test</RouterLink>
			</nav>
		</div>
	</header>
	<RouterView />
</template>

<script setup>
const calcHeight = () => {
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);
};
onMounted(() => {
	calcHeight();
	window.addEventListener('resize', () => calcHeight());
});
</script>

<style lang="scss" scoped>
header {
	position: absolute;
	line-height: 1.5;
	max-height: 100vh;
}
</style>
