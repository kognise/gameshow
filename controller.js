import { SerialPort } from 'serialport'
		
const READY = 125
const TURN_ON = 126
const TURN_OFF = 127

export async function makeController(config) {
	const ports = await SerialPort.list()
	const device = ports.find(device => device.vendorId === '2a03' && device.productId == '0042').path
	const serial = new SerialPort({ path: device, baudRate: 9600 })
	
	const lastPress = []
	serial.on('data', (data) => {
		for (const byte of data) {
			if (byte === READY) {
				config.onReady?.()
			} else {
				// Hey a button was pressed
				if (!lastPress[byte] || (lastPress[byte] && Date.now() - lastPress[byte] > 30)) {
					config.onPress?.(byte)
				}
				lastPress[byte] = Date.now()
			}
		}
	})

	return {
		turnOn: i => { serial.write(Buffer.from([ i, TURN_ON ])) },
		turnOff: i => { serial.write(Buffer.from([ i, TURN_OFF ])) },
		toggle: (i, v) => v ? turnOn(i) : turnOff(i)
	}
}