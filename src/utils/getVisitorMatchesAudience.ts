import { AudienceValue } from '../config'
import { AudienceParamKey } from '../config/audiences'
import { ParsedUserAgent } from './parseUserAgent'

export const getVisitorMatchesAudience = (
	audience: AudienceValue,
	visitorParams: ParsedUserAgent,
) => {
	return Object.entries(audience).every(
		// @ts-expect-error All good
		([paramKey, paramValue]: [AudienceParamKey, string]) => {
			return visitorParams[paramKey] === paramValue
		},
	)
}
