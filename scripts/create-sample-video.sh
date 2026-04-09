#!/usr/bin/env bash
set -euo pipefail
mkdir -p tmp
ffmpeg -y \
  -f lavfi -i color=c=0xDDEEFF:s=1280x720:d=75 \
  -f lavfi -i sine=frequency=880:duration=75 \
  -vf "drawtext=text='Sample Lesson Video':fontcolor=black:fontsize=56:x=(w-text_w)/2:y=(h-text_h)/2" \
  -c:v libx264 -c:a aac tmp/sample-lesson.mp4

echo "Generated tmp/sample-lesson.mp4"
