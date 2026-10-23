import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	css: {
		modules: {
			generateScopedName: '[local]_[hash:base64:5]',
		},
	},
	plugins: [react()],
})
