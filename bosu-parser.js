import fs from 'fs/promises'

const data = (await fs.readFile('map.osu')).toString()

// x,y,time,type,hitSound,objectParams,hitSample
const lines = data.match(/^\d+,\d+,\d+,\d+,\d+,\d+:\d+:\d+:\d+:$/mg)
const map = []

for (const line of lines) {
	const [ x, y, time, type ] = line.split(',').map(l => parseInt(l, 10))
	const a = {
		64: 0,
		192: 1,
		320: 2,
		448: 3
	}
	let position = a[x]
	if (position === undefined) {
		// Find the closest position
		const positions = Object.keys(a)
		let closest = positions[0]
		for (const position of positions) {
			if (Math.abs(position - x) < Math.abs(closest - x)) closest = position
		}
		position = a[closest]
	}
	map.push([ position, time / 300 ])
}

fs.writeFile('map.json', JSON.stringify(map))