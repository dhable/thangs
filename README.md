# Thangs

A handmaid version 

## Lambda Functions

### create_game (done)

### register_user_session (done)

### start_round (done)

### submit_answer (done)

### end_round


Player UI Messages:
* register_user_session - Sent by player pad UI when link is opened to establish connection, need game id
* submit_answer - Sent by player pad UI when a user clicks the answer button


* lock_down_submit - Sent by server when the answer phase is entered, clears and locks UI


Org UI Message:
* create_game - Sent by Org UI when setting up a new game for use



* start_round - Sent by the Org UI when ready to start a round
* question - Sent by server with the question to use for the round

* end_round - Sent by the Org UI when ready to end the round and read questions
* answers - Send by the server with all of the available answers

* disconnect - remove player entry from the games record