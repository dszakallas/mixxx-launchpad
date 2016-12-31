# Mixxx mapping for Novation Launchpad

## Quick start

- Download the [latest release](https://github.com/szdavid92/mixxx-launchpad/releases/latest).

- Follow the [instructions in the Mixxx User Manual](https://www.mixxx.org/manual/latest/chapters/controlling_mixxx.html#installing-a-preset-from-the-forum) to install the preset.



## User guide

### Deck layouts

#### GRAND

![grand](docs/lp-mki-grand.png)

### Deck controls

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
  - if deck is synced (follower or master) it becomes  not synced
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

 - **normal**: nudges (temporarily alters pitch) in direction by primary value. See *Preferences > Interface > Temporary Speed Adjustment Buttons > Left click*
 - **ctrl**: permanently changes pitch in direction by primary value. See *Preferences > Interface > Permanent Speed Adjustment Buttons > Left click*
 - **shift**: nudges (temporarily alters pitch) in direction by secondary value. See *Preferences > Interface > Temporary Speed Adjustment Buttons > Right click*
 - **ctrl+shift**: permanently changes pitch in direction by secondary value. See *Preferences > Interface > Permanent Speed Adjustment Buttons > Right click*
 - **normal (both buttons simultaneously)**: reset pitch to original value

Feedback

  - **bright yellow**: while nudging with primary speed
  - **dim yellow**: while nudging with secondary speed
  - **bright red**: while permanently changing pitch with primary speed
  - **dim red**: while permanently changing pitch with primary speed
  - **dim amber**: while not pressing, and pitch has been altered in that direction

#### CUE

Controls

- **normal**: behaves like the default cue method set in *Preferences > Interface > Cue mode*
- **ctrl**: sets cue at cursor

Feedback

- **bright red**: display dictated by your Cue mode

#### TAP

tap tempo for playback or beatgrid.

- **normal**: tapping adjusts song playback tempo. You should have correctly detected BPM and beatgrid.

- **ctrl**: ~~instead of altering the playback tempo, tapping adjusts the beatgrid.~~ Not implemented. *Why?*
- **shift**: sets the gridlines so the nearest beat aligns to current play position
- **ctrl+shift**: second button: sets the gridlines so the nearest beat lines up with the other track's nearest beat

Feedback

- **bright red**: flashes up on gridline

#### GRID MANIPULATORS

2 controls for

- **normal**: translating the grid backwards / forwards
- **ctrl**: scaling the grid up (slower) / down (faster).

#### PFL

- **normal**: toggle pre-fade listening (headphone)

Feedback:

- **bright green**: PFL on
- **blank**: PFL off

#### QUANTIZE

- **normal**: toggle quantization (magnet)

Feedback:

- **bright orange**: quantization on
- **blank**: quantization off

#### KEY SHIFTS

Buttons for temporarily raising/lowering pitch, bound left to right, bottom to top. They are
glowing in low amber. While pressed, they modify the key of
the track. When pressing multiple, the one later pressed *steals* the modification.

#### LOAD/EJECT

- **normal**: load the selected library track on deck. To prevent accidentally hitting, only works when the deck is empty.
- **ctrl**: load the selected library track on deck. Works when the deck is not playing.
- **shift**: eject deck. Works when the deck is not playing.

Feedback:

- **dim red**: deck loaded, playing
- **dim amber**: deck loaded, not playing
- **dim green**: deck empty

#### KEY

- **normal**: toggles keylock
- **ctrl**: lowers key by semitone
- **shift**: raises key by semitone

Feedback:

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

- **bright yellow**: hotcue enabled
- **blank**: hotcue disabled

#### BEATJUMPS

Controls for jumping backward (lower lane) and forward (upper lane).
Supports two modes:
 - the normal mode is represented with bright color. Jumping works as you would expect.
 - the rebouncing mode is shown with dim color. It jumps on attack, then jumps back on release. Jumping legato works and uses the same stealing algorithm as key shifting.

You can change modes by pressing **ctrl+shift+[any beatjump key]**.

There are two sets of jumps, shown in `green` and `yellow` correspondingly.
You can change to the first set by pressing **ctrl+[any beatjump key]**, to the second set by pressing **shift+[any beatjump key]**.

### BEATLOOPS

Controls for setting beatloops.

Controls

- **normal**: toggles beatloop

Feedback

- **bright red**: beatloop enabled
- **dim red**: beatloop disabled


## Technical details

### JavaScript

The code is written according to the [ES2015] specification. This is
incompatible with the runtime running in Mixxx so it has to be transpiled back
to ES5, which is done with [Babel] using the es2015 preset. Sadly due to the interpreter's only partial compatibility with the standard [even some ES3 transforms have to be enabled](bad-interpreter). The transpiled code
is then bundled with [browserify] into a so called [standalone] module with the
name `NovationLaunchpad`. Due to the lack of module loading system in the
environment, the bundled code is placed on the global object with the above
name. This works, because the same name is specified in the MIDI mapping XML file, so Mixxx will look for this name, and will call its `init` method upon loading.

### MIDI mapping

The controller mapping is generated from a [template][mapping-template] with
[ejs]. The mapping reuses config from the package description and [buttons.js].

### Build

To compile the sources and install the artifacts into Mixxx simply run

```
make install
```

If you only want to compile the sources, run

```
make compile
```

### Known Issues

#### Build only works on Mac OS X
I have a Mac OS X system, and I didn't port it to Windows or Linux yet.

#### Source and build file paths cannot contain spaces
The build files were written with this limitation.

#### Lingering ES3 future reserved keywords

Due to parser discrepancies, ES3 keywords and future reserved words that have been removed from ES5 cannot be used as *(1) identifiers*, *(2) property literals* and *(3) member expression literals*. In ES5 you can use keywords and future reserved words in the last two cases.
We have [transforms](.babelrc) for these two cases, however you still **can't use ES3 keywords and future reserved words as identifiers**, even if some of the latter was removed from ES5, for example `public`, `private` or `final`.


[ES2015]:https://github.com/lukehoban/es6features#readme
[Babel]:https://babeljs.io/
[browserify]:http://browserify.org/
[standalone]:https://github.com/substack/node-browserify#usage
[mapping-template]:src/Launchpad/Launchpad.midi.xml.ejs
[ejs]:http://ejs.co/
[buttons.js]:src/Launchpad/buttons.js
