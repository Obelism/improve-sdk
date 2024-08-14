const BASE_REGEX = /(\[[a-zA-Z0-9-]+\])+/g

const SECONDARY_REGEX = /\[\[\.\.\.[a-zA-Z0-9-]+\]\]/g

const TERTIARY_REGEX = /\[\.\.\.[a-zA-Z0-9-]+\]/g

export const removeTrailingSlash = (val: string) =>
	val.endsWith('/') ? val.substring(0, val.length - 1) : val

export const matchesRoute = (route: string, pathname: string) => {
	const basePathname = removeTrailingSlash(pathname.split('?')[0] as string)
	const baseRoute = removeTrailingSlash(route.split('?')[0] as string)

	if (basePathname === baseRoute) return true

	const strippedRouteRegex = new RegExp(
		`^${baseRoute.replace(BASE_REGEX, '[a-zA-Z0-9-]+')}$`
			.replace(SECONDARY_REGEX, '?.*')
			.replace(TERTIARY_REGEX, '.*'),
	)

	return strippedRouteRegex.test(basePathname)
}
