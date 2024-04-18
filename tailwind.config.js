/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
		"./views/**/*.pug",
		"./public/**/*.{html,js}",
	],
  theme: {
    extend: {
			fontFamily: {
				roboto: ['Roboto', 'sans-serif']
			}
		},
  },
  plugins: [],
}

