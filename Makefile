ARCH := $(shell uname)
BUILD_DIR := dist
INSTALL := install_$(ARCH)

SCRIPTS = $(shell ./scripts/deps-scripts.js ./package.json ./src/index.js)

compile: $(BUILD_DIR)/Launchpad.midi.xml $(BUILD_DIR)/Launchpad.js

install: install_$(ARCH)

install_Darwin: $(BUILD_DIR)/Launchpad.midi.xml $(BUILD_DIR)/Launchpad.js
	cp $^ $(HOME)/Library/Application\ Support/Mixxx/controllers

$(BUILD_DIR)/Launchpad.midi.xml: ./src/Launchpad/buttons.js ./package.json ./src/Launchpad/Launchpad.midi.xml.ejs
	mkdir -p $(BUILD_DIR)
	./scripts/compile-mapping.js $^ $(BUILD_DIR)

$(BUILD_DIR)/Launchpad.js: ./package.json ./src/index.js $(SCRIPTS)
	mkdir -p $(BUILD_DIR)
	./scripts/compile-scripts.js ./package.json ./src/index.js $(BUILD_DIR)
