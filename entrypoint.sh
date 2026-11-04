#!/bin/sh

while :
do
  pnpm start

  # 再起動前に 5 分待機する
  echo "Waiting 5 minutes before restarting..."
  sleep 300
done
