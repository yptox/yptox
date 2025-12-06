import { NodeIO } from '@gltf-transform/core';
import { draco, prune, dedup, textureCompress, metalRough } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import fs from 'fs/promises';
import path from 'path';

const RAW_DIR = 'public/models/raw';
const OPTIMIZED_DIR = 'public/models/optimized';
const MANIFEST_PATH = 'public/models/manifest.json';

// Custom Transform: Normalize Scale to Unit Sphere
function normalizeScale() {
    return (document) => {
        const root = document.getRoot();
        let min = [Infinity, Infinity, Infinity];
        let max = [-Infinity, -Infinity, -Infinity];

        // Calculate bounds of the entire scene
        for (const mesh of root.listMeshes()) {
            for (const prim of mesh.listPrimitives()) {
                const pos = prim.getAttribute('POSITION');
                if (!pos) continue;

                for (let i = 0; i < pos.getCount(); i++) {
                    const [x, y, z] = pos.getElement(i, []);
                    min[0] = Math.min(min[0], x);
                    min[1] = Math.min(min[1], y);
                    min[2] = Math.min(min[2], z);
                    max[0] = Math.max(max[0], x);
                    max[1] = Math.max(max[1], y);
                    max[2] = Math.max(max[2], z);
                }
            }
        }

        // Calculate size and scale factor
        const size = [
            max[0] - min[0],
            max[1] - min[1],
            max[2] - min[2]
        ];
        const maxDim = Math.max(size[0], size[1], size[2]);
        // Avoid division by zero
        const scaleFactor = maxDim > 0.0001 ? 1.0 / maxDim : 1.0;

        // Apply scaling to all nodes
        // Note: Ideally we'd apply this to the root node, but for simplicity in this context
        // we can just scale the vertex positions directly or add a root scaling node.
        // A cleaner way in gltf-transform is often just to scale the mesh data if we want "baked" normalization.

        // Let's bake the scale and centering into the vertices for cheapest runtime performance
        const centerX = (min[0] + max[0]) / 2;
        const centerY = (min[1] + max[1]) / 2;
        const centerZ = (min[2] + max[2]) / 2;

        for (const mesh of root.listMeshes()) {
            for (const prim of mesh.listPrimitives()) {
                const pos = prim.getAttribute('POSITION');
                if (!pos) continue;

                for (let i = 0; i < pos.getCount(); i++) {
                    const [x, y, z] = pos.getElement(i, []);
                    pos.setElement(i, [
                        (x - centerX) * scaleFactor,
                        (y - centerY) * scaleFactor,
                        (z - centerZ) * scaleFactor
                    ]);
                }
            }
        }
    };
}

async function optimize() {
    // Ensure output dir exists
    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });

    // Read manifest
    let manifest = [];
    try {
        const manifestData = await fs.readFile(MANIFEST_PATH, 'utf-8');
        manifest = JSON.parse(manifestData);
    } catch (e) {
        console.error("Could not read manifest.json", e);
        return;
    }

    const io = new NodeIO()
        .registerExtensions([
            // Add extensions if needed
        ])
        .registerDependencies({
            'draco3d.decoder': await draco3d.createDecoderModule(),
            'draco3d.encoder': await draco3d.createEncoderModule(),
        });

    const successfulItems = [];

    for (const item of manifest) {
        const rawPath = path.join('public', item.path);
        const optimizedPath = path.join('public', item.optimizedPath);

        console.log(`Optimizing ${item.id}...`);

        try {
            const document = await io.read(rawPath);

            // Check for textures
            if (document.getRoot().listTextures().length === 0) {
                console.warn(`Warning: No textures found in ${item.id}`);
                // throw new Error("No textures found (skipping)");
            }

            await document.transform(
                // Convert legacy specular glossiness to metal/rough
                metalRough(),
                // Remove unused nodes (but keep textures)
                prune(),
                // Deduplicate accessors/textures
                dedup(),
                // Custom Normalization (Center & Scale)
                normalizeScale(),
                // Compress geometry with Draco
                draco({
                    compressionLevel: 7
                })
            );

            await io.write(optimizedPath, document);
            console.log(`Saved to ${optimizedPath}`);
            successfulItems.push(item);
        } catch (e) {
            console.error(`Failed to optimize ${item.id}:`, e.message);
            // Don't add to successfulItems
        }
    }

    // Update manifest with only successful items
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(successfulItems, null, 2));
    console.log(`Optimization complete. Manifest updated with ${successfulItems.length} valid items.`);
}

optimize();
