import { TestOption } from '../types'

export const getRandomTestValue = (options: TestOption[]) => {
	if (options.length === 0) return null
	if (options.length === 1) return options[0].slug

	const splitSum = options.reduce((sum, option) => {
		return (sum += option.split)
	}, 0)

	const randomValue = Math.floor(Math.random() * splitSum)

	let count = 0
	const match = options.find((option) => {
		const lower = count
		const upper = count + option.split
		if (randomValue >= lower && randomValue < upper) return true
		count = upper
		return false
	})

	return match?.slug || options.at(-1)?.slug
}
