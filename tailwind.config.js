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
  plugins: [
		({ addUtilities, addComponents }) => {
			addUtilities({
				'.roboto-thin': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '100',
					fontStyle: 'normal'
				},

				'.roboto-light': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '300',
					fontStyle: 'normal'
				},

				'.roboto-regular': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '400',
					fontStyle: 'normal'
				},

				'.roboto-medium': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '500',
					fontStyle: 'normal'
				},

				'.roboto-bold': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '700',
					fontStyle: 'normal'
				},

				'.roboto-black': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '900',
					fontStyle: 'normal'
				},

				'.roboto-thin-italic': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '100',
					fontStyle: 'italic'
				},

				'.roboto-light-italic': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '300',
					fontStyle: 'italic'
				},

				'.roboto-regular-italic': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '400',
					fontStyle: 'italic'
				},

				'.roboto-medium-italic': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '500',
					fontStyle: 'italic'
				},

				'.roboto-bold-italic': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '700',
					fontStyle: 'italic'
				},

				'.roboto-black-italic': {
					fontFamily: ["Roboto", 'sans-serif'],
					fontWeight: '900',
					fontStyle: 'italic'
				},
			})
		}
	],
}

