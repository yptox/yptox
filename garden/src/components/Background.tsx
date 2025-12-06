import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Background({ color }: { color?: React.MutableRefObject<THREE.Color> }) {
    const materialRef = useRef<THREE.ShaderMaterial>(null!)
    const color1 = useRef(new THREE.Color('#050510'))
    const color2 = useRef(new THREE.Color('#101025'))
    const color3 = useRef(new THREE.Color('#201030'))

    useFrame(() => {
        if (color && color.current) {
            const base = color.current
            const hsl = { h: 0, s: 0, l: 0 }
            base.getHSL(hsl)

            // Very dark versions of the current palette
            // Bottom (Darkest)
            color1.current.setHSL(hsl.h, hsl.s * 0.5, 0.02)
            // Middle
            color2.current.setHSL((hsl.h + 0.1) % 1, hsl.s * 0.5, 0.05)
            // Top (Lighter)
            color3.current.setHSL((hsl.h - 0.1 + 1) % 1, hsl.s * 0.5, 0.1)
        }

        if (materialRef.current) {
            materialRef.current.uniforms.uColor1.value.copy(color1.current)
            materialRef.current.uniforms.uColor2.value.copy(color2.current)
            materialRef.current.uniforms.uColor3.value.copy(color3.current)
        }
    })

    return (
        <>
            {/* Atmospheric Fog */}
            <fogExp2 attach="fog" args={['#000000', 0.02]} />

            {/* Background Gradient Sphere */}
            <mesh scale={100} renderOrder={-2}>
                <sphereGeometry args={[1, 64, 64]} />
                <shaderMaterial
                    ref={materialRef}
                    side={THREE.BackSide}
                    depthWrite={false}
                    uniforms={{
                        uColor1: { value: new THREE.Color('#050510') },
                        uColor2: { value: new THREE.Color('#101025') },
                        uColor3: { value: new THREE.Color('#201030') }
                    }}
                    vertexShader={`
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        uniform vec3 uColor1;
                        uniform vec3 uColor2;
                        uniform vec3 uColor3;
                        varying vec2 vUv;
                        void main() {
                            // Simple vertical gradient
                            float y = vUv.y;
                            vec3 mix1 = mix(uColor1, uColor2, smoothstep(0.0, 0.5, y));
                            vec3 final = mix(mix1, uColor3, smoothstep(0.5, 1.0, y));
                            gl_FragColor = vec4(final, 1.0);
                        }
                    `}
                />
            </mesh>
        </>
    )
}


