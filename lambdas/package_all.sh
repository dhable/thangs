#!/usr/bin/env bash

functions=(
  "create_game"
  "invite_player"
  "start_round"
  "submit_answer"
  "end_round"
  "user_pad_connect"
)

for i in "${functions[@]}"
do
  (cd $i && npm run-script package )
done