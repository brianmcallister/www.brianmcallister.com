"""Makes the patchwork texture behind posts from the home page's photo.

Splits a square into patches of random sizes, fills each with a crop of
clean, light sky from public/background.jpg, then evens out the colors
so the patchwork stays quiet behind text. The square's edges fall on
patch edges, so the texture repeats without a visible join.

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
SIZE = 1200  # The texture's width and height, in pixels.
UNIT = 50  # Patch edges fall on multiples of this.
MIN_PATCH = 100
MAX_PATCH = 400
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


def split(x, y, w, h, rng, out):
    """Cuts a rectangle into patches of random sizes."""
    can_cut_w = w >= 2 * MIN_PATCH
    can_cut_h = h >= 2 * MIN_PATCH
    small_enough = w <= MAX_PATCH and h <= MAX_PATCH

    if small_enough and (rng.random() < 0.35 or not (can_cut_w or can_cut_h)):
        out.append((x, y, w, h))
        return

    cut_w = can_cut_w and (w >= h or not can_cut_h)
    length = w if cut_w else h
    at = rng.randrange(MIN_PATCH, length - MIN_PATCH + 1, UNIT)

    if cut_w:
        split(x, y, at, h, rng, out)
        split(x + at, y, w - at, h, rng, out)
    else:
        split(x, y, w, at, rng, out)
        split(x, y + at, w, h - at, rng, out)


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

    patches = []
    split(0, 0, SIZE, SIZE, rng, patches)

    height, width = mask.shape
    crops = []
    for _, _, w, h in patches:
        # Few large areas of the sky are completely clean, so a big patch
        # may come from a smaller crop, scaled up. The sky is smooth enough
        # that this doesn't show.
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
        crops.append(crop)

    average = np.concatenate([c.reshape(-1, 3) for c in crops]).mean(0)
    texture = np.zeros((SIZE, SIZE, 3))

    for (x, y, w, h), crop in zip(patches, crops):
        mean = crop.reshape(-1, 3).mean(0)
        evened = mean + (average - mean) * COLOR_EVENING
        texture[y : y + h, x : x + w] = evened + (crop - mean) * GRADIENT_SOFTENING

    image = Image.fromarray(texture.clip(0, 255).round().astype(np.uint8))
    out = ROOT / 'public'
    image.save(out / 'texture.jpg', quality=82, optimize=True, progressive=True)
    image.save(out / 'texture.webp', quality=78, method=6)
    image.save(out / 'texture.avif', quality=60)

    print(f'{len(patches)} patches, seed {seed}, average color {average.round().astype(int).tolist()}')


if __name__ == '__main__':
    main()
