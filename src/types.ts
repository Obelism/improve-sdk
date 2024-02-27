import { AudienceParamKey } from 'config/audiences'

export type EnvironmentOption = 'develop' | 'staging' | 'production'

export type ImproveArgs = {
	organizationId: string
	environment: EnvironmentOption
	state?: TestState
	config?: Configuration
	fetchTimeout?: number
}

export type TestState = 'draft' | 'active' | 'finished' | 'archived'

export type FlagOption = {
	name: string
	slug: string
	value: string | undefined
	split: number
}

export type TestOption = {
	name: string
	slug: string
	value: string | undefined
	split: number
}

export type Flag = {
	id: string
	name: string
	audience: string
	options: FlagOption[]
}

export type Flags = {
	[flagSlug in string]: Flag
}

export type Events = {
	start: string
	metrics: string[]
	conversion: string
}

export type Result = {
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

export type Test = {
	id: string
	name: string
	defaultValue: string
	audience: string
	allocation: number
	options: TestOption[]
	events: Events
}

export type Tests = {
	[testSlug in string]: Test
}

export type AudienceValue = { [Key in AudienceParamKey]: string }

export type Audience = {
	[audienceSlug in string]: AudienceValue
}

export type Configuration = {
	name: string
	version: number
	flags: Flags
	tests: Tests
	audience: Audience
}
