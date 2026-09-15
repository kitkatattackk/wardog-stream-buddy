#!/usr/bin/env python3
"""Generate the Wardogs Chat alert WAV files with no external dependencies."""

from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path


RATE = 16_000
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "widget" / "sounds"
random.seed(1944)


def envelope(t: float, duration: float, attack: float = 0.012, release: float = 0.12) -> float:
    return min(1.0, t / attack) * min(1.0, max(0.0, duration - t) / release)


def tone(t: float, start: float, duration: float, frequency: float, volume: float = 1.0,
         wave_type: str = "sine", end_frequency: float | None = None) -> float:
    local = t - start
    if local < 0 or local >= duration:
        return 0.0
    end = end_frequency or frequency
    progress = local / duration
    freq = frequency * ((end / frequency) ** progress)
    phase = 2 * math.pi * freq * local
    if wave_type == "square":
        value = 1.0 if math.sin(phase) >= 0 else -1.0
    elif wave_type == "triangle":
        value = 2 / math.pi * math.asin(math.sin(phase))
    elif wave_type == "saw":
        value = 2 * ((freq * local) % 1) - 1
    else:
        value = math.sin(phase)
    return value * envelope(local, duration) * volume


def noise(t: float, start: float, duration: float, volume: float = 1.0) -> float:
    local = t - start
    if local < 0 or local >= duration:
        return 0.0
    return random.uniform(-1, 1) * envelope(local, duration, 0.003, duration * 0.8) * volume


def write_wav(name: str, duration: float, render) -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    frames = bytearray()
    for sample_index in range(int(duration * RATE)):
        sample = max(-1.0, min(1.0, render(sample_index / RATE)))
        frames.extend(struct.pack("<h", int(sample * 32767)))
    with wave.open(str(OUTPUT / name), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(frames)


def sequence(notes, wave_type="triangle", volume=0.42):
    return lambda t: sum(tone(t, start, length, freq, volume, wave_type) for freq, start, length in notes)


write_wav("follow.wav", 0.48, sequence([(520, 0, 0.17), (780, 0.16, 0.30)]))
write_wav("subscriber.wav", 0.68, sequence([(196, 0, 0.19), (294, 0.16, 0.22), (392, 0.34, 0.32)]))
write_wav("resubscriber.wav", 0.82, sequence([(220, 0, 0.16), (330, 0.14, 0.16), (440, 0.28, 0.16), (660, 0.42, 0.38)]))
write_wav(
    "gifted-subs.wav",
    0.92,
    lambda t: noise(t, 0, 0.18, 0.24)
    + tone(t, 0, 0.25, 92, 0.48, "sine", 58)
    + sum(tone(t, start, length, freq, 0.34, "triangle") for freq, start, length in [(262, .23, .15), (392, .36, .15), (523, .49, .15), (784, .62, .29)]),
)
write_wav(
    "bits.wav",
    0.58,
    lambda t: sum(noise(t, start, 0.055, 0.35) + tone(t, start, 0.07, freq, 0.18, "square") for start, freq in [(0, 920), (.12, 760), (.24, 1040), (.36, 1240)]),
)
write_wav("tip.wav", 0.62, sequence([(880, 0, 0.18), (1320, 0.14, 0.46)], "sine", 0.38))
write_wav(
    "first-chat.wav",
    0.66,
    lambda t: noise(t, 0, 0.13, 0.18) + sequence([(340, .10, .12), (430, .22, .12), (520, .34, .30)], "square", .24)(t),
)


def raid_siren(t: float) -> float:
    cycle = 1.12
    phase = (t % cycle) / cycle
    sweep = phase * 2 if phase < 0.5 else (1 - phase) * 2
    frequency = 310 + 470 * sweep
    wobble = 1 + 0.035 * math.sin(2 * math.pi * 8 * t)
    fade = min(1, t / 0.06) * min(1, max(0, 3.25 - t) / 0.28)
    return (0.28 * math.sin(2 * math.pi * frequency * wobble * t) + 0.10 * math.sin(2 * math.pi * frequency * 2 * t)) * fade


write_wav("raid-siren.wav", 3.25, raid_siren)

