# Releases

## v1.4 (2024-09-15)

New features:

- News: Show diff from last report in "World's Largest Economies" (Stats window only)
- Events: add new type for the new "Experience" events

# How to release (for the developer only)

Update the version in `manifest.json` and commit the change.

## On mac
Using default Right-click "Compress" will yield in a "invalid zip file" error.
Instead, use the command `zip -r dist.zip *` in the `dist` folder.
