import { AudienceParamKey } from 'config/audiences'

export type EnvironmentOption = 'develop' | 'staging' | 'production'

export type TestState = 'draft' | 'active' | 'finished' | 'archived'

export type FeatureOption = {
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

export type Feature = {
	id: string
	name: string
	audience: string
	options: FeatureOption[]
}

export type Features = {
	[featureSlug in string]: Feature
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
	features: Features
	tests: Tests
	audience: Audience
}
