# companion-module-eventapps-cueplayer

A [Bitfocus Companion](https://bitfocus.io/companion) module for **CuePlayer**
(EventApps) — control cue playback and jingles from a Stream Deck over
CuePlayer's built-in HTTP API.

## Setup

1. In CuePlayer: **Settings → Remote control** → enable it (note the port,
   default `8770`). If you turned on **Require token**, copy the token.
2. In Companion: add the **EventApps: CuePlayer** connection and fill in the
   CuePlayer machine's IP, the port, and the token (leave blank if not required).

## What it does

- **Actions**: GO / STOP / PANIC / cycle mode, master volume, switch page,
  play a cue by name, toggle Repeat all / Auto move next / Ducking, and
  jingle play / stop / toggle / stop-all.
- **Dropdowns** show the cue and jingle **names** (the UUID is hidden) and
  refresh automatically when the list changes in CuePlayer.
- **Feedbacks**: highlight the playing cue / jingle, show a green background
  when Repeat all / Auto move next / Ducking is ON, and colour the countdown
  text **amber under 20 s / red under 10 s** (thresholds configurable).
- **Variables**: connection, mode, master dB, current cue name/elapsed/remaining,
  and per-jingle name / remaining / playing.
- **Presets**: ready-made buttons for GO, STOP, PANIC, STOP ALL, page switch,
  the now-playing countdown, Repeat all / Auto move next / Ducking toggles,
  plus one toggle button per jingle with its live countdown, and one play
  button per cue.

## Build

This module uses Yarn 4 (via Corepack) and Node 22.

```
corepack enable
yarn install
yarn build          # -> dist/main.js
yarn lint
```

Load it in Companion via **Developer modules path** pointed at the folder that
contains this one.

## Protocol

Plain HTTP against CuePlayer: `GET /state` for feedback (polled), and
`GET /go`, `/stop`, `/panic`, `/mode`, `/master?db=`, `/page?to=`,
`/cue/go?id=`, `/jingle/toggle|play|stop?id=`, `/jingle/stopall` for commands.
The optional token is sent as the `X-Auth-Token` header.
