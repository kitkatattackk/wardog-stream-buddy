#!/usr/bin/env python3
"""Embed the generated WAV assets as data URLs in the StreamElements widget."""

from __future__ import annotations

import base64
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
WIDGET = ROOT / "public" / "widget" / "wardogs-chat.js"
SOUNDS = ROOT / "public" / "widget" / "sounds"
FILES = {
    "follow": "follow.mp3",
    "sub": "subscriber.mp3",
    "resub": "resubscriber.mp3",
    "gift": "gifted-subs.mp3",
    "bits": "bits.mp3",
    "raid": "raid-siren.mp3",
    "tip": "tip.mp3",
    "first": "first-chat.mp3",
}
START = "  /* BUILT_IN_SOUNDS_START */"
END = "  /* BUILT_IN_SOUNDS_END */"


source = WIDGET.read_text()
before, remainder = source.split(START, 1)
_, after = remainder.split(END, 1)
entries = []
for event, filename in FILES.items():
    payload = base64.b64encode((SOUNDS / filename).read_bytes()).decode("ascii")
    entries.append(f'    {event}: "data:audio/mpeg;base64,{payload}"')
block = START + "\n  var BUILT_IN_SOUNDS = {\n" + ",\n".join(entries) + "\n  };\n  " + END
WIDGET.write_text(before + block + after)
