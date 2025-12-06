import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import Kaleision from './components/Kaleision'
import './App.css'

import { Leva } from 'leva'
import { useState, useEffect } from 'react'

function App() {
    const [showDev, setShowDev] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F8') {
                setShowDev(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
            <Leva collapsed={false} flat titleBar={false} hidden={!showDev} />

            <Canvas camera={{ position: [0, 0, 15], fov: 45 }} gl={{ antialias: true }}>
                <color attach="background" args={['#151520']} />
                {showDev && <Stats />}

                {/* 
                    All scene logic, including lights, audio, post-processing, and camera controls 
                    are now encapsulated within Kaleision -> FloatingUniverse to prevent duplication 
                    and ensure stability.
                */}
                <Kaleision />

            </Canvas>
        </div>
    )
}

export default App
