import * as THREE from 'three'

export type PaletteName = 'Ocean' | 'Sunset' | 'Forest' | 'Cyber' | 'Royal' | 'Nebula' | 'Fire' | 'Ice' | 'Lavender' | 'Mint' | 'Neon' | 'Pastel' | 'Dark' | 'Golden' | 'CottonCandy'

export const PALETTE_NAMES: PaletteName[] = ['Ocean', 'Sunset', 'Forest', 'Cyber', 'Royal', 'Nebula', 'Fire', 'Ice', 'Lavender', 'Mint', 'Neon', 'Pastel', 'Dark', 'Golden', 'CottonCandy']

type PaletteDef = {
    h: [number, number]
    s: [number, number]
    l: [number, number]
    primary: string // For gradient start
    secondary: string // For gradient end
}

export const PALETTES: Record<PaletteName, PaletteDef> = {
    Ocean: { h: [0.5, 0.65], s: [0.6, 0.9], l: [0.4, 0.7], primary: '#006994', secondary: '#00bcd4' },
    Sunset: { h: [0.9, 1.1], s: [0.7, 1.0], l: [0.5, 0.7], primary: '#ff4e50', secondary: '#f9d423' },
    Forest: { h: [0.25, 0.4], s: [0.5, 0.8], l: [0.3, 0.6], primary: '#134e5e', secondary: '#71b280' },
    Cyber: { h: [0.7, 0.9], s: [0.8, 1.0], l: [0.5, 0.8], primary: '#2e004d', secondary: '#ff0080' },
    Royal: { h: [0.1, 0.15], s: [0.8, 1.0], l: [0.4, 0.6], primary: '#ffd700', secondary: '#800080' },
    Nebula: { h: [0.6, 0.8], s: [0.7, 1.0], l: [0.4, 0.7], primary: '#4b0082', secondary: '#8a2be2' },
    Fire: { h: [0.0, 0.1], s: [0.8, 1.0], l: [0.5, 0.7], primary: '#ff0000', secondary: '#ff7f00' },
    Ice: { h: [0.5, 0.6], s: [0.6, 0.8], l: [0.6, 0.8], primary: '#00bcd4', secondary: '#26c6da' }, // More saturated cyan
    Lavender: { h: [0.75, 0.85], s: [0.6, 0.9], l: [0.5, 0.7], primary: '#7b68ee', secondary: '#9370db' }, // Darker, richer purple
    Mint: { h: [0.4, 0.5], s: [0.6, 0.9], l: [0.6, 0.8], primary: '#98ff98', secondary: '#00ff7f' },
    Neon: { h: [0.0, 1.0], s: [0.9, 1.0], l: [0.5, 0.6], primary: '#ff00ff', secondary: '#00ffff' }, // Full spectrum high saturation
    Pastel: { h: [0.0, 1.0], s: [0.6, 0.8], l: [0.6, 0.8], primary: '#ff6b6b', secondary: '#4ecdc4' }, // "Pastel" but punchy
    Dark: { h: [0.0, 1.0], s: [0.1, 0.3], l: [0.1, 0.3], primary: '#232526', secondary: '#414345' },
    Golden: { h: [0.1, 0.15], s: [0.8, 1.0], l: [0.5, 0.7], primary: '#bf953f', secondary: '#fcf6ba' },
    CottonCandy: { h: [0.8, 1.0], s: [0.6, 0.9], l: [0.7, 0.9], primary: '#ff9a9e', secondary: '#fecfef' },
}

export function getHarmoniousColor(palette: PaletteName): THREE.Color {
    const p = PALETTES[palette]
    if (!p) {
        console.warn(`Palette '${palette}' not found, defaulting to hotpink.`)
        return new THREE.Color('hotpink')
    }
    const h = THREE.MathUtils.lerp(p.h[0], p.h[1], Math.random())
    const s = THREE.MathUtils.lerp(p.s[0], p.s[1], Math.random())
    const l = THREE.MathUtils.lerp(p.l[0], p.l[1], Math.random())

    // Handle hue wrapping for Sunset (0.9 to 1.1 -> 0.9 to 1.0 and 0.0 to 0.1)
    const finalH = h > 1 ? h - 1 : h

    return new THREE.Color().setHSL(finalH, s, l)
}
