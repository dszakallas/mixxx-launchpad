{
  pkgs,
  lib,
  config,
  inputs,
  ...
}:

{
  packages = with pkgs; [
    fswatch
    jq
    gnumake
  ];

  languages.javascript = {
    enable = true;

    bun = {
      enable = true;
      package = pkgs.bun;
      install = {
        enable = true;
      };
    };
  };

  # https://devenv.sh/pre-commit-hooks/
  git-hooks.hooks.eslint = {
    enable = true;
    entry = "bunx eslint";
    files = "\\.(ts|js)$";
  };
  git-hooks.hooks.prettier = {
    enable = true;
    entry = "bunx prettier -w";
    files = "\\.(ts|js|json5?|ya?ml|md)$";
  };
}
