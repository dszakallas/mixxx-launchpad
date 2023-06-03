SHELL := $(shell which bash) -O globstar -O extglob -c

empty :=
space := $(empty) $(empty)

join-with = $(subst $(space),$1,$(strip $2))

device = $(call join-with,\ ,$(shell jq -r .device packages/$(1)/controller.json))
manufacturer = $(call join-with,\ ,$(shell jq -r .manufacturer packages/$(1)/controller.json))
path = "src"
mapping = $(builddir)/$(call manufacturer,$(1))\ $(call device,$(1)).midi.xml
script = $(builddir)/$(call manufacturer,$(1))-$(call device,$(1))-scripts.js

arch := $(shell uname)

# List the default Resource directories of Mixxx on different architectures
installDirDarwin := $(HOME)/Library/Containers/org.mixxx.mixxx/Data/Library/Application Support/Mixxx
installDirLinux := $(HOME)/.mixxx

installDir ?= $(installDir$(arch))

package := ./package.json
builddir ?= ./dist
version ?= $(shell jq -r .version package.json)

scriptFiles = $(shell find . -name 'controller.json' -or -name '*.ts' -not -path "*/dist/*" -not -path "*/node_modules/*")
mappingFiles = $(package) packages/$(1)/controller.json scripts/template.xml.ejs

targets := $(shell jq -r '.controllers | join (" ")' package.json)

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
$(builddir)/mixxx-launchpad-$(version).zip : $(foreach target,$(1),$(call mapping,$(target)) $(call script,$(target))) | $(builddir)
	zip -j -9 $$@ $(foreach target,$(1),$(call mapping,$(target)) $(call script,$(target)))
endef

default : compile
.PHONY : default

$(builddir):
	mkdir -p $@

$(foreach target,$(targets),$(eval $(call targetScriptRules,$(target))))
$(foreach target,$(targets),$(eval $(call targetMappingRules,$(target))))
$(eval $(call compileRule,$(targets)))
$(eval $(call installRule,$(targets)))
$(eval $(call releaseRule,$(targets)))

release : $(builddir)/mixxx-launchpad-$(version).zip
.PHONY : release

test :
	npm run lint
	npm run check
.PHONY : test

watch_install :
	@echo Stop watching with Ctrl-C
	@sleep 1 # Wait a bit so users can read
	@$(MAKE) install
	@trap exit SIGINT; fswatch -o $(scriptFiles) $(mappingFiles) | while read; do $(MAKE) install; done
.PHONY : watch_install

watch :
	@echo Stop watching with Ctrl-C
	@sleep 1 # Wait a bit so users can read
	@$(MAKE)
	@trap exit SIGINT; fswatch -o $(scriptFiles) $(mappingFiles) | while read; do $(MAKE); done
.PHONY : watch

clean :
	rm -rf $(builddir) tmp
.PHONY : clean
