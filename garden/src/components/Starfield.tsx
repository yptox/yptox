import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'

const StarfieldMaterial = shaderMaterial(
    {
        uTime: 0,
        uColors: [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()],
        uSize: 50.0,
    },
    // Vertex Shader
    `
    uniform float uTime;
    uniform float uSize;
    attribute float aScale;
    attribute float aSpeed;
    attribute float aColorIndex;
    varying float vAlpha;
    varying float vColorIndex;
    varying float vSpeed;

    void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Static opacity based on 'aSpeed' (random seed)
        vAlpha = 0.8 + (aSpeed * 0.2); 
        vColorIndex = aColorIndex;
        vSpeed = aSpeed;

        // DISABLE SIZE ATTENUATION entirely to prevent flickering
        // Stars will be fixed size regardless of distance
        // INCREASED SIZE for "Lights" look
        gl_PointSize = max(10.0, aScale * 25.0);
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    // Fragment Shader
    `
    uniform vec3 uColors[5];
    uniform float uTime;
    varying float vAlpha;
    varying float vColorIndex;
    varying float vSpeed;

    void main() {
        // Circular particle
        vec2 center = gl_PointCoord - 0.5;
        float dist = length(center);
        if (dist > 0.5) discard;

        // Soft edge + Glow Core
        // 1. Core (White hot center)
        float core = smoothstep(0.1, 0.0, dist);
        
        // 2. Glow (Colored halo)
        float glow = (1.0 - dist * 2.0);
        glow = pow(glow, 1.5); // Falloff

        // Dynamic Color Mixing
        float timeOffset = uTime * 0.2 * vSpeed;
        float colorPos = vColorIndex + timeOffset;
        
        int index1 = int(mod(colorPos, 5.0));
        int index2 = int(mod(colorPos + 1.0, 5.0));
        
        float mixFactor = fract(colorPos);
        
        vec3 c1 = uColors[0];
        if (index1 == 1) c1 = uColors[1];
        else if (index1 == 2) c1 = uColors[2];
        else if (index1 == 3) c1 = uColors[3];
        else if (index1 == 4) c1 = uColors[4];
        
        vec3 c2 = uColors[0];
        if (index2 == 1) c2 = uColors[1];
        else if (index2 == 2) c2 = uColors[2];
        else if (index2 == 3) c2 = uColors[3];
        else if (index2 == 4) c2 = uColors[4];
        
        vec3 baseColor = mix(c1, c2, mixFactor);

        // Mix Core and Glow
        // Removed white mix to keep colors saturated
        vec3 finalColor = baseColor; 
        
        // Boost brightness for Bloom but keep color
        finalColor *= 4.0; // Boosted back to 4.0 for glow

        gl_FragColor = vec4(finalColor, vAlpha * glow);
    }
    `
)

extend({ StarfieldMaterial })

type StarfieldMaterialType = THREE.ShaderMaterial & {
    uTime: number
    uColors: THREE.Color[]
    uSize: number
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            starfieldMaterial: any
        }
    }
}

export default function Starfield({ count = 5000, color }: { count?: number, color?: React.MutableRefObject<THREE.Color> }) {
    const materialRef = useRef<StarfieldMaterialType>(null!)

    const [positions, scales, speeds, colorIndices] = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const scales = new Float32Array(count)
        const speeds = new Float32Array(count)
        const colorIndices = new Float32Array(count)

        const radius = 100 // Starfield radius

        for (let i = 0; i < count; i++) {
            const r = radius * Math.cbrt(Math.random())
            const theta = Math.random() * 2 * Math.PI
            const phi = Math.acos(2 * Math.random() - 1)

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            scales[i] = Math.random()
            speeds[i] = 0.5 + Math.random() * 1.5 // Speed for twinkling and color shifting
            colorIndices[i] = Math.floor(Math.random() * 5)
        }

        return [positions, scales, speeds, colorIndices]
    }, [count])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.getElapsedTime()
            if (color && color.current) {
                const baseColor = color.current
                const hsl = { h: 0, s: 0, l: 0 }
                baseColor.getHSL(hsl)

                // Generate 5 variants dynamically based on the current base color
                // 0: Base
                materialRef.current.uColors[0].copy(baseColor)

                // 1: Analogous +30deg (More variation)
                materialRef.current.uColors[1].setHSL((hsl.h + 0.08) % 1, hsl.s, hsl.l)

                // 2: Analogous -30deg
                materialRef.current.uColors[2].setHSL((hsl.h - 0.08 + 1) % 1, hsl.s, hsl.l)

                // 3: Complementary (Sparkles)
                materialRef.current.uColors[3].setHSL((hsl.h + 0.5) % 1, Math.max(0, hsl.s - 0.2), Math.min(1, hsl.l + 0.4))

                // 4: Bright Saturated (Replaces White)
                // Keep saturation high, just boost lightness slightly
                materialRef.current.uColors[4].setHSL(hsl.h, hsl.s, 0.8)
            }
        }
    })

    return (
        <points renderOrder={-100}> {/* Ensure it renders behind everything */}
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    count={count}
                    args={[scales, 1]}
                />
                <bufferAttribute
                    attach="attributes-aSpeed"
                    count={count}
                    args={[speeds, 1]}
                />
                <bufferAttribute
                    attach="attributes-aColorIndex"
                    count={count}
                    args={[colorIndices, 1]}
                />
            </bufferGeometry>
            <starfieldMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                depthTest={true} // Keep depth test true so it doesn't draw over opaque objects, but with renderOrder -100 it should be fine.
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

