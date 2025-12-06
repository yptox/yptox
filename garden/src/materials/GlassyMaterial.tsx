import { useRef } from 'react'
import { MeshPhysicalMaterial } from 'three'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

type GlassyMaterialProps = {
    color?: string
    transmission?: number
    thickness?: number
    roughness?: number
    ior?: number
    chromaticAberration?: number
    globalColor?: React.MutableRefObject<THREE.Color>
}

export function GlassyMaterial({
    color = '#ffffff',
    transmission = 1.0,
    thickness = 1.5,
    roughness = 0.1,
    ior = 1.5,
    chromaticAberration = 0.06,
    globalColor
}: GlassyMaterialProps) {
    const materialRef = useRef<MeshPhysicalMaterial>(null!)

    useFrame(() => {
        if (materialRef.current && globalColor && globalColor.current) {
            materialRef.current.color.copy(globalColor.current)
        }
    })

    return (
        <meshPhysicalMaterial
            ref={materialRef}
            color={color}
            transmission={transmission}
            thickness={thickness}
            roughness={roughness}
            ior={ior}
            iridescence={1.0}
            iridescenceIOR={1.3}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            // @ts-ignore
            chromaticAberration={chromaticAberration} // Requires recent Three.js
            transparent
            depthWrite={true} // Force sorting for stability
        />
    )
}
