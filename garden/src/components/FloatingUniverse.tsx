import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls, folder } from 'leva'
import FloatingInstances from './FloatingInstances'
import { Environment } from '@react-three/drei'
import DriftCamera from './DriftCamera'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import LifeParticles from './LifeParticles'
import { PALETTES } from '../utils/colors'
import type { PaletteName } from '../utils/colors'
import Background from './Background'
import GenerativeAudio from './GenerativeAudio'
import ActiveModelsOverlay from './ActiveModelsOverlay'
import Starfield from './Starfield'

const SPAWN_RANGE = 60

type FloatingUniverseProps = {
    assets: { id: string; path: string; optimizedPath: string }[]
}

export default function FloatingUniverse({ assets }: FloatingUniverseProps) {
    const { width } = useThree(state => state.viewport)
    const isMobile = width < 5 // Approximate viewport width check for mobile

    // --- Controls & Defaults ---
    const {
        timeScale,
        autoRotateColors,
        performanceMode,
        bloomThreshold,
        bloomStrength,
        bloomRadius,
        materialMode,

        audioEnabled,
        volume
    } = useControls('Kaleision Controls', {
        'Simulation': folder({
            timeScale: { value: 0.1, min: 0, max: 2, step: 0.01, label: 'Flow Speed' },
            autoRotateColors: { value: true, label: 'Cycle Colors' },
            performanceMode: { value: isMobile, label: 'Performance Mode' }, // Default true on mobile
            materialMode: { value: 'glassy', options: ['bioluminescent', 'glassy', 'metallic', 'wireframe', 'matte'], label: 'Material' }
        }),
        'Camera & Audio': folder({
            audioEnabled: { value: false, label: 'Audio Enabled' }, // Default False
            volume: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Volume' }
        }),
        'Visuals': folder({
            bloomThreshold: { value: 0.2, min: 0, max: 1, step: 0.01 },
            bloomStrength: { value: 1.5, min: 0, max: 3, step: 0.1 },
            bloomRadius: { value: 0.5, min: 0, max: 1, step: 0.01 },
        })
    })

    // --- Dynamic Color Cycling ---
    const paletteNames: PaletteName[] = ['Ocean', 'Sunset', 'Forest', 'Nebula', 'Fire', 'Ice', 'Lavender', 'Mint']

    // We use a ref to store the current interpolated color to avoid re-renders
    const currentColor = useRef(new THREE.Color('#006994'))

    // --- Dynamic Lighting Refs ---
    const ambientLightRef = useRef<THREE.AmbientLight>(null!)
    const hemiLightRef = useRef<THREE.HemisphereLight>(null!)
    const dirLightRef = useRef<THREE.DirectionalLight>(null!)
    const fogRef = useRef<THREE.FogExp2>(null!)

    useFrame((state) => {
        if (autoRotateColors) {
            const time = state.clock.getElapsedTime()
            const duration = 10 // Seconds per palette
            const index = Math.floor(time / duration) % paletteNames.length
            const nextIndex = (index + 1) % paletteNames.length

            // Get base colors for current and next palette
            // We'll use the 'primary' color of the palette for the global theme
            const currentPaletteDef = PALETTES[paletteNames[index]]
            const nextPaletteDef = PALETTES[paletteNames[nextIndex]]

            if (currentPaletteDef && nextPaletteDef) {
                const colorA = new THREE.Color(currentPaletteDef.primary)
                const colorB = new THREE.Color(nextPaletteDef.primary)

                // Calculate interpolation factor (0 to 1) within the duration
                const alpha = (time % duration) / duration

                // Smoothly interpolate
                currentColor.current.lerpColors(colorA, colorB, alpha)

                // Update Lights to match the star/global color
                if (ambientLightRef.current) {
                    ambientLightRef.current.color.copy(currentColor.current).multiplyScalar(0.5) // Dimmer ambient
                }
                if (hemiLightRef.current) {
                    hemiLightRef.current.color.copy(currentColor.current)
                    // Ground color can be a darker version or complementary
                    hemiLightRef.current.groundColor.copy(currentColor.current).multiplyScalar(0.2)
                }
                if (dirLightRef.current) {
                    dirLightRef.current.color.copy(currentColor.current)
                }
                if (fogRef.current) {
                    // Fog should match background/star color for seamlessness
                    fogRef.current.color.copy(currentColor.current).multiplyScalar(0.1) // Very dark fog
                }
            }
        }
    })



    // --- Lifecycle Management ---
    // Reduce count on mobile to ensure 60fps
    const MAX_ACTIVE = isMobile ? 6 : 12

    // We track "Renderable Assets" which wraps the asset with a unique ID and transition state
    type RenderableAsset = {
        uniqueId: string // Unique ID for React Key (AssetID + Timestamp)
        asset: typeof assets[0]
        status: 'in' | 'out'
    }

    const [renderableAssets, setRenderableAssets] = useState<RenderableAsset[]>([])

    // Initial Fill
    useEffect(() => {
        if (assets.length === 0) return
        if (renderableAssets.length > 0) return

        const initial = assets.slice(0, MAX_ACTIVE).map(a => ({
            uniqueId: `${a.id}-${Date.now()}-${Math.random()}`,
            asset: a,
            status: 'in' as const
        }))
        setRenderableAssets(initial)
    }, [assets, MAX_ACTIVE])

    // Rotation Logic (The Breathing Cycle)
    useEffect(() => {
        if (assets.length <= MAX_ACTIVE) return

        const interval = setInterval(() => {
            setRenderableAssets(current => {
                // 1. Find a candidate to remove (must be 'in')
                const candidates = current.filter(a => a.status === 'in')
                if (candidates.length === 0) return current

                const toRemove = candidates[Math.floor(Math.random() * candidates.length)]

                // 2. Find a candidate to add (must not be currently active)
                // Note: We check against the underlying asset ID
                const activeIds = new Set(current.map(a => a.asset.id))
                const available = assets.filter(a => !activeIds.has(a.id))

                if (available.length === 0) return current // No new assets available

                const newAsset = available[Math.floor(Math.random() * available.length)]

                // 3. Update State
                return [
                    // Mark old one as exiting
                    ...current.map(a => a.uniqueId === toRemove.uniqueId ? { ...a, status: 'out' as const } : a),
                    // Add new one as entering
                    {
                        uniqueId: `${newAsset.id}-${Date.now()}`,
                        asset: newAsset,
                        status: 'in' as const
                    }
                ]
            })
        }, 20000) // Swap every 20 seconds

        return () => clearInterval(interval)
    }, [assets, MAX_ACTIVE])

    const handleExited = (uniqueId: string) => {
        setRenderableAssets(current => current.filter(a => a.uniqueId !== uniqueId))
    }

    const countPerAsset = Math.max(10, Math.floor(100 / Math.max(1, MAX_ACTIVE)))

    useControls({
        ModelCount: { value: assets.length * countPerAsset, disabled: true, label: 'Total Objects' }
    })

    const analyserRef = useRef<AnalyserNode | null>(null)

    return (
        <group>
            <ambientLight ref={ambientLightRef} intensity={0.2} />
            <hemisphereLight ref={hemiLightRef} intensity={0.5} groundColor="#000000" />
            <directionalLight
                ref={dirLightRef}
                position={[10, 10, 5]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <Environment preset="city" blur={0.5} />
            <Background color={currentColor} />
            <fogExp2 ref={fogRef} attach="fog" args={['#000000', 0.008]} />
            <LifeParticles />

            {/* Audio System */}
            <GenerativeAudio enabled={audioEnabled} volume={volume} analyserRef={analyserRef} />

            {/* Camera Control */}
            <DriftCamera enabled={true} />

            <EffectComposer>
                <Bloom luminanceThreshold={bloomThreshold} mipmapBlur intensity={bloomStrength} radius={bloomRadius} />
                {/* Disable DepthOfField on mobile/performance mode for FPS */}


            </EffectComposer>

            {/* UI Overlay */}
            <ActiveModelsOverlay activeAssets={renderableAssets} />

            {/* Starfield with Dynamic Color */}
            <Starfield color={currentColor} />

            {renderableAssets.map((item) => (
                <React.Suspense key={item.uniqueId} fallback={null}>
                    <FloatingInstances
                        modelUrl={item.asset.optimizedPath}
                        count={countPerAsset}
                        range={SPAWN_RANGE}
                        timeScale={timeScale}
                        // palette={activePalette} // Removed as we use globalColor
                        performanceMode={performanceMode}
                        transitionStatus={item.status}
                        onExited={() => handleExited(item.uniqueId)}
                        materialMode={materialMode as 'bioluminescent' | 'glassy' | 'metallic' | 'wireframe' | 'matte'}
                        analyserRef={analyserRef}
                        globalColor={currentColor}
                    />
                </React.Suspense>
            ))}
        </group>
    )
}
