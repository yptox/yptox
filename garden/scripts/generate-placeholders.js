import fs from 'fs';
import path from 'path';
// Actually gltf-transform doesn't have primitive generators built-in easily accessible like that in all versions.
// Let's use a simpler approach: Create a minimal valid GLB buffer manually or use a library if available.
// Wait, I see `draco3dgltf` in package.json, maybe I can use that? No, that's for compression.
// Let's check what's available in `node_modules` or just use a simple three.js script to export?
// I have `three` installed. I can use Three.js in Node to generate geometry and export to GLB using GLTFExporter.

import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { Blob } from 'buffer';

// Polyfill for Three.js in Node
global.window = global;
global.Blob = Blob;
global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
        if (this.onload) {
            this.onload({ target: { result: blob.buffer } }); // Mock event
        }
    }
    readAsDataURL(blob) {
        // Not needed for binary export usually, but just in case
        if (this.onload) {
            this.onload({ target: { result: '' } });
        }
    }
};

const OUTPUT_DIR = './public/models/raw';
const COUNT = 50;

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generate() {
    const exporter = new GLTFExporter();

    for (let i = 0; i < COUNT; i++) {
        const scene = new THREE.Scene();

        // Random geometry
        let geometry;
        const type = Math.floor(Math.random() * 3);
        if (type === 0) geometry = new THREE.BoxGeometry(1, 1, 1);
        else if (type === 1) geometry = new THREE.SphereGeometry(0.5, 16, 16);
        else geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);

        // Random material color
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
            roughness: 0.5,
            metalness: 0.5
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const filename = `placeholder_${i}.glb`;
        const outputPath = path.join(OUTPUT_DIR, filename);

        console.log(`Generating ${filename}...`);

        await new Promise((resolve, reject) => {
            exporter.parse(
                scene,
                (gltf) => {
                    const buffer = Buffer.from(gltf);
                    fs.writeFileSync(outputPath, buffer);
                    resolve();
                },
                (err) => {
                    console.error('An error happened', err);
                    reject(err);
                },
                { binary: true }
            );
        });
    }
    console.log(`Generated ${COUNT} placeholder models.`);
}

generate();
