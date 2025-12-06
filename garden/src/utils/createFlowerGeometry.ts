import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export function createFlowerGeometry() {
    const geometries = []

    // Center
    const centerGeo = new THREE.SphereGeometry(0.3, 8, 8)
    geometries.push(centerGeo)

    // Petals
    const petalCount = 6
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2
        const petalGeo = new THREE.SphereGeometry(0.4, 8, 8)

        // Flatten petal
        petalGeo.scale(1, 0.2, 0.5)

        // Move petal out
        petalGeo.translate(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5)

        // Rotate petal to face center
        petalGeo.rotateY(-angle)

        geometries.push(petalGeo)
    }

    const merged = mergeGeometries(geometries)
    return merged
}
