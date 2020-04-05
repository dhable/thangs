#!/usr/bin/env bash

functions=(
  "create_game"
  "register_user_session"
  "start_round"
  "submit_answer"
  "end_round"
)

for i in "${functions[@]}"
do
  (cd $i && npm run-script package )
done