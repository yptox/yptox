import objaverse
import os
import shutil
import random
import json

OUTPUT_DIR = "public/models/raw"
MANIFEST_PATH = "public/models/manifest.json"

# Ensure output directory exists
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# Clean up existing models to keep it fresh
for f in os.listdir(OUTPUT_DIR):
    if f.endswith(".glb"):
        os.remove(os.path.join(OUTPUT_DIR, f))

print("Loading annotations...")
annotations = objaverse.load_annotations()

target_tags = {"nature", "abstract", "organic", "floral", "geometric", "plant", "flower"}
filtered_uids = []

print("Filtering by tags...")
for uid, ann in annotations.items():
    tags = ann.get("tags", [])
    tag_names = set()
    for t in tags:
        if isinstance(t, dict):
            tag_names.add(t.get("name", "").lower())
        elif isinstance(t, str):
            tag_names.add(t.lower())
            
    if not tag_names.isdisjoint(target_tags):
        filtered_uids.append(uid)

print(f"Found {len(filtered_uids)} matching models.")

if not filtered_uids:
    print("No models found. Exiting.")
    exit(1)

# Fetch a larger pool to filter from
POOL_SIZE = 50
TARGET_SIZE = 30

# Sample from filtered list
random_uids = random.sample(filtered_uids, min(len(filtered_uids), POOL_SIZE))

print(f"Downloading {len(random_uids)} objects to filter for Low Poly...")
objects = objaverse.load_objects(uids=random_uids)

# Filter by file size (Proxy for Low Poly / Performance)
model_candidates = []

for uid, path in objects.items():
    size_mb = os.path.getsize(path) / (1024 * 1024)
    model_candidates.append({
        "uid": uid,
        "path": path,
        "size": size_mb
    })

# Sort by size (smallest first)
model_candidates.sort(key=lambda x: x["size"])

# Keep top TARGET_SIZE
selected_models = model_candidates[:TARGET_SIZE]

print(f"Selected {len(selected_models)} smallest models (Max size: {selected_models[-1]['size']:.2f} MB)")

manifest = []

for model in selected_models:
    uid = model["uid"]
    src_path = model["path"]
    
    filename = f"{uid}.glb"
    target_path = os.path.join(OUTPUT_DIR, filename)
    
    # Move/Copy to output dir
    shutil.copy2(src_path, target_path)
    print(f"Saved {uid} ({model['size']:.2f} MB)")
    
    manifest.append({
        "id": uid,
        "path": f"/models/raw/{filename}",
        "optimizedPath": f"/models/optimized/{filename}" # Placeholder
    })

# Save manifest
with open(MANIFEST_PATH, "w") as f:
    json.dump(manifest, f, indent=2)

print(f"Manifest saved to {MANIFEST_PATH} with {len(manifest)} items.")
print("Done.")
