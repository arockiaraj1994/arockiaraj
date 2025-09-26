# Default: show available commands
default:
    @just --list

# Init the repo
start:
    git pull
    git checkout dev
    

# Build the Hugo site
build:
    hugo

# Serve the site locally (with drafts, live reload)
run:
    hugo server -D 

# Changes
changes:
    git status

# Git add, commit, and push
# Usage: just push "your commit message"
push msg:
    git add .
    git commit -m "{{msg}}"
    git push
