import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
	plugins: [
		vue(),
		AutoImport({
			imports: [
				{
					vue: ['ref', 'onMounted', 'onBeforeUnmount'],
				},
			],
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
