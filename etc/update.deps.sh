#!/usr/bin/env bash

# get list of packages managed by rush
packages=$(rush list -p --json | sed 's|@my-app/||g' | jq -r '. | .projects[] | .name + " " + .path + "/"')

# check for updates, and upgrade if requested
echo "${packages}" | awk '{print $2 "package.json"}' | xargs -n 1 -x ncu "${@}" --packageFile

# if we upgraded our package.json files, then update the template files as well
if printf '%s\n' "$@" | grep -q -E '^-u$|^--upgrade$'; then
  echo "upgrading template package-*.json files"

  REFERENCE_FILES=(packages/services/service-sql/package.json packages/services/service-mongo/package.json packages/api/authz/package.json)
  TEMPLATE_FILES=(etc/service.template/template/package-service.json etc/service.template/template/package-service.json etc/service.template/template/package-service.json etc/service.template/template/package-api.json)

  for i in ${!REFERENCE_FILES[@]}; do
    echo "updating ${TEMPLATE_FILES[$i]} using ${REFERENCE_FILES[$i]} as reference"

    REFERENCE_PACKAGE_JSON=${REFERENCE_FILES[$i]}
    TEMPLATE_PACKAGE_JSON=${TEMPLATE_FILES[$i]}

    # get a list of dependencies and devdependencies along with their versions
    cat $REFERENCE_PACKAGE_JSON \
    | jq '.devDependencies, .dependencies' \
    | sed -E -e '/\{|\}/d' \
    | while IFS='' read dep
      do 
        depName=$(echo $dep | awk -F: '{print $1}' | sed 's/"//g')
        depVersion=$(echo $dep | awk -F: '{print $2}' | sed 's/^ *//g' | sed 's/"//g' | sed 's/\(.*\),/\1/')
        if [[ "$depName" != *"my-app"* ]]; then
          cat $TEMPLATE_PACKAGE_JSON | sed "s|\"$depName\": *\"[^,]*|\"$depName\": \"$depVersion\"|" > tmp.json
          mv tmp.json $TEMPLATE_PACKAGE_JSON
        fi
      done
  done

  # update package cache
  rm -f common/config/rush/pnpm-lock.yaml
  rush update --purge

  # check for dependency mismatches
  rush check
fi