'use client'

import Image from 'next/image'
import { usePostAnalytic } from './improve'

export const Visual = ({
	className,
	variant,
}: {
	className?: string
	variant: 'control' | 'variation'
}) => {
	const postAnalytic = usePostAnalytic('startpage-visual')

	return (
		<Image
			className={className}
			src="/next.svg"
			alt="Next.js Logo"
			width={180}
			height={37}
			priority
			style={variant === 'control' ? {} : { transform: 'scaleX(-1)' }}
			onClick={() => {
				postAnalytic('visualClicked')
			}}
		/>
	)
}
