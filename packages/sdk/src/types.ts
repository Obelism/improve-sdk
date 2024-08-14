import { AudienceParamKey } from './config/audiences'

export type ImproveEnvironmentOption = 'develop' | 'staging' | 'production'

export type ImproveTestState = 'draft' | 'active' | 'finished' | 'archived'

export type ImproveSetupArgs = {
	organizationId: string
	environment: ImproveEnvironmentOption
	state?: ImproveTestState
	config?: ImproveConfiguration
	fetchTimeout?: number
}

export type ImproveFlagOption = {
	name: string
	slug: string
	value: string | undefined
	split: number
}

export type ImproveTestOption = {
	name: string
	slug: string
	value: string | undefined
	split: number
}

export type ImproveFlag = {
	id: string
	name: string
	audience: string
	options: ImproveFlagOption[]
}

export type ImproveFlags = {
	[flagSlug in string]: ImproveFlag
}

export type ImproveEvents = {
	start: string
	metrics: string[]
	conversion: string
}

export type ImproveResult = {
	result: {
		[variant: string]: {
			[metric: string]: number
		}
	}
	resultsByDay: {
		label: string
		values: { [x in string]: string | number }[]
	}[]
}

export type ImproveTest = {
	id: string
	name: string
	defaultValue: string
	audience: string
	allocation: number
	options: ImproveTestOption[]
	events: ImproveEvents
}

export type ImproveTests = {
	[testSlug in string]: ImproveTest
}

export type ImproveAudienceValue = { [Key in AudienceParamKey]: string }

export type ImproveAudience = {
	[audienceSlug in string]: ImproveAudienceValue
}

export type ImproveConfiguration = {
	name: string
	version: number
	flags: ImproveFlags
	tests: ImproveTests
	audience: ImproveAudience
}
