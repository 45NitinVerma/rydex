import CheckoutContent from '@/components/CheckoutContent'
import { Loader2 } from 'lucide-react'
import React, { Suspense } from 'react'

function page() {
  return (
	<div>
		<Suspense fallback={
			<div className='flex items-center justify-center h-screen'>
				<Loader2 className='animate-spin'/>
			</div>
		}>
			<CheckoutContent />
		</Suspense>
	</div>
  )
}

export default page