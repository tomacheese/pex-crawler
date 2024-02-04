#!/bin/sh

while :
do
  pnpm start

  # wait 5 minutes before restarting
  echo "Waiting 5 minutes before restarting..."
  sleep 300
done
