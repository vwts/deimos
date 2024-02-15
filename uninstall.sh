#!/bin/sh

# desinstalador super simples.
#
# caso não funcione com você, ou não esteja no linux, apenas
# - manualmente delete a pasta app da sua pasta do discord (dentro de resources)

set -e

dicksword="$(dirname "$(readlink "$(which discord)")")"
rm -r --interactive=never "${dicksword:?não é possível encontrar discord}/resources/app"