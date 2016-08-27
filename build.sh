#! /bin/bash

# shh, shellcheck
# shellcheck disable=2002

# this cat is useful, as <bundle.js doesn't redirect properly in an execution context as far as pbcopy is concerned.
# it probably should, but it's fine.

./compile.sh &&
cat bundle.js | pbcopy &&
# open "https://zapier.com/developer/builder/app/44896/scripting"
echo 'Done!'
