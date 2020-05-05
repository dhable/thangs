
## `create_game` (DONE)
Input: `{"type": "create_game", "tx": "..."}`
Does:
  - Generate new gameId hash
  - Creates GAMES entry in DynamoDB
Output: `{"type": "create_game", "tx": "...", "gameId": "..."}`

## `invite_player` (DONE)
Input: `{"type": "invite_player", "tx": "...", "gameId": "...", "txtNum": "...", "name": "..."}`
Does:
  - Generate playerId hash
  - Create INVITES record in DynamoDB
  - Sends txt msg to player with SNS
Output: `{"type": "invite_player", "tx": "...", "gameId": "...", "playerId": "..."}`

## `start_round` (DONE)
Input: `{"type": "start_round", "tx": "...", "gameId": "..."}`
Does:
  - Read list of already used questions from DDB
  - Pick new, unused question
  - Update DDB list of used questions
  - Clears DDB list of answers
  - Clears DDB lock flag
  - Send player devices unlock msg `{"type": "unlock", "tx": "..."}`
Output: `{"type": "start_round", "tx": "...", "gameId": "...", "q": "..."}`

## `submit_answer` (sorta DONE)
Input: `{"type": "submit_answer", "tx": "...", "playerId": "...", "answer": "..."}`
Does:
  - Look up gameId from DDB based on playerId
  - Update DDB list of answers
  - Send answer event to game host - `{"type": "answer_event", "tx": "...", "playerId": "..."}`
Output: N/A

## `end_round` (DONE)
Input: `{"type": "end_round", "tx": "...", "gameId": "..."}`
Does:
  - Send player devices lock msg `{"type": "lock", "tx": "..."}`
  - Sets DDB lock flag
  - Read list of answers
Output: `{"type": "end_round", "tx": "...", "gameId": "...", "answers": ["...", "...", ...]}`

## `user_pad_connect`
Input: `{"type": $connect}`
Does:
  - Updates playerId with active connId
Output: N/A