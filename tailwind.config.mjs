/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				black: '#1a1a1a',
				muted: '#888',
				gray: '#f5f5f3',
				prose: '#333333',
				faint: '#bbbbbb',
				line: '#e5e5e5',
			},
			fontFamily: {
				sans: ['DM Sans', 'sans-serif'],
				serif: ['"DM Serif Display"', 'serif'],
			},
		},
	},
	plugins: [],
}
