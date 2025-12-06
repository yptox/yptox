import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { forwardRef, useRef, useMemo } from 'react'

const BioluminescentShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uBaseColor: new THREE.Color('#ffffff'),
        uColorStart: new THREE.Color('#00ffff'),
        uColorEnd: new THREE.Color('#ff00ff'),
        uRimPower: 2.0,
        uRimStrength: 1.5,
    },
    // Vertex Shader
    `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;

  void main() {
    #ifdef USE_INSTANCING
      vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
    #else
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    #endif

    vWorldPosition = worldPosition.xyz;
    
    vec4 viewPosition = viewMatrix * worldPosition;
    vViewPosition = -viewPosition.xyz;

    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * viewPosition;
  }
  `,
    // Fragment Shader
    `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform float uRimPower;
    uniform float uRimStrength;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      vec3 normal = normalize(vNormal);

      // Fresnel Effect (Rim Light)
      float fresnel = pow(1.0 - abs(dot(viewDir, normal)), uRimPower);

      // Position-based Palette Interpolation
      // Map world position (approx -20 to 20) to 0-1 range
      float t = smoothstep(-20.0, 20.0, vWorldPosition.x + vWorldPosition.y * 0.5);
      vec3 paletteColor = mix(uColorStart, uColorEnd, t);

      // Combine
      vec3 finalColor = paletteColor + (uBaseColor * fresnel * uRimStrength);

      // Transparency
      float alpha = 0.3 + (fresnel * 0.5); // More opaque at edges

      gl_FragColor = vec4(finalColor, alpha);
    }
  `
)

extend({ BioluminescentShaderMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            bioluminescentShaderMaterial: any
        }
    }
}

type BioluminescentMaterialProps = {
    globalColor?: React.MutableRefObject<THREE.Color>
    colorStart?: string | THREE.Color
    colorEnd?: string | THREE.Color
    rimPower?: number
    rimStrength?: number
} & any

export const BioluminescentMaterial = forwardRef<THREE.ShaderMaterial, BioluminescentMaterialProps>(
    ({ globalColor, colorStart = '#00ffff', colorEnd = '#ff00ff', rimPower = 2.0, rimStrength = 1.5, ...props }, ref) => {
        const internalRef = useRef<THREE.ShaderMaterial>(null!)

        useFrame((state) => {
            const material = (ref as React.MutableRefObject<THREE.ShaderMaterial>)?.current || internalRef.current
            if (!material) return

            material.uniforms.uTime.value = state.clock.elapsedTime

            if (globalColor && globalColor.current) {
                material.uniforms.uColorStart.value.copy(globalColor.current)
                // Create a gradient
                const endColor = new THREE.Color().copy(globalColor.current).offsetHSL(0.1, 0, 0)
                material.uniforms.uColorEnd.value.copy(endColor)
            }
        })

        const uniforms = useMemo(() => ({
            uColorStart: new THREE.Color(colorStart),
            uColorEnd: new THREE.Color(colorEnd),
            uRimPower: rimPower,
            uRimStrength: rimStrength
        }), [colorStart, colorEnd, rimPower, rimStrength])

        // @ts-ignore
        return <bioluminescentShaderMaterial
            ref={ref || internalRef}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            {...uniforms}
            {...props}
        />
    }
)
