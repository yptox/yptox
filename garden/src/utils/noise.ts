/* eslint-disable no-bitwise */

// Fast Simplex Noise implementation
// Based on https://github.com/jwagner/simplex-noise.js

const F3 = 1.0 / 3.0
const G3 = 1.0 / 6.0

const grad3 = new Float32Array([
    1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
    1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
    0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
])

// const p = new Uint8Array(256)
const perm = new Uint8Array(512)
const permMod12 = new Uint8Array(512)

// Initialize with a random seed
const seed = 42
const source = new Uint8Array(256)
for (let i = 0; i < 256; i++) source[i] = i
let seed_val = seed
for (let i = 255; i >= 0; i--) {
    seed_val = (seed_val * 9301 + 49297) % 233280
    const r = Math.floor((seed_val / 233280) * (i + 1))
    const t = source[i]
    source[i] = source[r]
    source[r] = t
}

for (let i = 0; i < 512; i++) {
    perm[i] = source[i & 255]
    permMod12[i] = perm[i] % 12
}

export function simplex3(xin: number, yin: number, zin: number): number {
    let n0, n1, n2, n3 // Noise contributions from the four corners

    // Skew the input space to determine which simplex cell we're in
    const s = (xin + yin + zin) * F3 // Very nice and simple skew factor for 3D
    const i = Math.floor(xin + s)
    const j = Math.floor(yin + s)
    const k = Math.floor(zin + s)
    const t = (i + j + k) * G3
    const X0 = i - t // Unskew the cell origin back to (x,y,z) space
    const Y0 = j - t
    const Z0 = k - t
    const x0 = xin - X0 // The x,y,z distances from the cell origin
    const y0 = yin - Y0
    const z0 = zin - Z0

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    let i1, j1, k1 // Offsets for second corner of simplex in (i,j,k) coords
    let i2, j2, k2 // Offsets for third corner of simplex in (i,j,k) coords

    if (x0 >= y0) {
        if (y0 >= z0) {
            i1 = 1
            j1 = 0
            k1 = 0
            i2 = 1
            j2 = 1
            k2 = 0
        } // X Y Z order
        else if (x0 >= z0) {
            i1 = 1
            j1 = 0
            k1 = 0
            i2 = 1
            j2 = 0
            k2 = 1
        } // X Z Y order
        else {
            i1 = 0
            j1 = 0
            k1 = 1
            i2 = 1
            j2 = 0
            k2 = 1
        } // Z X Y order
    } else {
        // x0<y0
        if (y0 < z0) {
            i1 = 0
            j1 = 0
            k1 = 1
            i2 = 0
            j2 = 1
            k2 = 1
        } // Z Y X order
        else if (x0 < z0) {
            i1 = 0
            j1 = 1
            k1 = 0
            i2 = 0
            j2 = 1
            k2 = 1
        } // Y Z X order
        else {
            i1 = 0
            j1 = 1
            k1 = 0
            i2 = 1
            j2 = 1
            k2 = 0
        } // Y X Z order
    }

    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    const x1 = x0 - i1 + G3 // Offsets for second corner in (x,y,z) coords
    const y1 = y0 - j1 + G3
    const z1 = z0 - k1 + G3
    const x2 = x0 - i2 + 2.0 * G3 // Offsets for third corner in (x,y,z) coords
    const y2 = y0 - j2 + 2.0 * G3
    const z2 = z0 - k2 + 2.0 * G3
    const x3 = x0 - 1.0 + 3.0 * G3 // Offsets for last corner in (x,y,z) coords
    const y3 = y0 - 1.0 + 3.0 * G3
    const z3 = z0 - 1.0 + 3.0 * G3

    // Work out the hashed gradient indices of the four simplex corners
    const ii = i & 255
    const jj = j & 255
    const kk = k & 255
    const gi0 = permMod12[ii + perm[jj + perm[kk]]]
    const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]]
    const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]]
    const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]]

    // Calculate the contribution from the four corners
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0
    if (t0 < 0) n0 = 0.0
    else {
        t0 *= t0
        n0 = t0 * t0 * (grad3[gi0 * 3] * x0 + grad3[gi0 * 3 + 1] * y0 + grad3[gi0 * 3 + 2] * z0)
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1
    if (t1 < 0) n1 = 0.0
    else {
        t1 *= t1
        n1 = t1 * t1 * (grad3[gi1 * 3] * x1 + grad3[gi1 * 3 + 1] * y1 + grad3[gi1 * 3 + 2] * z1)
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2
    if (t2 < 0) n2 = 0.0
    else {
        t2 *= t2
        n2 = t2 * t2 * (grad3[gi2 * 3] * x2 + grad3[gi2 * 3 + 1] * y2 + grad3[gi2 * 3 + 2] * z2)
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3
    if (t3 < 0) n3 = 0.0
    else {
        t3 *= t3
        n3 = t3 * t3 * (grad3[gi3 * 3] * x3 + grad3[gi3 * 3 + 1] * y3 + grad3[gi3 * 3 + 2] * z3)
    }

    // Add contributions from each corner to get the final noise value.
    // The result is scaled to stay just inside [-1,1]
    return 32.0 * (n0 + n1 + n2 + n3)
}

export function curlNoise(x: number, y: number, z: number): { x: number; y: number; z: number } {
    const eps = 0.1

    // const n1 = simplex3(x, y + eps, z)
    // const n2 = simplex3(x, y - eps, z)
    // const n3 = simplex3(x, y, z + eps)
    // const n4 = simplex3(x, y, z - eps)
    // const n5 = simplex3(x + eps, y, z)
    // const n6 = simplex3(x - eps, y, z)

    // const a = (n1 - n2) / (2 * eps)
    // const b = (n3 - n4) / (2 * eps)
    // const c = (n5 - n6) / (2 * eps)

    // This is a simplified curl. For full 3D curl we need more samples, 
    // but this is often enough for visual flow.
    // Proper curl:
    // x = d(nz)/dy - d(ny)/dz
    // y = d(nx)/dz - d(nz)/dx
    // z = d(ny)/dx - d(nx)/dy

    // Let's do proper curl
    const dx = vec3(eps, 0, 0)
    const dy = vec3(0, eps, 0)
    const dz = vec3(0, 0, eps)

    const p = vec3(x, y, z)

    const p_x0 = snoiseVec3(vSub(p, dx))
    const p_x1 = snoiseVec3(vAdd(p, dx))
    const p_y0 = snoiseVec3(vSub(p, dy))
    const p_y1 = snoiseVec3(vAdd(p, dy))
    const p_z0 = snoiseVec3(vSub(p, dz))
    const p_z1 = snoiseVec3(vAdd(p, dz))

    const x_val = p_y1.z - p_y0.z - p_z1.y + p_z0.y
    const y_val = p_z1.x - p_z0.x - p_x1.z + p_x0.z
    const z_val = p_x1.y - p_x0.y - p_y1.x + p_y0.x

    const divisor = 1.0 / (2.0 * eps)

    // Normalize? Maybe not, we want speed variation
    return { x: x_val * divisor, y: y_val * divisor, z: z_val * divisor }
}

// Helpers for curl noise
function vec3(x: number, y: number, z: number) { return { x, y, z } }
function vAdd(v1: { x: number, y: number, z: number }, v2: { x: number, y: number, z: number }) { return { x: v1.x + v2.x, y: v1.y + v2.y, z: v1.z + v2.z } }
function vSub(v1: { x: number, y: number, z: number }, v2: { x: number, y: number, z: number }) { return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z } }

function snoiseVec3(v: { x: number, y: number, z: number }) {
    const s = simplex3(v.x, v.y, v.z)
    const s1 = simplex3(v.y - 19.1, v.z + 33.4, v.x + 47.2)
    const s2 = simplex3(v.z + 74.2, v.x - 124.5, v.y + 99.4)
    return { x: s, y: s1, z: s2 }
}
