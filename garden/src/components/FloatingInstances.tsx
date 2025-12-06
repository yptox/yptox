import React, { useRef, useMemo, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { createNoise3D } from 'simplex-noise'
import { type PaletteName, PALETTES, PALETTE_NAMES } from '../utils/colors'
import { KaleisionMaterial } from './KaleisionMaterial'
import { GlassyMaterial } from '../materials/GlassyMaterial'

type FloatingInstancesProps = {
    modelUrl: string
    count: number
    range: number
    timeScale?: number
    palette?: PaletteName
    symmetry?: boolean
    formation?: number
    formationStrength?: number
    performanceMode?: boolean
    transitionStatus?: 'in' | 'out'
    onExited?: () => void
    materialMode?: 'bioluminescent' | 'glassy' | 'metallic' | 'wireframe' | 'matte'
    analyserRef?: React.MutableRefObject<AnalyserNode | null>
    globalColor?: React.MutableRefObject<THREE.Color>
}

export default function FloatingInstances({
    modelUrl,
    count = 100,
    range,
    timeScale = 0.1,
    palette = 'Ocean',
    transitionStatus = 'in',
    onExited,
    materialMode = 'bioluminescent',
    analyserRef,
    globalColor
}: FloatingInstancesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null!)
    const materialRef = useRef<THREE.ShaderMaterial>(null!)

    // Audio Data State
    const frequencyData = useRef(new Uint8Array(0))
    const audioIntensity = useRef(0)

    // Configuration
    const PARTICLE_COUNT = Math.min(count, 1000) // Limit for CPU performance

    // Transition State
    const currentGlobalScale = useRef(0)

    // Palette Cycling State (Internal fallback)
    const [currentPalette, setCurrentPalette] = useState<PaletteName>(palette)
    const [nextPalette, setNextPalette] = useState<PaletteName>('Sunset')
    const paletteTransition = useRef(0)
    const lastPaletteChangeTime = useRef(0)
    const PALETTE_DURATION = 15
    const TRANSITION_DURATION = 5

    // Interpolated Colors
    const colorStart = useRef(new THREE.Color(PALETTES[palette].primary))
    const colorEnd = useRef(new THREE.Color(PALETTES[palette].secondary))

    // Physics State
    const noise3D = useMemo(() => createNoise3D(), [])

    // Initialize particles with more "floaty" attributes
    const particles = useMemo(() => {
        const data = []
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            data.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * range,
                    (Math.random() - 0.5) * range,
                    (Math.random() - 0.5) * range
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                ),
                rotation: new THREE.Euler(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                ),
                // Rotational velocity
                rotVel: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                scale: 0.5 + Math.random() * 1.5,
                // Individual phase for floating
                phase: Math.random() * Math.PI * 2
            })
        }
        return data
    }, [PARTICLE_COUNT, range])

    const dummy = useMemo(() => new THREE.Object3D(), [])

    const gltf = useLoader(GLTFLoader, modelUrl, (loader) => {
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/')
        loader.setDRACOLoader(dracoLoader)

        const ktx2Loader = new KTX2Loader()
        ktx2Loader.setTranscoderPath('/basis/')
        ktx2Loader.detectSupport(new THREE.WebGLRenderer())
        loader.setKTX2Loader(ktx2Loader)
    })

    // Geometry Extraction
    const geometry = useMemo(() => {
        let geo: THREE.BufferGeometry | null = null
        gltf.scene.traverse((child) => {
            if (!geo && (child as THREE.Mesh).isMesh) {
                geo = (child as THREE.Mesh).geometry
            }
        })

        if (geo) {
            (geo as THREE.BufferGeometry).computeBoundingSphere()
            const sphere = (geo as THREE.BufferGeometry).boundingSphere
            if (sphere) {
                const normScale = 1 / sphere.radius
                    ; (geo as THREE.BufferGeometry).scale(normScale, normScale, normScale)
                    ; (geo as THREE.BufferGeometry).center()
            }
        }
        return geo
    }, [gltf])


    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime()

        // --- AUDIO ANALYSIS ---
        if (analyserRef && analyserRef.current) {
            if (frequencyData.current.length !== analyserRef.current.frequencyBinCount) {
                frequencyData.current = new Uint8Array(analyserRef.current.frequencyBinCount)
            }
            analyserRef.current.getByteFrequencyData(frequencyData.current)

            // Calculate average intensity (focus on lower frequencies for bass)
            let sum = 0
            const bands = 20 // Check first 20 bands
            for (let i = 0; i < bands; i++) {
                sum += frequencyData.current[i]
            }
            const avg = sum / bands
            // Smooth intensity
            audioIntensity.current = THREE.MathUtils.lerp(audioIntensity.current, avg / 255, 0.1)
        }

        // --- COLOR SYNC ---
        if (globalColor && globalColor.current) {
            // Sync with global color from FloatingUniverse
            colorStart.current.copy(globalColor.current)
            // Create a gradient by shifting the hue slightly for the end color
            colorEnd.current.copy(globalColor.current).offsetHSL(0.1, 0, 0)
        } else {
            // Fallback: Internal Palette Cycling
            if (time - lastPaletteChangeTime.current > PALETTE_DURATION) {
                lastPaletteChangeTime.current = time
                setCurrentPalette(nextPalette)
                let newNext = PALETTE_NAMES[Math.floor(Math.random() * PALETTE_NAMES.length)]
                while (newNext === nextPalette) {
                    newNext = PALETTE_NAMES[Math.floor(Math.random() * PALETTE_NAMES.length)]
                }
                setNextPalette(newNext)
                paletteTransition.current = 0
            }

            if (paletteTransition.current < 1) {
                paletteTransition.current += delta / TRANSITION_DURATION
                if (paletteTransition.current > 1) paletteTransition.current = 1
            }

            const p1 = PALETTES[currentPalette]
            const p2 = PALETTES[nextPalette]
            const t = paletteTransition.current * paletteTransition.current * (3 - 2 * paletteTransition.current)
            colorStart.current.lerpColors(new THREE.Color(p1.primary), new THREE.Color(p2.primary), t)
            colorEnd.current.lerpColors(new THREE.Color(p1.secondary), new THREE.Color(p2.secondary), t)
        }


        // --- TRANSITION LOGIC ---
        // Smooth ease-in and ease-out
        // Slower transition for "meditative" feel
        const transitionSpeed = 0.5 * delta // Increased slightly to be more noticeable
        if (transitionStatus === 'in') {
            currentGlobalScale.current = THREE.MathUtils.lerp(currentGlobalScale.current, 1, transitionSpeed)
        } else {
            // For exit, we want to make sure it goes all the way to 0
            currentGlobalScale.current = THREE.MathUtils.lerp(currentGlobalScale.current, -0.1, transitionSpeed)
            if (currentGlobalScale.current <= 0.05 && onExited) { // Increased threshold slightly
                onExited()
            }
        }
        const effectiveScale = Math.max(0, currentGlobalScale.current)

        // --- CPU PHYSICS UPDATE ---
        if (meshRef.current) {
            const repulsionRadius = 4.0
            const repulsionStrength = 2.0 * delta

            particles.forEach((particle, i) => {
                // 1. Curl Noise / Flow Field (The "Current")
                // Large scale noise for broad currents
                const noiseScale = 0.02
                const n1 = noise3D(particle.position.x * noiseScale, particle.position.y * noiseScale, time * 0.05)
                const n2 = noise3D(particle.position.y * noiseScale, particle.position.z * noiseScale, time * 0.05 + 100)
                const n3 = noise3D(particle.position.z * noiseScale, particle.position.x * noiseScale, time * 0.05 + 200)

                const flowForce = new THREE.Vector3(n1, n2, n3).multiplyScalar(timeScale * 2.0 * delta)
                particle.velocity.add(flowForce)

                // 2. Soft Repulsion (Boids Separation)
                // Prevent clumping
                const repulsion = new THREE.Vector3()
                let neighbors = 0

                // Only check against a subset or if N is small
                if (PARTICLE_COUNT < 200) {
                    for (let j = 0; j < PARTICLE_COUNT; j++) {
                        if (i === j) continue
                        const other = particles[j]
                        const distSq = particle.position.distanceToSquared(other.position)
                        if (distSq < repulsionRadius * repulsionRadius) {
                            const dist = Math.sqrt(distSq)
                            const force = (repulsionRadius - dist) / repulsionRadius
                            const dir = new THREE.Vector3().subVectors(particle.position, other.position).normalize()
                            repulsion.add(dir.multiplyScalar(force))
                            neighbors++
                        }
                    }
                }

                if (neighbors > 0) {
                    repulsion.divideScalar(neighbors).multiplyScalar(repulsionStrength)
                    particle.velocity.add(repulsion)
                }

                // 3. Drag / Damping (Viscosity)
                // This is crucial for "meditative" feel - stops them from accelerating infinitely
                particle.velocity.multiplyScalar(0.98)

                // 4. Apply Velocity
                particle.position.add(particle.velocity)

                // 5. Wrapping (Infinite Void)
                const halfRange = range / 2
                if (particle.position.x > halfRange) particle.position.x -= range
                if (particle.position.x < -halfRange) particle.position.x += range
                if (particle.position.y > halfRange) particle.position.y -= range
                if (particle.position.y < -halfRange) particle.position.y += range
                if (particle.position.z > halfRange) particle.position.z -= range
                if (particle.position.z < -halfRange) particle.position.z += range

                // 6. Rotation
                particle.rotation.x += particle.rotVel.x
                particle.rotation.y += particle.rotVel.y
                particle.rotation.z += particle.rotVel.z

                // Update Matrix
                dummy.position.copy(particle.position)
                dummy.rotation.copy(particle.rotation)

                // Audio Reactivity: Scale Pulse
                const audioScale = 1.0 + audioIntensity.current * 0.3
                // Add a slow breathing sine wave
                const breathing = 1.0 + Math.sin(time * 2 + particle.phase) * 0.05

                dummy.scale.setScalar(particle.scale * effectiveScale * audioScale * breathing)

                dummy.updateMatrix()
                meshRef.current.setMatrixAt(i, dummy.matrix)
            })
            meshRef.current.instanceMatrix.needsUpdate = true
        }

        // Update Material Uniforms
        if (materialRef.current) {
            materialRef.current.uniforms.uColorStart.value = colorStart.current
            materialRef.current.uniforms.uColorEnd.value = colorEnd.current
            // Audio Reactivity: Breathing Intensity
            if (materialRef.current.uniforms.uBreathingIntensity) {
                materialRef.current.uniforms.uBreathingIntensity.value = 0.02 + audioIntensity.current * 0.1
            }
        }
    })

    if (!geometry) return null

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, undefined, PARTICLE_COUNT]}
            frustumCulled={false}
        >
            {materialMode === 'glassy' && (
                <GlassyMaterial
                    color={PALETTES[palette].primary}
                    globalColor={globalColor}
                />
            )}
            {materialMode === 'bioluminescent' && (
                <KaleisionMaterial
                    ref={materialRef}
                    colorStart={colorStart.current}
                    colorEnd={colorEnd.current}
                    fresnelPower={2.5}
                    fresnelIntensity={2.0 + audioIntensity.current * 2.0}
                    breathingIntensity={0.02}
                    breathingSpeed={0.5}
                    opacity={0.6}
                    transparent
                    depthWrite={false} // FIX: Additive blending needs depthWrite=false to prevent popping
                    blending={THREE.AdditiveBlending}
                    side={THREE.FrontSide}
                />
            )}
            {materialMode === 'metallic' && (
                <meshStandardMaterial
                    color={colorStart.current}
                    metalness={1.0}
                    roughness={0.2}
                    envMapIntensity={1.0}
                />
            )}
            {materialMode === 'wireframe' && (
                <meshBasicMaterial
                    color={colorStart.current}
                    wireframe={true}
                    transparent={true}
                    opacity={0.5}
                />
            )}
            {materialMode === 'matte' && (
                <meshStandardMaterial
                    color={colorStart.current}
                    roughness={0.8}
                    metalness={0.0}
                    flatShading={true}
                />
            )}
        </instancedMesh>
    )
}


