import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { forwardRef, useMemo } from 'react'

// Define the shader material
const KaleisionShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color('#00ffff'),
    uColorEnd: new THREE.Color('#ff00ff'),
    uFresnelPower: 2.0,
    uFresnelIntensity: 1.5,
    uBreathingIntensity: 0.1,
    uBreathingSpeed: 1.0,
    uOpacity: 0.3
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uBreathingIntensity;
    uniform float uBreathingSpeed;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;
    varying float vDisplacement;

    // Simplex noise or simple sine wave for breathing
    void main() {
      vec3 transformed = position;
      vec3 objectNormal = normal;

      // Breathing effect: Sine wave based on time and Y position
      float breath = sin(uTime * uBreathingSpeed + position.y * 2.0 + position.x) * uBreathingIntensity;
      
      // Displace along normal
      transformed += normal * breath;
      vDisplacement = breath;

      // --- INSTANCING SUPPORT ---
      #ifdef USE_INSTANCING
        // Instance Matrix transforms from Instance Space to Object Space
        transformed = (instanceMatrix * vec4(transformed, 1.0)).xyz;
        
        // Rotate normal by instance matrix (assuming uniform scale for simplicity)
        objectNormal = (instanceMatrix * vec4(objectNormal, 0.0)).xyz;
      #endif

      // Transform to View Space
      // modelViewMatrix transforms from Object Space to View Space
      vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
      
      vNormal = normalize(normalMatrix * objectNormal);
      vViewPosition = -mvPosition.xyz;
      vPosition = transformed;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform float uFresnelPower;
    uniform float uFresnelIntensity;
    uniform float uOpacity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vPosition;
    varying float vDisplacement;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel Effect
      float fresnel = pow(1.0 - dot(viewDir, normal), uFresnelPower);
      // Optional: Tone mapping if needed, but usually handled by post-proc
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `
)

extend({ KaleisionShaderMaterial })

// Add type definition for the new material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      kaleisionShaderMaterial: any // Using any to bypass strict type checks for custom shader material
    }
  }
}

type KaleisionMaterialProps = {
  colorStart?: string | THREE.Color
  colorEnd?: string | THREE.Color
  fresnelPower?: number
  fresnelIntensity?: number
  breathingIntensity?: number
  breathingSpeed?: number
  opacity?: number
  transparent?: boolean
  blending?: THREE.Blending
  side?: THREE.Side
  depthWrite?: boolean
}

export const KaleisionMaterial = forwardRef<THREE.ShaderMaterial, KaleisionMaterialProps>(
  ({ colorStart = '#00aaff', colorEnd = '#ff00aa', fresnelPower = 2.0, fresnelIntensity = 1.5, breathingIntensity = 0.05, breathingSpeed = 1.0, opacity = 0.3, ...props }, ref) => {

    const uniforms = useMemo(() => ({
      uColorStart: new THREE.Color(colorStart),
      uColorEnd: new THREE.Color(colorEnd),
      uFresnelPower: fresnelPower,
      uFresnelIntensity: fresnelIntensity,
      uBreathingIntensity: breathingIntensity,
      uBreathingSpeed: breathingSpeed,
      uOpacity: opacity
    }), [colorStart, colorEnd, fresnelPower, fresnelIntensity, breathingIntensity, breathingSpeed, opacity])

    // @ts-ignore
    return <kaleisionShaderMaterial ref={ref} transparent depthWrite={false} blending={THREE.AdditiveBlending} {...uniforms} {...props} />
  }
)
