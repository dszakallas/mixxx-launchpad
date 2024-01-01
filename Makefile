SHELL := $(shell which bash)

empty :=
space := $(empty) $(empty)

buildDir ?= ./dist

join-with = $(subst $(space),$1,$(strip $2))
device = $(call join-with,\ ,$(shell jq -r .device packages/$(1)/controller.json))
manufacturer = $(call join-with,\ ,$(shell jq -r .manufacturer packages/$(1)/controller.json))
path = "src"
mapping = $(buildDir)/$(call manufacturer,$(1))\ $(call device,$(1)).midi.xml
script = $(buildDir)/$(call manufacturer,$(1))-$(call device,$(1))-scripts.js

arch := $(shell uname)

installDirDarwin := $(HOME)/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx
installDirLinux := $(HOME)/.mixxx

# version specifies the version of the release
version ?= $(shell jq -r .version package.json)

# targets specifies the controllers to build. Default: all
targets ?= $(shell jq -r '.controllers | join (" ")' package.json)

# installDir specifies the installation directory
installDir ?= $(installDir$(arch))

package := ./package.json

scriptFiles = $(shell find . -name 'controller.json' -or -name '*.ts' -not -path "*/dist/*" -not -path "*/node_modules/*" -print | cut -d/ -f2- )
mappingFiles = $(package) packages/$(1)/controller.json scripts/template.xml.ejs

define targetScriptRules
$(call script,$(1)) : $(scriptFiles)
	./scripts/compile-scripts.js $(1) "$$@"
endef

define targetMappingRules
$(call mapping,$(1)) : $(mappingFiles)
	./scripts/compile-mapping.js $(1) "$$@"
endef

define compileRule
compile : $(foreach target,$(1),$(call mapping,$(target)) $(call script,$(target)))
.PHONY : compile
endef

define installRule
install : $(foreach target,$(1),$(call mapping,$(target)) $(call script,$(target)))
	cd "$$(installDir)" && mkdir -p controllers
	cp $(foreach target,$(1),$(call mapping,$(target)) $(call script,$(target))) "$$(installDir)/controllers"

.PHONY : install
endef

define releaseRule
$(buildDir)/mixxx-launchpad-$(version).zip : $(foreach target,$(1),$(call mapping,$(target)) $(call script,$(target))) | $(buildDir)
	zip -j -9 $$@ $(foreach target,$(1),$(call mapping,$(target)) $(call script,$(target)))
endef

default : compile
.PHONY : default

$(buildDir) :
	mkdir -p $@

$(foreach target,$(targets),$(eval $(call targetScriptRules,$(target))))
$(foreach target,$(targets),$(eval $(call targetMappingRules,$(target))))
$(eval $(call compileRule,$(targets)))
$(eval $(call installRule,$(targets)))
$(eval $(call releaseRule,$(targets)))

release : $(buildDir)/mixxx-launchpad-$(version).zip
.PHONY : release

check-eslint :
	npm run check-eslint
.PHONY : check-eslint

check-types :
	npm run check-types
.PHONY : check-types

check-format :
	npm run check-format
.PHONY : check-format

check-all : check-eslint check-types check-format
.PHONY : check-all

dev : check-eslint check-types
	@$(MAKE)
.PHONY : dev

dev_install : check-eslint check-types
	@$(MAKE) install
.PHONY : dev_install

watchables := compile dev install dev_install

define watchRule
watch_$(1) :
	@echo Stop watching with Ctrl-C
	@sleep 1 # Wait a bit so users can read
	@$(MAKE) $(1) || true
	@trap exit SIGINT; fswatch -o $(scriptFiles) $(mappingFiles) | while read; do $(MAKE) $(1); done
.PHONY : watch_$(1)
endef

$(foreach target,$(watchables),$(eval $(call watchRule,$(target))))

watch : watch_compile
.PHONY : watch

clean :
	rm -rf $(buildDir) tmp
.PHONY : clean
