'use client'

import { useEffect } from 'react'
import { usePostAnalytic } from './improve'

export const TrackPageView = ({ page }: { page: string }) => {
	const postAnalytic = usePostAnalytic('startpage-visual')

	useEffect(() => {
		postAnalytic('pageLoad', page)
	}, [page, postAnalytic])

	return null
}
