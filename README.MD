# Mixxx mapping for Novation Launchpad

Author: midiparse

## User guide

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

Feedback

  - **bright yellow**: while nudging with primary speed
  - **low yellow**: while nudging with secondary speed
  - **bright red**: while permanently changing pitch with primary speed
  - **low red**: while permanently changing pitch with primary speed
  - **low amber**: while not pressing, and pitch has been altered in that direction

#### CUE

Controls

- **normal**: behaves like the default cue method set in *Preferences > Interface > Cue mode*
- **ctrl**: sets cue at cursor

Feedback

- **bright red**: display dictated by your Cue mode

#### HOTCUES

8 hotcues are bound to the buttons from left to right, bottom to top.

Controls

- **normal**: activates hotcue:
  - if hotcue is set, seeks the player to hotcue's position.
  - if hotcue is not set, sets hotcue to the current play position
- **ctrl**:
  - if hotcue is set, deletes hotcue
  - if hotcue is not set, sets hotcue to the current play position

Feedback

- **bright yellow**: hotcue enabled
- **blank**: hotcue disabled


## Technical details

### Scripts

The code is written according to the [ES2015] specification. This is
incompatible with the runtime running in Mixxx so it has to be transpiled back
to ES5, which is done with [Babel] using the es2015 preset. Sadly due to the interpreter's only partial compatibility with the standard [even some ES3 transforms have to be enabled](bad-interpreter). The transpiled code
is then bundled with [browserify] into a so called [standalone] module with the
name `NovationLaunchpad`. Due to the lack of module loading system in the run
environment, the bundled code will be placed on the global object with the above
name.

### Controller mapping

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
