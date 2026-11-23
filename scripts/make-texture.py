"""Makes the patchwork texture behind posts from the home page's photo.

Lays square patches of clean, light sky from public/background.jpg,
picked and turned at random, across the top of a wide image, and evens
out their colors so the patchwork stays quiet behind text. Columns stop
at random depths with a few stray squares below, so the bottom edge is
ragged. Columns behind the text column stop early and columns out to
the sides run deeper. Empty cells are the page's off-white.

The image is centered at the top of each post, so its middle sits
behind the text.

    python3 scripts/make-texture.py [seed]

Needs Pillow and NumPy. Writes public/texture.avif, .webp and .jpg.
Change the seed for a different arrangement.
"""

import random
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PATCH = 200  # Each patch's width and height, in pixels.
COLUMNS = 15  # Patches across. 15 make 3000px, wider than most screens.
ROWS = 7  # The deepest a column can run.
TEXT_HALF_WIDTH = 380  # Half the text column's width, plus a little room.
DEPTH_BEHIND_TEXT = (2, 3)  # Rows for columns behind the text: fewest, most.
DEPTH_AT_SIDES = (4, 7)  # Rows for columns out to the sides.
STRAY_CHANCE = 0.35  # Chance of a stray square in the row below a column.
PAPER = (247, 244, 240)  # The page color, #f7f4f0 in public/writing.css.
COLOR_EVENING = 0.55  # How far each patch's color moves toward the average.
GRADIENT_SOFTENING = 0.75  # How much of each patch's internal shading is kept.


def sky_mask(photo):
    """Marks pixels that are light sky with no specks: birds, branches,
    rock edges or dust."""
    gray = photo.convert('L')
    lum = np.asarray(gray, dtype=float)
    fine = np.asarray(gray.filter(ImageFilter.GaussianBlur(4)), dtype=float)
    coarse = np.asarray(gray.filter(ImageFilter.GaussianBlur(30)), dtype=float)
    return (lum > 192) & (np.abs(fine - coarse) < 1.6)


def main():
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else 49
    rng = random.Random(seed)

    photo = Image.open(ROOT / 'public' / 'background.jpg').convert('RGB')
    pixels = np.asarray(photo, dtype=float)
    mask = sky_mask(photo)

    # A summed-area table answers "is this whole rectangle clean sky?" quickly.
    bad = np.pad((~mask).astype(np.int64), ((1, 0), (1, 0))).cumsum(0).cumsum(1)

    def is_clean(x, y, w, h):
        return bad[y + h, x + w] - bad[y, x + w] - bad[y + h, x] + bad[y, x] == 0

    width_px, height_px = COLUMNS * PATCH, ROWS * PATCH
    center = width_px / 2

    patches = []
    for col in range(COLUMNS):
        left = col * PATCH
        behind_text = left < center + TEXT_HALF_WIDTH and left + PATCH > center - TEXT_HALF_WIDTH
        depth = rng.randint(*(DEPTH_BEHIND_TEXT if behind_text else DEPTH_AT_SIDES))
        rows = list(range(depth))
        # Out to the sides, a stray square or two below the edge makes it
        # fray, and now and then a square at the edge goes missing. Behind
        # the text, columns stop cleanly so nothing reaches the reading.
        if not behind_text:
            for extra in (depth, depth + 1):
                if extra < ROWS and rng.random() < STRAY_CHANCE:
                    rows.append(extra)
            if rng.random() < 0.25:
                rows.remove(depth - 1)
        patches += [(left, row * PATCH, PATCH, PATCH) for row in rows]

    height, width = mask.shape
    crops = []
    for _, _, w, h in patches:
        # If no area of the sky is clean at full size, a smaller crop is
        # scaled up. The sky is smooth enough that this doesn't show.
        for scale in (1, 1.25, 1.5, 2):
            cw, ch = round(w / scale), round(h / scale)
            found = None
            for _ in range(5000):
                x = rng.randrange(0, width - cw)
                y = rng.randrange(0, height - ch)
                if is_clean(x, y, cw, ch):
                    found = (x, y)
                    break
            if found:
                break
        else:
            raise SystemExit(f'No clean sky region for a {w}x{h} patch')
        x, y = found
        crop = pixels[y : y + ch, x : x + cw]
        if scale != 1:
            crop = np.asarray(
                Image.fromarray(crop.astype(np.uint8)).resize((w, h), Image.Resampling.LANCZOS),
                dtype=float,
            )
        crop = crop.copy()
        if rng.random() < 0.5:
            crop = crop[:, ::-1]
        if rng.random() < 0.5:
            crop = crop[::-1, :]
        crop = np.rot90(crop, rng.randrange(4))
        crops.append(crop)

    average = np.concatenate([c.reshape(-1, 3) for c in crops]).mean(0)
    texture = np.zeros((height_px, width_px, 3)) + PAPER

    for (x, y, w, h), crop in zip(patches, crops):
        mean = crop.reshape(-1, 3).mean(0)
        evened = mean + (average - mean) * COLOR_EVENING
        texture[y : y + h, x : x + w] = evened + (crop - mean) * GRADIENT_SOFTENING

    image = Image.fromarray(texture.clip(0, 255).round().astype(np.uint8))
    out = ROOT / 'public'
    image.save(out / 'texture.jpg', quality=82, optimize=True, progressive=True)
    image.save(out / 'texture.webp', quality=78, method=6)
    image.save(out / 'texture.avif', quality=60)

    print(f'{len(patches)} patches, {width_px}x{height_px}, seed {seed}')


if __name__ == '__main__':
    main()
