{ pkgs, lib, config, inputs, ... }:

{
  packages = with pkgs; [ fswatch jq gnumake ];

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
  pre-commit.hooks.eslint = {
    enable = true;
    entry = "bunx eslint";
    files = "\\.(ts|js)$";
  };
  pre-commit.hooks.prettier = {
    enable = true;
    entry = "bunx prettier -w";
    files = "\\.(ts|js|json|ya?ml|md)$";
  };

  # See full reference at https://devenv.sh/reference/options/
}
