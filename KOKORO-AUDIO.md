# Kokoro audio pipeline

The workflow builds a separate static Pages artifact using Kokoro 82M (British Emma, bf_emma), Python, CPU PyTorch and FFmpeg. It does not commit MP3s or change source articles. Only articles published 0–29 days ago receive audio. An expired article remains unchanged in the source and its next deployed build has no audio/player. The cache is pruned to active article text hashes; previous Actions cache snapshots may remain until GitHub eviction. The preview branch builds two articles without deploying. For production, select **Settings > Pages > Source > GitHub Actions**, then run **Kokoro audio and Pages** on main. The custom domain must stay actinguk.com. The workflow checks Pages mode before deploying; the existing branch deployment remains untouched until switched. Pushes and a daily 10:17 UTC recovery run rebuild the latest main. There is no paid API, secret or Mac dependency.

## Local Mac preview
Clone this repository, install Python 3.11, FFmpeg and espeak-ng (Homebrew: brew install python@3.11 ffmpeg espeak-ng), create a venv and install kokoro==0.9.4 soundfile==0.13.1 beautifulsoup4==4.13.4. Copy the site to a temporary directory with git archive HEAD and run python scripts/build_audio.py --site /path/to/site --cache /path/to/cache --limit 2 --require-audio. No changes to the live site.

## Failures
Individual generation failures are reported in /assets/audio/manifest.json and articles remain readable without a player. Preview requires success. Existing article HTML is never edited. Rollback: choose Deploy from a branch / main / root in Pages settings; the original site is intact. Audio generation is retried on each subsequent build. All MP3s are public editorial narration.
