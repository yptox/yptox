import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function DriftCamera({ enabled }: { enabled: boolean }) {
    const { camera } = useThree()
    const vec = new THREE.Vector3()

    useFrame((state, delta) => {
        if (!enabled) return

        const t = state.clock.getElapsedTime() * 0.1 // Slow time down

        // Lissajous curve for smooth, non-repeating path
        const x = Math.sin(t) * 10
        const y = Math.cos(t * 0.8) * 5
        const z = Math.cos(t * 0.5) * 15 + 10 // Keep some distance

        // Smoothly interpolate current position to target
        camera.position.lerp(vec.set(x, y, z), 0.01)

        // Always look at center (0,0,0)
        camera.lookAt(0, 0, 0)

        // Tumble Effect (Z-axis roll)
        // We apply this after lookAt because lookAt resets the quaternion.
        // However, lookAt sets the rotation based on position.
        // To add a roll, we can rotate the camera on its local Z axis.
        camera.rotateZ(delta * 0.05)
    })

    return null
}
