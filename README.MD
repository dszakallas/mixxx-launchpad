# Launchpad

## Technical details

### Scripts

The code is written according to the [ES2015] specification. This is
incompatible with the runtime running in Mixxx so it has to be transpiled back
to ES5, which is done with [Babel] using the es2015 preset. This transpiled code
is then bundled with [browserify] into a so called [standalone] module with the
name `NovationLaunchpad`. Due to the lack of module loading system in the run
environment, the bundled code will be placed on the global object with the above
name.

### Controller mapping

The controller mapping is generated from a [template][mapping-template] with
[ejs]. The mapping reuses config from the package description and [buttons.js].

### Build

### Known Issues

#### Build only works on Mac OS X
I have a Mac OS X system, and I didn't port it to Windows or Linux yet.

#### Source and build file paths cannot contain spaces
The build files were written with this limitation.

#### Default import/export

ES2015 default imports/exports don't work in Mixxx. They are transpiled into a property
on the module with the name `default` which the parser rejects.

#### `for of` loops

similar parsing issues, this time with the `return` property.



[ES2015]:https://github.com/lukehoban/es6features#readme
[Babel]:https://babeljs.io/
[browserify]:http://browserify.org/
[standalone]:https://github.com/substack/node-browserify#usage
[mapping-template]:src/Launchpad/Launchpad.midi.xml.ejs
[ejs]:http://ejs.co/
[buttons.js]:src/Launchpad/buttons.js
