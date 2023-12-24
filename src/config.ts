import { AudienceParamKey } from './config/audiences'

export type TestState = 'draft' | 'active' | 'finished' | 'archived'

export type FeatureOption = {
	name: string
	slug: string
	value: string | undefined
}

export type TestOption = {
	name: string
	slug: string
	value: string | undefined
	split: number
}

export type Feature = {
	name: string
	slug: string
	defaultValue: string
	audience: string
	allocation: number
	options: FeatureOption[]
}

export type Events = {
	start: string
	metrics: string[]
	conversion: string
}

export type Result = {
	[variant: string]: {
		start: number
		[metric: string]: number
		conversion: number
	}
}

export type Test = {
	name: string
	slug: string
	defaultValue: string
	audience: string
	allocation: number
	options: TestOption[]
	events: Events
}

export type AudienceValue = { [Key in AudienceParamKey]: string }

export type Audience = {
	[AudienceKey in string]: AudienceValue
}

export type Configuration = {
	name: string
	version: number
	features: Feature[]
	tests: Test[]
	audience: Audience
}
