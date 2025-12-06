import { forwardRef, useMemo } from 'react'
import { Uniform } from 'three'
import { Effect } from 'postprocessing'

const fragmentShader = `
uniform float segments;
uniform float offset;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 centered = uv - 0.5;
    float r = length(centered);
    float a = atan(centered.y, centered.x);
    
    // Kaleidoscope logic
    float segmentAngle = 3.14159 * 2.0 / segments;
    a = mod(a, segmentAngle);
    a = abs(a - segmentAngle/2.0); // Mirror
    
    // Add offset rotation
    a += offset;
    
    vec2 newUv = vec2(cos(a), sin(a)) * r + 0.5;
    
    // Sample texture
    outputColor = texture2D(inputBuffer, newUv);
}
`

// Postprocessing library requires a slightly different shader structure for effects
// But let's try to use the standard Effect class pattern
class KaleidoscopeEffectImpl extends Effect {
    constructor({ segments = 8, offset = 0 } = {}) {
        super(
            'KaleidoscopeEffect',
            fragmentShader,
            {
                uniforms: new Map([
                    ['segments', new Uniform(segments)],
                    ['offset', new Uniform(offset)],
                ]),
            }
        )
    }
}

// Wrap for R3F
type KaleidoscopeEffectProps = {
    segments?: number
    offset?: number
}

export const KaleidoscopeEffect = forwardRef<any, KaleidoscopeEffectProps>(({ segments = 8, offset = 0 }, ref) => {
    const effect = useMemo(() => new KaleidoscopeEffectImpl({ segments, offset }), [segments, offset])
    return <primitive ref={ref} object={effect} dispose={null} />
})
