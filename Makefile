device = $(shell jq -r .buildTargets.$(1).device package.json)
manufacturer = $(shell jq -r .buildTargets.$(1).manufacturer package.json)
mapping = $(buildDir)/$(call manufacturer,$(1))-$(call device,$(1)).midi.xml
script = $(buildDir)/$(call manufacturer,$(1))-$(call device,$(1))-scripts.js

depGraph = $(shell ./scripts/deps-scripts.js $(1))

arch := $(shell uname)
package := ./package.json
buildDir := ./dist

targets := $(shell jq -r '.buildTargets | keys | join (" ")' package.json)

define targetScriptRules
$(call script,$(1)) : $(package) $(call depGraph,$(1))
	@./scripts/compile-scripts.js $(1) $$@
endef

define targetMappingRules
$(call mapping,$(1)) : $(package) packages/$(1)/buttons.js packages/$(1)/template.xml.ejs
	@./scripts/compile-mapping.js $(1) $$@
endef

define compileRule
compile : $(foreach target,$(1),$(call mapping,$(target)) $(call script,$(target)))
.DEFAULT : compile
.PHONY : compile
endef

define installRule
install: install_$(arch)
.PHONY : install

install_Darwin : $(foreach target,$(1),$(call mapping,$(target)) $(call script,$(target)))
	cp $$^ $$(HOME)/Library/Application\ Support/Mixxx/controllers
.PHONY : install_Darwin

# TODO write for Linux 

endef


$(foreach target,$(targets),$(eval $(call targetScriptRules,$(target))))
$(foreach target,$(targets),$(eval $(call targetMappingRules,$(target))))
$(eval $(call compileRule,$(targets)))
$(eval $(call installRule,$(targets)))

clean :
	@rm -rf dist
.PHONY : clean
