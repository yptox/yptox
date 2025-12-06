import { Sparkles } from '@react-three/drei'

export default function LifeParticles() {
    return (
        <group>
            {/* Background Dust - Subtle, slow, abundant */}
            <Sparkles
                count={200}
                scale={40}
                size={2}
                speed={0.2}
                opacity={0.4}
                color="#ffffff"
            />

            {/* Foreground Sparkles - Brighter, faster, fewer */}
            <Sparkles
                count={50}
                scale={30}
                size={5}
                speed={0.5}
                opacity={0.8}
                color="#aaccff"
            />
        </group>
    )
}
