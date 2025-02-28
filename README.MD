# mixxx-launch

Flexible and customizable controller mapping for Novation Launch[Pad|Control] family of controllers.

[![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/dszakallas/mixxx-launchpad)](https://github.com/dszakallas/mixxx-launchpad/releases/latest) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/dszakallas/mixxx-launchpad/Test%20&%20Release) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) ![License](https://img.shields.io/github/license/dszakallas/mixxx-launchpad)

## Features

- map up to 4 channels (decks or samplers) on a single Launchpad at the same time
- utilize presets of multiple sizes and features, change between them during performance
- 6 presets in 3 sizes
- create your own presets with ease
- rich arsenal of controls
  - play, cue, hotcues
  - loop controls, beatloop, beatjump
  - sync/master, tap, pitch shift
  - custom controls like bouncy jumps
- only trigger-like controls supported - no clumsy mixers and faders
- library navigation

## Supported controllers

- Launchpad Mini Mk3
- Launchpad X
- Launchpad Mk2
- Launchpad Mk1
- LaunchControl XL MK2 (experimental)

## Controller setup instructions

### LaunchControl XL MK2

Support is experimental, under active development and any existing mapping may change in future versions. Feedback
and PRs are welcome.

## How to get started

💾 [Download the latest release](https://github.com/szdavid92/mixxx-launchpad/releases/latest).

🛠 Alternatively, see [Building from source](#building-from-source) the build it from source.

📘 Follow the [instructions in the Mixxx User Manual](https://www.mixxx.org/manual/latest/chapters/controlling_mixxx.html#installing-a-preset-from-the-forum) to install the preset.

## User guide

### Global controls

Global controls consist of **Deck selectors**, **Library controls** and
**Modifier keys**.

**Deck selectors** are located on the top bar. They are used to select decks and
samplers to be laid out on the main grid. _D1-D4_ are mapped to corresponding
_decks_, _S1-S4_ to _samplers_.

**Library controls** are located on the sidebar to the right. They occupy the
upper 6 buttons. Their functions from top to bottom:

- up in the library sidebar
- down in the library sidebar
- expand/close selected library sidebar entry
- up a track
- down a track
- maximize/restore library

> Note: The up/down controls are autoscrolled. If you hold them down for longer,
> the scrolling activates. This comes in handy when navigating lengthy playlists.

![layout](docs/lp-mki-layout.png)

**Modifier keys** are located on the lower 2 buttons of the sidebar, and used
for the same purpose as you would expect on a computer keyboard.

The figures show Shift in **bold**, Ctrl in _italic_, Ctrl+Shift
in **_bold italic_**.

> Note: For some controls the modifier keys will act like toggles, but the modifier keys themselves are never toggled globally.

### Using the deck selectors

The deck selector is an essential feature of this Launchpad mapping. With it you
can map multiple presets in multiple layouts on the main grid. The main grid is
the inner 8x8 grid on the Launchpad. You have to memorize the layout patterns,
but don't worry, there are only 4 of them.

To select a single channel, simply press the button corresponding to the
channel. This will remove all existing selections, and find the largest default
preset that can be fit on the main grid.

Presets come in 3 different sizes: _short_ (4x4), _tall_ (4x8) and _grande_
(8x8)<sup>1</sup>. Multiple presets can have the same size, but only one preset
can be default per size.

To select multiple channels to be laid out, press the corresponding buttons
in a _chord_. This way you can select to 4 channels.

So what is a chord? In a chord you press buttons so you only release the first
after you pressed the last one. The order of presses matter, however the order
of releases does not. Now, instead of writing down how the exact layout
algorithm works, I just show you the four different layouts that is generated
for 1 (single channel), 2, 3 and 4 note chords. Once more the algorithm will
fill out the spaces with the largest default preset.

| ![1] | ![2] |
| ---- | ---- |
| ![3] | ![4] |

[1]: docs/lp-1.png
[2]: docs/lp-2.png
[3]: docs/lp-3.png
[4]: docs/lp-4.png

This means that e.g. if you press down D3-D2-S1 in this chord sequence,

- D3 will be mapped to block 1 with the default tall preset,
- D2 will be mapped to block 2 with the default short preset and
- S1 will be mapped to block 3 with the default short preset.

After a channel has been laid out you can cycle between all the presets that can
fit into its space. This won't reflow the layout, even if you end up using a
smaller preset. To cycle between presets

- press Ctrl + Channel Selector to cycle forward,
- press Shift + Channel Selector to cycle backward or
- press Ctrl + Shift + Channel Selector to revert to default.

The cycling order is the following:

- primary: large to small
- secondary: default then all others in fixed but not specified order.

The presets featured out of the box:

|        | default (0)                                        | (1)                                                                                           |
| ------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| grande | ![grande] **GRANDE** is the default grande layout. | **SAMPLER8X8** is a (8x8) grid of samplers assigned statically from [Sampler1] to [Sampler64] |
| tall   | ![tall] **TALL** is the default tall layout.       | ![juggler] **JUGGLER** is a tall layout optimized for beat jumping.                           |
| short  | ![short] **SHORT** is the default short layout.    | ![sampler] **SAMPLER** is an all-cue short layout for samplers.                               |

[grande]: docs/lp-mki-grande.png
[tall]: docs/lp-mki-tall.png
[juggler]: docs/lp-mki-juggler.png
[short]: docs/lp-mki-short.png
[sampler]: docs/lp-mki-sampler.png

<sup>1</sup> No identification with actual persons (living or deceased), places, buildings, and products is intended or should be inferred.

### Deck controls

These following controls are supported currently.

#### PLAY

Controls

- **normal**: toggles playing (if track is playable, starts playing; if track is playing, stops playing)
- **ctrl**: seeks to start of track
- **shift**: seeks to start of track and stops

Feedback

- **bright red**: track is playing
- **bright red blinking**: track is stopped, playable
- **blank**: track is stopped, not playable

#### SYNC / MASTER

Controls

- **normal**: toggles sync:
- if deck is synced (follower or master) it becomes not synced
- if track is not synced it becomes a sync follower
- **ctrl**: toggles master sync:
- if track is sync master, it becomes sync follower
- if track is not synced or sync follower, it becomes sync master

Feedback

- **bright red**: track is sync master
- **bright orange**: track is sync follower
- **blank**: track is not synced

#### NUDGE / PITCH

2 button for down/up.

Controls

- **normal**: nudges (temporarily alters pitch) in direction by primary value. See _Preferences > Interface > Temporary Speed Adjustment Buttons > Left click_
- **ctrl**: permanently changes pitch in direction by primary value. See _Preferences > Interface > Permanent Speed Adjustment Buttons > Left click_
- **shift**: nudges (temporarily alters pitch) in direction by secondary value. See _Preferences > Interface > Temporary Speed Adjustment Buttons > Right click_
- **ctrl+shift**: permanently changes pitch in direction by secondary value. See _Preferences > Interface > Permanent Speed Adjustment Buttons > Right click_
- **normal (both buttons simultaneously)**: reset pitch to original value

Feedback

- **bright yellow**: while nudging with primary speed
- **dim yellow**: while nudging with secondary speed
- **bright red**: while permanently changing pitch with primary speed
- **dim red**: while permanently changing pitch with secondary speed
- **dim orange**: while not pressing, and pitch has been altered in that direction

#### CUE

Controls

- **normal**: behaves like the default cue method set in _Preferences > Interface > Cue mode_
- **ctrl**: sets cue at cursor

Feedback

- **bright red**: display dictated by your Cue mode

#### TAP

tap tempo for playback or beatgrid.

- **normal**: tapping adjusts song playback tempo. You should have correctly detected BPM and beatgrid.

- **ctrl**: instead of altering the playback tempo, tapping adjusts the beatgrid.
- **shift**: sets the gridlines so the nearest beat aligns to current play position
- **ctrl+shift**: second button: sets the gridlines so the nearest beat lines up with the other track's nearest beat

Feedback

- **bright red**: flashes up on gridline

#### GRID MANIPULATORS

2 controls for

- **normal**: translating the grid backwards / forwards
- **ctrl**: scaling the grid up (slower) / down (faster).

#### PFL

Controls

- **normal**: toggle pre-fade listening (headphone)

Feedback

- **bright green**: PFL on
- **blank**: PFL off

#### QUANTIZE

Controls

- **normal**: toggle quantization (magnet)

Feedback

- **bright orange**: quantization on
- **blank**: quantization off

#### KEY SHIFTS

Buttons for temporarily chaning pitch, bound left to right, bottom to top. While pressed, they modify the key of
the track. When pressing multiple, the one later pressed _steals_ the modification.

#### LOAD/EJECT

Controls

- **normal**: load the selected library track on deck. To prevent accidentally hitting, only works when the deck is empty.
- **ctrl**: load the selected library track on deck. Works when the deck is not playing.
- **shift**: eject deck. Works when the deck is not playing.

Feedback

- **dim red**: deck loaded, playing
- **dim amber**: deck loaded, not playing
- **dim green**: deck empty

#### KEY

Controls

- **normal**: toggles keylock
- **ctrl**: lowers key by semitone
- **shift**: raises key by semitone

Feedback

- **hi red**: keylock on
- **blank**: keylock off

#### HOTCUES

Hotcues are bound from left to right, bottom to top.

Controls

- **normal**: activates the hotcue:
  - if the hotcue is set, seeks the player to hotcue's position.
  - if the hotcue is not set, sets the hotcue to the current play position
- **ctrl**:
  - if the hotcue is set, deletes the hotcue
  - if the hotcue is not set, sets the hotcue to the current play position

Feedback

- **hotcue assigned color (bright yellow on non-RGB controller)**: hotcue enabled
- **blank**: hotcue disabled

#### BEATJUMPS

_Changed in 3.0.0: changing between sets and modes works differently._

Controls for jumping backward (lower lane) and forward (upper lane).
Supports two modes:

- the **normal mode** is represented with bright color. Jumping works as you would expect.
- the **rebouncing mode** is shown with dim color. It jumps on attack, then jumps back on release. Jumping legato works and uses the same stealing algorithm as key shifting.

You can change modes by pressing **shift+[any beatjump key]**.

There are two sets of jumps, switchable with the `ctrl` key, and shown in different colors.

#### BEATLOOPS

Controls for setting beatloops.

Controls

- **normal**: toggles beatloop

Feedback

- **bright red**: beatloop enabled
- **dim red**: beatloop disabled

#### LOOP IN / out

controls

- **normal**: set loop in/out position
- **ctrl**: move loop in/out position backward by small amount
- **shift**: move loop in/out position forward by small amount

Note: you are able to move the whole loop forward/backward by pressing down in and out the same time, while applying the modifier.

#### LOOPJUMPS

_Changed in 3.0.0: changing between sets and modes works differently._

Almost the same as beatjumps, only instead of changing the current play position, they translate the position of the loop markers. As beatjumps, they support two modes and two sets. On how to use these, see [Beatjumps](#beatjumps)

#### HALVE / DOUBLE

They halve / double the current loop length, modifying the position of the end marker.

#### LOOPJUMP SMALL

They translate the loop markers by a small amount backward/forward.

Controls

- **normal**: translates loop backward/forward

#### LOOP

Works the same way as the LOOP button on the GUI, ie. it toggles the current loop on or off.

Controls

- **normal**: toggles loop on/off
- **ctrl**: activate loop, jump to its loop point and stop

Feedback

- **bright green**: loop on
- **dim green**: loop off

## Troubleshooting

### Launchpad Mini Mk3

Mini Mk3 has to be put in "Programmer" mode to get MIDI access to all 9x9 instead of only inner 8x8 in "Live" mode. Push and hold "Session" for about a second, "LED" screen shows up, then push "Stop Solo Mute" button, "Programmer" shows up.

This is now done automatically during script initialization, so you shouldn't have to worry about it.

## Building from source

The code is written in TypeScript, transpiled with [babel] and bundled into a single iife module with [rollup]. There are certain transforms and polyfills which are required to get it working with Mixxx's bundled interpreter.
The controller mapping is generated from this [template] with [ejs], using metadata about the controller placed in [`info.json`](./packages/launchpad-mk2/info.json).

### Compile

To build you need make, [`bun`](https://bun.sh/), bash (>=4.0) and `jq`. Watch tasks require `fswatch`.

The multi-project build is managed with npm workspaces. Clone the repo and
install the dependencies:

```shell
git clone https://github.com/dszakallas/mixxx-launchpad
cd mixxx-launchpad
bun install
```

To compile the sources run

```shell
make -j 4
```

(`-j 4` will enable 4 jobs to be executed in parallel which makes the build significantly faster)

Afterward the `dist` folder will contain the files that need to be
copied the Mixxx's controller folder.

To compile specific controllers, use the `targets` variable:

```shell
make -j 4 targets="launchpad-mk2 launchpad-mk1"
```

### Test

We utilize eslint, TypeScript typechecker and prettier to ensure some level of code safety and consistency.

You can run them individually with the following commands:

```shell
make check-eslint
make check-types
make check-format
```

To run them all:

```shell
make check-all
```

### Install

To install into the Mixxx resources folder, run

```shell
make -j 4 install installDir=$MIXXX_SETTINGS_DIR
```

where `$MIXXX_SETTINGS_DIR` is the [Mixxx settings directory](https://manual.mixxx.org/2.3/en/chapters/appendix/settings_directory.html#location) for your platform. The Makefile provides default values for macOS and Linux, so running

```shell
make -j 4 install
```

will work on these platforms if you didn't change the Mixxx default installation.

### Development loop

During development, it's desirable to reload the code into Mixxx on every change for a fast feedback loop.
Some tasks have watch counterparts making them rerun automatically on file changes:

```shell
make watch              # Recompile on changes
make watch_install      # Reinstall on changes
make watch_dev          # Run linter and typechecker on changes, then recompile if there were no errors
make watch_dev_install  # Run linter and typechecker on changes, then reinstall if there were no errors
```

I find the last one especially pleasant.

Tip: you can use the `targets` and `installDir` variables with these targets too.

### Contributing

The code should pass CI checks, which is equivalent to running

```shell
make check-all
```

[babel]: https://babeljs.io/
[rollup]: https://rollupjs.org
[standalone]: https://github.com/substack/node-browserify#usage
[template]: scripts/template.xml.ejs
[ejs]: http://ejs.co/
