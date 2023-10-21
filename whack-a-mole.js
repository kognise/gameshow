import { makeController } from './controller.js'
import chalk from 'chalk'
import { exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import readline from 'readline'

const musicPath = '/Users/kognise/Desktop/out'
const music = await fs.readdir(musicPath)
	.then(files => files.map(file => path.join(musicPath, file)))

const moleCount = 8

let gameState = 'idle' // idle, animating, playing

let score
let currentInterval
let litMoles
let moleTimes
let moleTimeouts
let newMoleTimeout
let lastMole

let soundtrackPlayer
let popupPlayer
let pressPlayer

function playAudioFile(path, volume = 1) {
	const process = exec(`afplay "${path}" -v ${volume}`)
	return {
		stop: () => process.kill()
	}
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

function startGame() {
	if (gameState !== 'idle') return
	console.log('Starting game!')

	gameState = 'playing'
	score = 0
	litMoles = []
	moleTimes = {}
	moleTimeouts = {}
	currentInterval = 1000
	lastMole = -1
	soundtrackPlayer = playAudioFile(music[Math.floor(Math.random() * music.length)])

	setTimeout(gameOver, 22 * 1000)
	newMoleTimeout = setTimeout(newMole, currentInterval)
}

function newMole() {
	if (gameState !== 'playing') return
	currentInterval = Math.max(currentInterval - 40, 350)
	
	void function() {
		let i = 0
		let mole
		do {
			mole = Math.floor(Math.random() * moleCount)
			if (++i > 10000) return // Infinite loop protection lmao
		} while (litMoles.includes(mole) && mole !== lastMole)

		popupPlayer?.stop()
		popupPlayer = playAudioFile('sounds/whee.mp3', 0.3)

		litMoles.push(mole)
		controller.turnOn(mole)
		moleTimes[mole] = Date.now()

		moleTimeouts[mole] = setTimeout(() => {
			controller.turnOff(mole)
			litMoles.splice(litMoles.indexOf(mole), 1)
		}, currentInterval + Math.max(currentInterval * 0.2, 120))
	}()

	newMoleTimeout = setTimeout(newMole, currentInterval)
}

async function animate() {
	gameState = 'animating'
	for (let i = 0; i < 3; i++) {
		for (let i = 0; i < moleCount; i++) controller.turnOn(i)
		await delay(300)
		for (let i = 0; i < moleCount; i++) controller.turnOff(i)
		await delay(300)
	}
	for (let i = 0; i < 5; i++) {
		for (let i = 0; i < moleCount; i++) {
			controller.turnOn(i)
			setTimeout(() => controller.turnOff(i), 80 * 3)
			await delay(80)
		}
	}
	await delay(1000)
}

async function readLeaderboard() {
    try {
        const data = JSON.parse(await fs.readFile("leaderboard.json")).sort((a, b) => b.score - a.score);
        return data;
    } catch(e) {
		console.error(e)
        console.error("error loading leaderboard, initializing to default");
        return [];
    }
}

const leaderboard = await readLeaderboard();
const LEADERBOARD_ENTRIES = 10;

async function shouldUpdateLeaderboard(score) {
    return !leaderboard.length || score > leaderboard[leaderboard.length - 1].score;
}

async function addLeaderboardScore(initials, score) {
    leaderboard.push({ initials, score });
    leaderboard.sort((a, b) => b.score - a.score);
    await fs.writeFile("leaderboard.json", Buffer.from(JSON.stringify(leaderboard), "utf-8"));
}

function printLeaderboard() {
    console.log(chalk.whiteBright`--- HIGH SCORES ---`);
	leaderboard.sort((a, b) => b.score - a.score)
    console.log(
        leaderboard
			.slice(0, LEADERBOARD_ENTRIES)
            .map((e, i)  => `${i + 1}. ${e.initials} ${e.score}`)
            .join("\n")
    )
    console.log()
}

async function gameOver() {
	pressPlayer.stop()
	popupPlayer.stop()
	soundtrackPlayer.stop()

	gameState = 'animating'
	playAudioFile('sounds/YES.mp3')
	for (const mole of litMoles) controller.turnOff(mole)
	clearTimeout(newMoleTimeout)
	litMoles = []
	console.log()
	console.log(chalk.bold.whiteBright(`Game over! Score: ${chalk.cyanBright(score)}`))

    if (shouldUpdateLeaderboard(score)) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const initials = await (new Promise((res, rej) => {
            rl.question("Enter your name: ", {}, (ans) => {
				res(ans)
				rl.close();
			});
        }));
        await addLeaderboardScore(initials, score);
    }
    printLeaderboard();

	await animate()
    gameState = 'idle'
    console.log('Press any button to play again.')
    console.log()
}


const controller = await makeController({
	onReady: async () => {
		console.log(chalk.green('Game ready!'))
		await animate()
		gameState = 'idle'
		console.log('Press any button to play.')
		console.log()
	},
	onPress: (mole) => {
		if (gameState === 'playing') {
			clearTimeout(moleTimeouts[mole])
			controller.turnOff(mole)

			if (litMoles.includes(mole)) {
				lastMole = mole
				litMoles.splice(litMoles.indexOf(mole), 1)
				const time = Date.now() - moleTimes[mole]
                let pointValue
				if (time < 400) {
					pointValue = 500
				} else if (time < 500) {
					pointValue = 350
				} else {
					pointValue = 100
				}
                if (currentInterval <= 350) {
                    pointValue *= 2
                }
                score += pointValue
				console.log(chalk.dim(`${chalk.green('Hit!')}  Score: ${chalk.whiteBright(score)}`))
				pressPlayer?.stop()
				pressPlayer = playAudioFile('sounds/slap.mp3', 0.3)
			} else {
				score = Math.max(score - 50, 0)
				console.log(chalk.dim(`${chalk.red('Miss!')} Score: ${chalk.whiteBright(score)}`))
				pressPlayer?.stop()
				pressPlayer = playAudioFile('sounds/error.mp3', 1)
			}
		} else if (gameState === 'idle') {
			startGame()
		}
	}
})