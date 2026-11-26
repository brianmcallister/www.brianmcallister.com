"""Makes the tile sheet for the patchwork at the top of posts.

Cuts square tiles from the home page's photo, public/background.jpg, in
three groups, and lays them out in rows in public/patchwork.webp:

  - light: the sea, softened and lightened to a pale blue-gray, for the
    squares nearest the text
  - mid: the sea, softened and only a little lighter, for squares further
    out
  - dark: the island's rock, for squares near the page's edges

The sea is blurred first, so its waves become soft shading rather than
busy texture.

Within each group, colors move partway toward the group's average and
shading inside each tile is softened, so the patchwork stays quiet.
public/patchwork.js reads the sheet and lays the squares out; the counts
below must match the ones there.

    python3 scripts/make-patchwork.py [seed]

Needs Pillow and NumPy. Change the seed for a different set of tiles.
"""

import random
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
TILE = 128  # Pixels per tile in the sheet: twice its size on the page.
SHEET_COLUMNS = 12
COUNTS = {'light': 48, 'mid': 24, 'dark': 12}  # Must match patchwork.js.
COLOR_EVENING = 0.55  # How far each tile's color moves toward its group's average.
GRADIENT_SOFTENING = 0.75  # How much of each tile's internal shading is kept.
SEA_BLUR = 10  # Blur radius that softens the sea's waves, in pixels.
# How far each group moves toward a pale blue: far for light, a touch for
# mid. Lightening toward white instead would wash the blue out to gray.
LIGHTEN = {'light': 0.8, 'mid': 0.3, 'dark': 0.0}
PALE_BLUE = np.array([226, 236, 244])


def main():
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else 49
    rng = random.Random(seed)

    photo = Image.open(ROOT / 'public' / 'background.jpg').convert('RGB')
    pixels = np.asarray(photo, dtype=float)
    gray = photo.convert('L')
    lum = np.asarray(gray, dtype=float)
    # Anything that stands out from its blurred surroundings is a speck: a
    # bird, a branch, a rock edge or dust.
    speck = np.abs(
        np.asarray(gray.filter(ImageFilter.GaussianBlur(4)), dtype=float)
        - np.asarray(gray.filter(ImageFilter.GaussianBlur(30)), dtype=float)
    )
    height, width = lum.shape

    def candidates(test, step=32):
        found = []
        for y in range(0, height - TILE + 1, step):
            for x in range(0, width - TILE + 1, step):
                if test(x, y, lum[y : y + TILE, x : x + TILE], speck[y : y + TILE, x : x + TILE]):
                    found.append((x, y))
        return found

    horizon = int(height * 0.45)
    surfers = (int(width * 0.32), int(height * 0.52), int(width * 0.68), int(height * 0.66))

    def is_sea(x, y, t):
        clear_of_surfers = x + TILE <= surfers[0] or x >= surfers[2] or y + TILE <= surfers[1] or y >= surfers[3]
        mean = pixels[y : y + TILE, x : x + TILE].reshape(-1, 3).mean(0)
        blue_enough = mean[2] - mean[0] > 22
        return y > horizon and clear_of_surfers and blue_enough and 80 < t.mean() < 170 and t.max() < 235

    sea_groups = candidates(lambda x, y, t, s: is_sea(x, y, t))
    groups = {
        'light': sea_groups,
        'mid': sea_groups,
        'dark': candidates(lambda x, y, t, s: 30 < t.mean() < 80 and t.std() < 10 and t.max() < 110),
    }
    soft_sea = np.asarray(photo.filter(ImageFilter.GaussianBlur(SEA_BLUR)), dtype=float)

    tiles = []
    for name, count in COUNTS.items():
        pool = groups[name]
        if len(pool) < count:
            raise SystemExit(f'Only {len(pool)} {name} areas found, {count} needed')
        crops = []
        source = pixels if name == 'dark' else soft_sea
        for x, y in rng.sample(pool, count):
            crop = source[y : y + TILE, x : x + TILE]
            crop = crop + (PALE_BLUE - crop) * LIGHTEN[name]
            if rng.random() < 0.5:
                crop = crop[:, ::-1]
            crops.append(np.rot90(crop, rng.randrange(4)))
        average = np.mean([c.reshape(-1, 3).mean(0) for c in crops], axis=0)
        for crop in crops:
            mean = crop.reshape(-1, 3).mean(0)
            tiles.append(mean + (average - mean) * COLOR_EVENING + (crop - mean) * GRADIENT_SOFTENING)
        print(f'{name}: {count} tiles from {len(pool)} areas, average {average.round().astype(int).tolist()}')

    rows = -(-len(tiles) // SHEET_COLUMNS)
    sheet = np.zeros((rows * TILE, SHEET_COLUMNS * TILE, 3))
    for i, tile in enumerate(tiles):
        r, c = divmod(i, SHEET_COLUMNS)
        sheet[r * TILE : (r + 1) * TILE, c * TILE : (c + 1) * TILE] = tile

    image = Image.fromarray(sheet.clip(0, 255).round().astype(np.uint8))
    image.save(ROOT / 'public' / 'patchwork.webp', quality=80, method=6)
    print(f'Sheet {image.size[0]}x{image.size[1]}, seed {seed}')


if __name__ == '__main__':
    main()
