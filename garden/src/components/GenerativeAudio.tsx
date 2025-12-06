import { useEffect, useRef } from 'react'

type GenerativeAudioProps = {
    enabled: boolean
    volume: number
    analyserRef?: React.MutableRefObject<AnalyserNode | null>
}

export default function GenerativeAudio({ enabled, volume, analyserRef }: GenerativeAudioProps) {
    const audioContextRef = useRef<AudioContext | null>(null)
    const gainNodeRef = useRef<GainNode | null>(null)
    const oscillatorsRef = useRef<OscillatorNode[]>([])

    useEffect(() => {
        if (enabled) {
            // Initialize Audio Context
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext
            if (!AudioContext) return

            const ctx = new AudioContext()
            audioContextRef.current = ctx

            // Master Gain
            const masterGain = ctx.createGain()
            masterGain.gain.value = volume
            masterGain.connect(ctx.destination)
            gainNodeRef.current = masterGain

            // Analyser
            const analyser = ctx.createAnalyser()
            analyser.fftSize = 256
            masterGain.connect(analyser)
            if (analyserRef) {
                analyserRef.current = analyser
            }

            // Create Drone (3 Oscillators forming a chord)
            // Frequencies: Root (C3), Fifth (G3), Octave (C4)
            const freqs = [130.81, 196.00, 261.63]

            freqs.forEach((freq) => {
                const osc = ctx.createOscillator()
                osc.type = 'sine'
                osc.frequency.value = freq

                // Individual Gain/Pan for movement
                const oscGain = ctx.createGain()
                oscGain.gain.value = 0.3 // Base volume per osc

                const panner = ctx.createStereoPanner()
                panner.pan.value = (Math.random() * 2 - 1) * 0.5 // Random initial pan

                // LFO for Pan (Slow movement)
                const lfo = ctx.createOscillator()
                lfo.type = 'sine'
                lfo.frequency.value = 0.1 + Math.random() * 0.1 // Slow LFO
                const lfoGain = ctx.createGain()
                lfoGain.gain.value = 0.5 // Pan amount
                lfo.connect(lfoGain).connect(panner.pan)
                lfo.start()

                osc.connect(oscGain).connect(panner).connect(masterGain)
                osc.start()

                oscillatorsRef.current.push(osc)
                oscillatorsRef.current.push(lfo)
            })
        }

        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close()
                audioContextRef.current = null
            }
            oscillatorsRef.current = []
            if (analyserRef) {
                analyserRef.current = null
            }
        }
    }, [enabled])

    // Update Volume
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current?.currentTime || 0, 0.1)
        }
    }, [volume])

    return null
}
