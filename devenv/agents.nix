{
  pkgs,
  lib,
  inputs,
  bikeshed,
  ...
}:
{
  module =
    { config, ... }:
    let
      lib' = bikeshed.lib;
    in
    {
      imports = [
        inputs.bikeshed.devenvModules.agents
      ];

      agents = {
        skills = {
          enable = true;
          entries = {
            wshobson-js-ts-skills = lib'.agents.mkSkill pkgs {
              name = "wshobson-js-ts-skills";
              version = "2026-08-26";
              src = pkgs.fetchFromGitHub {
                owner = "wshobson";
                repo = "agents";
                rev = "38e19c20d2b154510b0e624a2e3e186b19b5c527";
                hash = "sha256-QiRuhAJflKylpj5UW8ySyUz29K3Y34Vx4sCMfGl23Bg=";
              };
              subDir = "plugins/javascript-typescript";
              include = [
                "modern-javascript-patterns"
                "typescript-advanced-types"
              ];
            };
          };
        };
      }
      // lib.genAttrs [ "vscode" "claude" "copilot" "gemini" "opencode" "codex" ] (_: {
        enable = true;
        linkSkills = true;
      });
    };
}
