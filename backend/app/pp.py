"""PP calculation hooks, backed by rosu-pp-py.

Requires the beatmap's .osu file on disk (see BEATMAPS_PATH). Score
submission calls `calculate_pp` with the raw hit statistics; if the .osu
file hasn't been downloaded yet this returns 0.0 rather than failing the
submission, so score storage never hard-depends on the beatmap mirror.
"""
from __future__ import annotations

from pathlib import Path

import rosu_pp_py as rosu

BEATMAPS_PATH = Path("/data/beatmaps")


def calculate_pp(
    *,
    beatmap_id: int,
    mode: int,
    mods: int,
    accuracy: float,
    max_combo: int,
    count_300: int,
    count_100: int,
    count_50: int,
    count_miss: int,
) -> float:
    osu_file = BEATMAPS_PATH / f"{beatmap_id}.osu"
    if not osu_file.exists():
        return 0.0

    beatmap = rosu.Beatmap(path=str(osu_file))
    performance = rosu.Performance(
        mods=mods,
        combo=max_combo,
        n300=count_300,
        n100=count_100,
        n50=count_50,
        misses=count_miss,
    )
    attrs = performance.calculate(beatmap)
    return round(attrs.pp, 4)
