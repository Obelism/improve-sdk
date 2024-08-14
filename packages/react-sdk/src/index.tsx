import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import type { ImproveClientSDK } from '@obelism/improve-sdk/client'
import type { ImproveSetupArgs } from '@obelism/improve-sdk/types'

export type ImproveProviderProps = {
	children?: React.ReactNode
}

export type ImproveContextType = {
	getFlagValue: ImproveClientSDK['getFlagValue']
	getTestValue: ImproveClientSDK['getTestValue']
	postAnalytic: ImproveClientSDK['postAnalytic']
}

const DEFAULT_VALUE: ImproveContextType = {
	getFlagValue: () => null,
	getTestValue: () => null,
	postAnalytic: () => null,
}

const ImproveContext = createContext<ImproveContextType>(DEFAULT_VALUE)

export const generateImproveProvider = (improveSetupArgs: ImproveSetupArgs) => {
	const ImproveProvider = ({ children }: ImproveProviderProps) => {
		const [clientSetup, setClientSetup] = useState<boolean>(false)
		const loadingSdk = useRef<boolean>(false)
		const improveSdkRef = useRef<ImproveClientSDK | null>(null)

		useEffect(() => {
			if (improveSdkRef.current || loadingSdk.current) return
			loadingSdk.current = true
			let loaded = false
			let aborted = false

			try {
				import('@obelism/improve-sdk/client').then(
					async ({ ImproveClientSDK }) => {
						if (aborted) return
						improveSdkRef.current = new ImproveClientSDK(improveSetupArgs)

						if (!improveSetupArgs.config)
							await improveSdkRef.current.fetchConfig()

						if (aborted) return
						loaded = true
						setClientSetup(true)
					},
				)
			} catch (e) {
				console.error(e)
			}

			return () => {
				if (loaded) return
				loadingSdk.current = false
				aborted = true
			}
		}, [])

		const actions = useMemo(() => {
			if (!clientSetup || !improveSdkRef.current) return DEFAULT_VALUE
			return {
				getTestValue: improveSdkRef.current.getTestValue,
				postAnalytic: improveSdkRef.current.postAnalytic,
				getFlagValue: improveSdkRef.current.getFlagValue,
			}
		}, [clientSetup])

		return (
			<ImproveContext.Provider value={actions}>
				{children}
			</ImproveContext.Provider>
		)
	}

	const usePostAnalytic = (testSlug: string) => {
		const { postAnalytic } = useContext(ImproveContext)

		return useCallback(
			(event: string, message?: string) => {
				return postAnalytic(testSlug, event, message)
			},
			[postAnalytic, testSlug],
		)
	}

	const useTestValue = (testSlug: string) => {
		const { getTestValue } = useContext(ImproveContext)
		return getTestValue(testSlug)
	}

	const useFlagValue = (flagSlug: string) => {
		const { getFlagValue } = useContext(ImproveContext)
		return getFlagValue(flagSlug)
	}

	return { ImproveProvider, usePostAnalytic, useTestValue, useFlagValue }
}
