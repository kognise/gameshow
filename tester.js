import { makeController } from './controller.js'

const controller = await makeController({
	onReady: () => {
		console.log('Connected, lighting!')
		for (let i = 0; i < 8; i++) controller.turnOn(i)
	},
	onPress: (i) => {
		console.log('Lit', i)
	}
})