import { useState, useEffect } from 'react'

export function useKaleisionAssets() {
    const [assets, setAssets] = useState<{ id: string; path: string; optimizedPath: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        console.log("Fetching manifest...")
        fetch('./models/manifest.json')
            .then(res => {
                if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`)
                return res.json()
            })
            .then(items => {
                console.log("Manifest loaded:", items)
                setAssets(items)
                setLoading(false)
            })
            .catch(err => {
                console.error("Failed to load asset manifest", err)
                setLoading(false)
            })
    }, [])

    return { assets, loading }
}
