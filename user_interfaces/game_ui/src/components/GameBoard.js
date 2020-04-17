import React from 'react';
import styled from 'styled-components';
import {Paper, List, ListItem, ListItemText, ListItemAvatar, Typography, Button,
        Card, CardContent, LinearProgress, Divider} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';


const
    GameContainer = styled.div`
        padding: 0 2em 2em 2em;
    `,
    Question = styled(Paper)`
        padding: 1em;
    `,
    QuestionText = styled.div`
        padding: 1em;
    `,
    AnswerContainer = styled.div`
        margin: 1em 0;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
    `,
    AnswerCard = styled(Card)`
        flex-grow: 1;
        flex-shrink: 2;
        margin: 1em;
    `,
    ProgressContainer = styled.div`
        margin: 0.5em 0 0 0;
        display: flex;
        flex-direction: row;
        align-items: baseline;
    `,
    ProgressText = styled.div`
    `,
    ProgressSpanner = styled.div`
        flex-grow: 1;
    `;

function CurrentQuestionDisplay(props) {
    return (
        <Question>
            <QuestionText>
                <Typography variant="h5">
                    Things that make you go mmmmmm
                </Typography>
            </QuestionText>
            <Divider />
            <ProgressContainer>
                <ProgressText>
                    <Typography variant="body2">
                        Answers Received: 4 / 8
                    </Typography>
                </ProgressText>
                <ProgressSpanner/>
                <Button variant="contained">
                    Reveal Answers
                </Button>
            </ProgressContainer>

        </Question>
    );
}

function Answer(props) {
    const {value} = props;

    return (
        <AnswerCard>
            <CardContent>
                <Typography> {value} </Typography>
            </CardContent>
        </AnswerCard>
    );
}

function GameBoard() {
    const answers = ["Your Mom", "My Mom", "Any Mom (MILF)"]

    const answerElements = [];
    answers.forEach(a => {
        answerElements.push(
            <Answer value={a} />
        );
    });

    return (
        <GameContainer>
            <CurrentQuestionDisplay />
            <AnswerContainer>
               {answerElements}
            </AnswerContainer>
        </GameContainer>
    );
}

export default GameBoard;