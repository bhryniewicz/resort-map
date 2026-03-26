#!/usr/bin/env bash
while [[ $# -gt 0 ]]; do
  case "$1" in
    --map) export MAP_PATH="$2"; shift 2 ;;
    --bookings) export BOOKINGS_PATH="$2"; shift 2 ;;
    *) shift ;;
  esac
done

node --experimental-strip-types scripts/validate-user-files.ts && exec npx next dev
