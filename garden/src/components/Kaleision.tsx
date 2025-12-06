import { Suspense } from 'react'
import { useKaleisionAssets } from '../hooks/useKaleisionAssets'
import FloatingUniverse from './FloatingUniverse'

export default function Kaleision() {
    const { assets, loading } = useKaleisionAssets()

    console.log("Kaleision: Loading:", loading, "Assets:", assets.length)

    if (loading) return null

    return (
        <Suspense fallback={null}>
            <FloatingUniverse assets={assets} />
        </Suspense>
    )
}
