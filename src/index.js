import React from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import './index.css';

// DEBUG GLOBALS
const DICE_GENERATOR = function* () {yield 11; yield 50;}(); //Math.ceil(Math.random() * 6)
const PLAYER_A_LIVES = 5;
const PLAYER_A_COINS = 0;
const PLAYER_A_MAP_PIECES = 0;
const PLAYER_B_LIVES = 5;
const PLAYER_B_COINS = 0;
const PLAYER_B_MAP_PIECES = 0;

class Tile extends React.Component {

    render() {
        let backgroundImage = this.props.backgroundImage;
        let id = "tile" + this.props.number;
        let number = this.props.number;
        let chestImage = this.props.chestImage;
        return (
            <div
                id={id} className="tile"
                style={{
                    backgroundImage: 'url(./images/' + backgroundImage + ')'
                }}
            >
                <div
                    id={id + "A"}
                    className="playerSlot playerASlot"
                    style={ /*(this.props.occupiedByPlayerA) ?
                        {backgroundImage: 'url(./images/playerA.png)'} :
                        {}*/ {}
                    }
                >
                    <div
                        id={id + "B"}
                        className="playerSlot playerBSlot"
                        style={ /*(this.props.occupiedByPlayerB) ?
                            {backgroundImage: 'url(./images/playerB.png)'} :
                            {}*/ {}
                        }
                    >
                        <div
                            className="numberDiv"
                            style={{backgroundImage: 'url(./images/' + chestImage+ ')'}}
                        >
                            <span
                                className="numberSpan"
                            >
                                &nbsp;{number}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.normalTileImages = ['tile0.png', 'tile1.png', 'tile2.png'];
        this.normalTileImageIndexes = Array(this.props.numberOfTiles)
            .fill(0)
            .map(x => Math.floor(Math.random() * this.normalTileImages.length));


    }

    renderTile(number, chestColor=null) {
        let isTaskTile = (number in this.props.taskTiles);
        let isChestTile = (number in this.props.chestTiles);
        let backgroundImage;

        if (!isTaskTile) {
            backgroundImage = this.normalTileImages[this.normalTileImageIndexes[number - 1]];
        } else {
            backgroundImage = this.props.taskTiles[number].backgroundImage;
        }


        return (
            <Tile
                number={number}
                backgroundImage={backgroundImage}
                occupiedByPlayerA={this.props.playerATile === number}
                occupiedByPlayerB={this.props.playerBTile === number}
                chestImage={(isChestTile) ? this.props.chestTiles[number].chest.image : null}

            />
        );
    }

    render() {

        let tiles = [];
        for (let i = 1; i < (this.props.numberOfTiles + 1); i++) {
            tiles.push(this.renderTile(i));
        }

        return (
            <div id="boardTiles">
                {tiles}
            </div>
        );
    }

    componentDidMount() {
        document.getElementById("tile1A").style.backgroundImage = 'url("images/playerA.png")';
        if (this.props.numberOfPlayers === 2)
            document.getElementById("tile1B").style.backgroundImage = 'url("images/playerB.png")';
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.playerATile !== this.props.playerATile || prevProps.playerBTile !== this.props.playerBTile) {
            let character = (prevProps.playerATile !== this.props.playerATile) ? "A" : "B";
            let currentPos = prevProps["player" + character + "Tile"];
            await new Promise(resolve => setTimeout(resolve, 500));
            for (let i = 0; i < this.props.lastDiceValue; i++) {
                document.getElementById("tile" + currentPos + character).style.backgroundImage = null;
                currentPos = (currentPos >= this.props.numberOfTiles) ? 1 : (currentPos + 1);
                document.getElementById("tile" + currentPos + character).scrollIntoView(false);
                document.getElementById("tile" + currentPos + character).style.backgroundImage = 'url("images/player' + character + '.png")';
                await new Promise(resolve => setTimeout(resolve, 400));
            }
        }
    }

}

function PlayerInventory(props) {
    return (
        <ul
            id={"player" + props.char + "Inventory"}
            className="dropdown-menu"
            aria-labelledby={"navbarDropdown" + props.char}
            style={{maxWidth: "270px"}}
        >
            {/********************************************************************************************************/}
            {/* props.playerInventory tem a estrutura  {name: quantity,}.
             as suas entries [name, quantity] terão o nome nameQuantity */}
            {
                (Object.keys(props.playerInventory).length === 0) ?
                    ["Vazio!", "Os itens comprados na loja aparecerão aqui."].map(
                        (text, index) =>
                            <li className="inventoryItem" key={index}>{text}</li>
                    ) :
                    Object.entries(props.playerInventory).map(
                        (nameQuantity, index) =>
                            <li className="inventoryItem" href="#" key={index}>
                                <img src={"images/shop/" + props.shopInventory[nameQuantity[0]].image}/>
                                &nbsp;x&nbsp;{nameQuantity[1]}&nbsp;{nameQuantity[0]}
                            </li>
                    )
            }
            {/********************************************************************************************************/}
        </ul>
    );
}

class PlayerStatus extends React.Component {
    render() {
        let char = this.props.character;
        let playerChar = 'player' + char;

        let lives = Array(this.props.lives)
            .fill(null)
            .map((_) => <img src="images/life.png" alt="life" height="32px"  className="playerStatusIcon"/>);

        return (
            <nav
                id={playerChar + "Status"}
                className={"navbar navbar-expand-lg navbar-dark playerStatus " +
                ((char === "A") ? "bg-danger " : "bg-primary ") +
                ((this.props.belongsToCurrentPlayer) ? "d-table-cell" : "d-none d-lg-table-cell")}

            >
                <h2 className="text-center text-white">{this.props.name}</h2>
                <ul className="d-inline-flex m-auto p-0 text-nowrap">
                    <li className="nav-item d-none d-md-block d-lg-block" key="lives">
                        <a id={playerChar + "Lives"}
                           className="nav-link active"
                           aria-current="page"
                           href="#"
                        >
                            <div>
                                {lives}
                            </div>

                        </a>
                    </li>

                    <li className="nav-item d-block d-block d-md-none d-lg-none" key="lives">
                        <a id={playerChar + "Lives"}
                           className="nav-link active"
                           aria-current="page"
                           href="#"
                        >
                            <div>
                                <img src="images/life.png" alt="life" height="32px"  className="playerStatusIcon"/>
                                &nbsp;x&nbsp;{this.props.lives}
                            </div>

                        </a>
                    </li>

                    <li className="nav-item dropdown d-block" key="inventory">
                        <a
                            className="nav-link dropdown-toggle"
                            href="#"
                            id={"navbarDropdown" + char}
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <img src="images/bag.png" className="playerStatusIcon"/>
                        </a>
                        <PlayerInventory
                            char={char}
                            playerInventory={this.props.playerInventory}
                            shopInventory={this.props.shopInventory}
                        />
                    </li>

                    <li className="nav-item d-block" key="coins">
                        <a
                            className="nav-link"
                            href="#">
                            <img src="images/coin.png" alt="coins" className="playerStatusIcon"/> &nbsp; x &nbsp;
                            <span id={playerChar + "Coins"}>
                                            {this.props.coins}
                                        </span>
                        </a>
                    </li>

                    <li className="nav-item d-block" key="mapPieces">
                        <a
                            className="nav-link"
                            href="#"
                        >
                            <img src="images/map_icon.png" className="playerStatusIcon"/>
                            &nbsp; x &nbsp;
                            <span id={playerChar + "Map"}>
                                            {this.props.mapPieces}
                                        </span>
                        </a>
                    </li>
                </ul>
        </nav>

        );
    }
}

function PlayerStatuses(props) {

    let playerA = props.players.A;
    let playerB = props.players.B;

    return (
        <div id="playerStatuses">
            <div id="playerStatusesRow">
                <PlayerStatus
                    character="A"
                    name={playerA.name}
                    lives={playerA.lives}
                    coins={playerA.coins}
                    mapPieces={playerA.mapPieces}
                    playerInventory={playerA.inventory}
                    shopInventory={props.shopInventory}
                    belongsToCurrentPlayer={props.currentPlayer === "A"}
                />
                {(props.numberOfPlayers === 2) ?
                    <PlayerStatus
                        character="B"
                        name={playerB.name}
                        lives={playerB.lives}
                        coins={playerB.coins}
                        mapPieces={playerB.mapPieces}
                        playerInventory={playerB.inventory}
                        shopInventory={props.shopInventory}
                        belongsToCurrentPlayer={props.currentPlayer === "B"}
                    />
                    :
                    null
                }
            </div>
        </div>
    )
}

class GameWizard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentStep: 1,
        };

    }

    finish() {
        this.props.onFinish();
        this.setState({currentStep: 1})
    }

    async onDiceThrow(diceValue) {
        this.props.onDiceThrow(diceValue);
        await new Promise(resolve => setTimeout(resolve, 500 + diceValue * 400));
        this.setState({currentStep: "question"});
    }

    onAnswerSelection(reward) {
        this.props.onAnswerSelection(reward);
    }

    onAnswerFeedbackExit() {
        this.setState({currentStep: 4});
    }

    onShopExit() {
        if (this.props.currentPlayer.task.valueOf()) {
            this.setState({currentStep: 5});

        } else {
            this.finish()
        }
    }

    onTaskCompletion() {
        this.props.onTaskCompletion();
        if (this.props.currentPlayer.chest && !this.props.currentPlayer.chest.opened) {
            this.setState({currentStep: 6});

        } else {
            this.finish()
        }
    }

    onChestCompletion(skipped, hasNecessaryItems) {
        if (!skipped)
            this.props.onChestCompletion(hasNecessaryItems);
        this.finish();
    }

    render() {
        let bgClass = (this.props.currentPlayer.char === "A") ? "bg-danger" : "bg-primary";
        if (this.props.loser)
            bgClass = {
                "B": "bg-danger",
                "A": (this.props.numberOfPlayers === 2) ? "bg-primary" : "bg-danger"
            }[this.props.loser.character];

        if (this.props.loser && this.state.currentStep !== -1) this.setState({currentStep: -1});
        let componentToRender;
        switch (this.state.currentStep) {
            case -1:
                componentToRender =
                    <div id="gameSummaryDiv">
                        {(this.props.numberOfPlayers === 2 || this.props.loser.character === "B") ?
                            <div>
                                <img src={`/images/winner${this.props.loser.opponent.character}.png`} draggable="false" alt="vencedor"/>
                                <h1>{this.props.loser.opponent.name} ganhou!</h1>
                                <h2>Parabéns!</h2>
                            </div>
                            :
                            <div>
                                <img src={`/images/loserA.png`} draggable="false" alt="perdedor"/>
                                <h1>Perdeu o jogo!</h1>
                            </div>
                        }
                    </div>;
                break;

            case 1:
                componentToRender =
                    <Dice
                        currentPlayerName={this.props.currentPlayer.name}
                        onThrow={(diceValue) => this.onDiceThrow(diceValue)}
                    />;
                break;

            case "question":
                componentToRender =
                    <QuestionWizard
                        onAnswerSelection={(reward) => this.onAnswerSelection(reward)}
                        onAnswerFeedbackExit={() => this.onAnswerFeedbackExit()}
                    />;
                break;

            case 4:
                componentToRender =
                    <Shop
                        onItemSale={(itemName, itemPrice) => this.props.onItemSale(itemName, itemPrice)}
                        inventory={this.props.shopInventory}
                        currentPlayerCoins={this.props.currentPlayer.coins}
                        onExit={() => this.onShopExit()}
                    />;
                break;

            case 5:
                componentToRender =
                    <Task
                        conditionsForCompletion={{
                            canCompleteTask: this.props.currentPlayer.task.canCompleteTask,
                            hasNecessaryItem: this.props.currentPlayer.task.hasNecessaryItem
                        }}
                        details={this.props.currentPlayer.task}
                        onCompletion={() => this.onTaskCompletion()}
                    />;
                break;

            case 6:
                componentToRender =
                    <Chest
                        details={this.props.currentPlayer.chest}
                        keys={this.props.currentPlayer.keys}
                        onKeySelection={(keyName) => this.props.onChestKeySelection(keyName)}
                        onCompletion={(skipped, hasHazardItems) => this.onChestCompletion(skipped, hasHazardItems)}
                    />;
                break;

                default:
                componentToRender = null;
        }
        return (
            <Draggable
                bounds={"parent"}
            >
                <div
                    id="footer"
                    className={`d-flex flex-column ${bgClass}`}
                >
                    {/*<img id="logoSmall" src="images/logo_horizontal.png" height="70px"/>*/}
                    {componentToRender}

                    <Help
                        buttonId="wizardHelpButton"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                             className="bi bi-question-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                            <path
                                d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                        </svg>
                    </Help>
                </div>
            </Draggable>
        );
    }
}

class Dice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 1
        }
    }

    async shuffle(diceValue) {
        document.getElementById("diceButton").disabled = true;
        for (let i = 0; i < 15; i++) {
            document.getElementById("diceImageId").src = "images/dice" + (Math.ceil(Math.random() * 6)) + ".png";
            await new Promise(resolve => setTimeout(resolve, 100 + i * 20));
        }
        if (diceValue < 1 || diceValue > 6) diceValue = "bug";
        document.getElementById("diceImageId").src = "images/dice" + diceValue + ".png";
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    async throw() {
        //let newValue = Math.ceil(Math.random() * 6);
        // TODO: DEBUG DEBUG
        //newValue = 11;
        let newValue = DICE_GENERATOR.next().value;
        await this.shuffle(newValue);
        this.setState({value: newValue});
        this.props.onThrow(newValue);
    }

    render() {
        let value = (0 < this.state.value && this.state.value < 7) ? this.state.value : "bug";
        return (
            <div id="diceDiv">
                <h3 id="currentPlayerNameH1">{this.props.currentPlayerName}</h3>
                <img id="diceImageId" src={"images/dice" + value + ".png"} alt="dice" height="64px"/>
                <br/><br/>
                <button
                    id="diceButton"
                    className="btn-outline-light btn"
                    onClick={() => this.throw()}
                >
                    Lançar
                </button>
            </div>
        );
    }
}

class QuestionWizard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentStep: "difficultySelection",
            difficultyLevel: null,
            reward: null,
        }
    }

    onDifficultySelection(difficultyLevel) {
        this.setState({currentStep: "answerSelection", difficultyLevel: difficultyLevel});
    }

    onAnswerSelection(reward) {
        this.props.onAnswerSelection(reward);
        this.setState({currentStep: "answerFeedback", reward: reward});
    }

    render() {
        let componentToRender;
        switch (this.state.currentStep) {
            case "difficultySelection":
                componentToRender =
                    <DifficultySelector
                        onDifficultySelection={(difficultyLevel) => this.onDifficultySelection(difficultyLevel)}
                    />;
                break;

            case "answerSelection":
                componentToRender =
                    <Question
                        onAnswerSelection={(reward) => this.onAnswerSelection(reward)}
                        difficultyLevel={this.state.difficultyLevel}
                    />;
                break;

            case "answerFeedback":
                componentToRender =
                    <AnswerFeedback
                        reward={this.state.reward}
                        onExit={() => this.props.onAnswerFeedbackExit()}
                    />
        }

        return (
            componentToRender
        );
    }
}

class AnswerFeedback extends React.Component {

    render() {
        return (
            <div id="answerFeedback">
                <br/>
                <h2 id="answerRightWrong">{`A resposta está ${(this.props.reward > 0) ? "certa" : "errada"}!`}</h2>
                <h5 id="livesLost">{(this.props.reward === 0) ?
                    "Perdeu uma vida!" :
                    <span> Ganhou {this.props.reward} <img src="images/coin.png"/></span>
                }
                </h5>
                <button
                    id="exitAnswerFeedbackButton"
                    className="btn btn-outline-light"
                    onClick={this.props.onExit}
                >
                    Avançar
                </button>
            </div>
        );
    }
}

class DifficultySelector extends React.Component {

    selectDifficulty(difficultyLevel) {
        this.props.onDifficultySelection(difficultyLevel);
    }

    render() {
        return (
            <div id="difficultySelector">
                <h4 className="wizardTitle">Selecione a dificuldade da pergunta:</h4>
                <div className="d-flex flex-column justify-content-center">
                    {
                        [
                            {className: "bg-success", difficultyName: "fácil"},
                            {className: "bg-warning", difficultyName: "média"},
                            {className: "bg-danger", difficultyName: "difícil"}
                        ].map((buttonProps, index) => (
                            <button
                                id={"difficulty" + (index + 1) + "Button"}
                                className={"difficultyButton mx-auto btn-outline-light btn " + buttonProps.className}
                                onClick={() => this.selectDifficulty(index + 1)}
                            >
                                {buttonProps.difficultyName}
                            </button>
                        ))
                    }
                </div>
            </div>
        );
    }
}

class Question extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: null,
            image: null,
            questionText: null,
            answers: [null, null, null, null]
        };
    }

    async selectAnswer(answer) {
        let response = await fetch(`http://127.0.0.1:8000/api/questions/${this.state.id}?answer=${answer}`)
            .then(response => response.json());
        if (response.data.correct)
            this.props.onAnswerSelection(this.props.difficultyLevel);
        else this.props.onAnswerSelection(0);
    }

    async componentDidMount() {
        let response = await fetch("http://127.0.0.1:8000/api/questions/random/" + this.props.difficultyLevel)
            .then(response => response.json());
        this.setState(response.data)
    }

    render() {
        let answers = this.state.answers
            .sort(() => Math.random() - 0.5)
            .map((answer, index) =>
                <button
                    id={"answerButton" + index}
                    className="answerButton btn-outline-light btn"
                    onClick={() => this.selectAnswer(answer)}
                >
                    {answer}
                </button>
            );
        answers.splice(2, 0, <br/>);
        return (
            <div id="answerSelector">
                <div
                    id="questionImageDiv"
                    style={{backgroundImage: `url(${this.state.image})`
                    }}
                >
                </div>
                <br/>
                <h5 id="questionText">{this.state.questionText}</h5>
                {/****************************************************************************************************/}
                {answers}
                {/****************************************************************************************************/}
            </div>
        );
    }

}

class Shop extends React.Component {

    sellItem(itemName, itemPrice) {
        this.props.onItemSale(itemName, itemPrice)
    }

    exit() {
        this.props.onExit()
    }

    render() {
        let inventory = Object.values(this.props.inventory).filter(item => (item.name != null));

        return (
            <div id="shop">
                <h2 id="shopHeader">Loja</h2>
                <div id="shopTableWrapper" className="table-responsive">
                    <table id="shopTable">
                        <thead>
                        <tr>
                            <th>Item</th>
                            <th>Preço</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody id="shopTableBody">
                        {/********************************************************************************************/}
                        {inventory.map((item, index) =>
                            <tr>
                                <td id="item1Name">
                                    <img className="shopItemImg" src={"./images/shop/" + item.image}/>&nbsp;
                                    {item.name}
                                </td>
                                <td id={"item" + index + "Price"}>
                                    {item.price}
                                    &nbsp;<img src="images/coin.png" height="25"/></td>
                                <td>
                                    <div className="input-group">
                                        <button
                                            id={"item" + index + "Button"}
                                            className="btn btn-outline-light purchaseButton"
                                            disabled={item.price > this.props.currentPlayerCoins}
                                            onClick={() => this.sellItem(item.name, item.price)}
                                        >
                                            Comprar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {/********************************************************************************************/}
                        </tbody>
                    </table>
                </div>
                <div id="shopFooter">
                    <button
                        id="exitShopButton"
                        className="btn btn-outline-light"
                        onClick={() => this.exit()}
                    >
                        Sair da loja
                    </button>
                </div>
            </div>
        );
    }
}

class Task extends React.Component {

    render() {

        let message = "Não tem as condições necessárias para executar a tarefa. Terá de fazer trabalho comunitário.";
        let canCompleteTask = this.props.conditionsForCompletion.canCompleteTask;
        let hasNecessaryItem = this.props.conditionsForCompletion.hasNecessaryItem;

        if (canCompleteTask) {
            if (hasNecessaryItem)
                message = "Será gasto 1 " + this.props.details.necessaryItemName + " do seu inventário.";
            else
                message = "Não tem o item necessário no seu inventário, mas pode comprá-lo.";
        }


        return (
            <div id="taskDiv">
                <h3>Tarefa</h3>
                <h3 id="taskSelectorDescription">{this.props.details.taskDescription}</h3>
                <h6 id="taskNecessaryItem">{this.props.details.necessaryItemName}</h6>
                <h6 id="taskItemCost">
                    Preço: {this.props.details.necessaryItemPrice}
                    &nbsp;
                    <img src="images/coin.png" height="25"/>
                </h6>
                <p id="taskConditions">{message}</p>
                <button
                    id="taskContinueButton"
                    className="btn btn-outline-light"
                    onClick={() => this.props.onCompletion()}
                >
                    Continuar
                </button>
            </div>
        );
    }
}

class Chest extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            currentStep: 1,
            skipped: false,
            success: false,
        }
    }

    onKeySelection(keyName) {
        this.setState({
            currentStep: 2,
            success: this.props.onKeySelection(keyName)
        })
    }

    onSkipKeySelection() {
        this.setState({
            currentStep: 2,
            success: this.props.onKeySelection(null),
            skipped: true
        })
    }

    onSkipFeedback() {
        if (!this.state.skipped)
            this.setState({currentStep: 3});
        else this.props.onCompletion(this.state.skipped)
    }

    onSkipHazard() {
        this.props.onCompletion(this.state.skipped, this.props.details.hasHazardItems);
    }

    render() {
        let componentToRender;
        switch (this.state.currentStep) {
            case 1:
                componentToRender =
                <div id="chestDiv">
                    <h2 id="chestDialogue">Descobriu um cofre!</h2>
                    <h5 id="chestSubDialogue">{(this.props.keys.length === 0) ?
                        "Mas não tem nenhuma chave..." :
                        "Escolha uma chave:"}</h5>

                    <div className="btn-group-vertical" role="group">
                        {this.props.keys.map((key) =>
                            <button
                                id={`${key.name.replace(/\s/g, '')}Button`}
                                className="btn btn-outline-light keyButton"
                                onClick={() => this.onKeySelection(key.name)}
                            >
                                <img src={`images/shop/${key.image}`} />
                                Usar {key.name}
                            </button>
                        )}
                    </div>
                    <br/>
                    <button
                        id="chestContinueButton"
                        className="btn btn-outline-light"
                        onClick={() => this.onSkipKeySelection()}
                    >
                        Abandonar o cofre
                    </button>
                </div>;
                break;
            case 2:
                componentToRender =
                    <div id="chestFeedbackDiv">
                        <br/>
                        <h4 id="chestFeedbackP">
                            {
                                (this.state.skipped) ?
                                    "Voltou ao ponto de partida, deixando o cofre por abrir.":
                                    (this.state.success) ?
                                        "Abriu o cofre e recuperou uma parte do mapa!" :
                                        "Chave errada!..."
                            }
                        </h4>
                        <h5>
                            {
                                (this.state.skipped) ?
                                    "Perdeu uma vida.":
                                    (this.state.success) ?
                                        "Obtenha 3 para vencer." :
                                        "Perdeu uma vida."
                            }
                        </h5>
                        <br/>
                        <button
                            id="chestFeedbackContinueButton"
                            className="btn btn-outline-light"
                            onClick={() => this.onSkipFeedback()}
                        >
                            Continuar
                        </button>
                    </div>;
                break;

            case 3:
                componentToRender =
                    <div id="chestHazardDiv">
                        <br/>
                        <h5 id="hazardDescriptionP">{this.props.details.hazard.description}</h5>
                        <h5>Para sobreviver, precisa de:</h5>
                        <ul id="hazardItemsUl">
                            {this.props.details.hazard.necessaryItems.map((necessaryItem) =>
                                <li key={necessaryItem}>{necessaryItem}</li>
                            )}
                        </ul>
                        <p id="hazardFeedbackP">{(this.props.details.hasHazardItems) ?
                            "Tendo todos os items necessários, conseguiu sobreviver!" :
                            "Não tem os items necessários para sobreviver... Perdeu o jogo!"
                        }</p>
                        <button
                            id="hazardContinueButton"
                            className="btn-outline-light btn"
                            onClick={() => this.onSkipHazard()}
                        >
                            Continuar...
                        </button>
                    </div>;
                break;

                default:
                componentToRender = <p>Não devia ver isto</p>;
        }

        return (
            componentToRender
        );
    }
}

class Toast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {display: true}
    }

    close() {
        this.setState({display: false})
    }

    render() {
        // TODO: toast toast toast
        return (
            <Draggable>
            <div
                id={this.props.id}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className={(this.props.currentPlayer === "A") ? "bg-danger" : "bg-primary"}
                style={{display: (this.state.display) ? "block" : "none"}}
            >
                <div className="toast-header">
                    <strong className="me-auto">{this.props.title}</strong>
                    <strong id="tileName">{this.props.subtitle}</strong>
                    <button
                        type="button"
                        className="btn-close bg-light"
                        data-bs-dismiss="toast"
                        aria-label="Close"
                        id="hideTaskToastButton"
                        onClick={() => this.close()}
                    >
                    </button>
                </div>
                <div className="toast-body text-center">
                    {this.props.children}
                </div>
            </div>
            </Draggable>
        );
    }
}

class PlayerSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            playerSName: null,
            playerAName: null,
            playerBName: null
        };
    }

    handlePlayerNameChange(event, playerChar) {
        this.setState({
            [`player${playerChar}Name`]: event.target.value
        });
    }

    handleSubmit(event, numberOfPlayers) {
        if (numberOfPlayers === 1)
            this.props.onSubmit(numberOfPlayers, this.state.playerSName);
        else
            this.props.onSubmit(numberOfPlayers, this.state.playerAName, this.state.playerBName);
    }

    render() {
        return (
            <div id="playerSelectorDiv">
                <img id="bigLogoImg" src="images/logo_big_alt.png" width="512" height="315"/>
                <br/>
                <div id="registrationDivs">
                    <div id="singlePlayerDiv" className="registrationDiv p-3">
                        <h3>Um jogador</h3>
                        <form id="singlePlayerForm" action="#"
                              onSubmit={(event) => this.handleSubmit(event, 1)}
                        >
                            <input
                                minLength="3" maxLength="12" placeholder="Nome do jogador" type="text"
                                id="onePlayerNameInput" className="form-control text-center playerNameInput"
                                required
                                value={this.state.playerSName}
                                onChange={(event) => this.handlePlayerNameChange(event, "S")}
                            />
                            <br/>
                            <input type="submit" value="Jogar" id="onePlayerButton"
                                   className="btn btn-outline-light btn-lg"/>
                        </form>
                    </div>
                    <div id="twoPlayerDiv" className="registrationDiv p-3">
                        <h3>Dois jogadores</h3>
                        <form id="twoPlayerForm" action="#"
                              onSubmit={(event) => this.handleSubmit(event, 2)}
                        >
                            <input minLength="3" maxLength="12" placeholder="Nome do jogador A" type="text"
                                   id="playerANameInput" className="form-control text-center playerNameInput"
                                   required
                                   value={this.state.playerAName}
                                   onChange={(event) => this.handlePlayerNameChange(event, "A")}
                            />
                            <input minLength="3" maxLength="12" placeholder="Nome do jogador B" type="text"
                                   id="playerBNameInput"
                                   className="form-control text-center playerNameInput" required
                                   value={this.state.playerBName}
                                   onChange={(event) => this.handlePlayerNameChange(event, "B")}
                            />
                            <br/>
                            <input type="submit" value="Jogar" id="twoPlayerButton"
                                   className="btn btn-outline-light btn-lg"/>
                        </form>
                    </div>
                </div>
                <Help
                    buttonId="playerSelectorHelpButton"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" fill="currentColor"
                         className="bi bi-question-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path
                            d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                    </svg>
                    <br/>
                    <small>Ajuda</small>
                </Help>

            </div>
        );
    }
}

class Help extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: false
        };
        this.toggle = this.toggle.bind(this)
    }

    toggle() {
        this.setState({selected: (!this.state.selected)})
    }

    render() {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => this.toggle()}
                    id={this.props.buttonId}
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                >
                    {this.props.children}
                </button>
                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel"
                     aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <img src="images/logo_horizontal.png" id="helpLogo"/>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"
                                        aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <h1 className="text-center">Regras do Jogo</h1>
                                <p>
                                    Nº de jogadores: 1 ou 2. <br/>
                                    (No caso de 2 jogadores, jogam alternadamente.)<br/>
                                    Nº de casas do tabuleiro: 50<br/>
                                    Nº de <b>vidas</b> <img src="images/life.png" className="helpIcon"/> do jogador: 5<br/>
                                </p>
                                <p className="text-center">
                                    <img src="images/winner.png" className="m-auto helpIconBig"/> <br/>
                                </p>
                                <p>
                                    Para ganhar <img src="images/winner.png" className="helpIcon"/>, um jogador deve colecionar 3 <b>peças do mapa</b> <img src="images/map_icon.png" className="helpIcon"/>. Estas estão guardadas em <b>cofres</b> <img src="images/chest.png" className="helpIcon"/> espalhados pelo tabuleiro.<br/>
                                    Se um jogador perder todas as suas <b>vidas</b> <img src="images/life.png" className="helpIcon"/>, perde o jogo. Caso seja um jogo de dois jogadores, o seu oponente ganha. <br/>
                                    O jogador avança no tabuleiro através do lançamento do dado.
                                </p>
                                <p className="text-center">
                                    <img src="images/dice6.png" className="m-auto helpIconBig"/> <br/>
                                </p>
                                <p>
                                    Sempre que o jogador lança o dado:
                                    <ol>
                                        <li>Avança para a <b>casa</b> <img src="images/tile0.png" className="helpIcon"/> correspondente</li>
                                        <li>Responde a uma pergunta depois de escolher o respetivo grau de dificuldade (1, 2 ou 3).
                                            <ul>
                                                <li>Se responder corretamente, ganha 1, 2 ou 3 <b>moedas</b> <img src="images/coin.png" className="helpIcon"/>, dependendo da dificuldade</li>
                                                <li>Caso contrário, perde uma <b>vida</b> <img src="images/life.png" className="helpIcon"/></li>
                                            </ul>
                                        </li>
                                        <li>Acede à loja, onde pode trocar <b>moedas</b> <img src="images/coin.png" className="helpIcon"/> por items úteis para a sua aventura.</li>
                                    </ol>
                                </p>
                                <p className="text-center">
                                    <img src="images/tile_pico.png" className="m-auto helpIconBig"/> <br/>
                                </p>
                                <p>
                                    Nas <b>casas especiais</b> <img src="images/tile_pico.png" className="helpIcon"/> são propostas tarefas aos jogadores. <br/>
                                    Estas tarefas requerem o consumo de um item apropriado à situação. Caso não o tenha no seu inventário, o jogador pode trocar as suas moedas <img src="images/coin.png" className="helpIcon"/> para o obter.<br/>
                                    O jogador pode optar por não executar a tarefa, mesmo que reúna as condições para a poder executar (perde, no entanto, uma <b>vida</b> <img src="images/life.png" className="helpIcon"/>).
                                </p>
                                <p className="text-center">
                                    <img src="images/chest.png" className="m-auto helpIconBig"/> <br/>
                                </p>
                                <p>
                                    Nas casas 12, 25 e 39 encontram-se os <b>cofres</b> <img src="images/chest.png" className="helpIcon"/> onde estão guardadas as <b>peças do mapa</b> <img src="images/map_icon.png"  className="helpIcon"/>.
                                    Para abri-los, é necessária uma <b>chave</b> <img src="images/chave_vermelha.png"  className="helpIcon"/> da mesma cor do cofre. Esta chave pode ser comprada na loja.
                                    Abrir os cofres pode, no entanto, enfurecer os seus guardiões... <b><i>Prepare-se!</i></b>
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            numberOfPlayers: null,

            currentPlayer: "A",
            lastDiceValue: 0,

            playerAName: null,
            playerALives: PLAYER_A_LIVES,
            playerACoins: PLAYER_A_COINS,
            playerAMapPieces: PLAYER_A_MAP_PIECES,
            playerACurrentTile: 1,
            playerAInventory: {},
            playerACommunityWork: false,
            playerAOpenedChestTiles: [],

            playerBName: null,
            playerBLives: PLAYER_B_LIVES,
            playerBCoins: PLAYER_B_COINS,
            playerBMapPieces: PLAYER_B_MAP_PIECES,
            playerBCurrentTile: null,
            playerBInventory: {},
            playerBCommunityWork: false,
            playerBOpenedChestTiles: []
        }
    }

    movePlayerForward(playerCharacter, steps) {
        let currentPlayer = "player" + playerCharacter;
        steps = (this.state[`${currentPlayer}CommunityWork`]) ? 0 : steps;
        this.setState({
            [currentPlayer + "CurrentTile"]: (this.state[currentPlayer + "CurrentTile"] + steps - 1) % 50 + 1,
            lastDiceValue: steps
        });
    }

    rewardOrPunishPlayer(playerCharacter, rewardedCoins) {
        let currentPlayer = "player" + this.state.currentPlayer;
        let lives = this.state[currentPlayer + "Lives"];
        let coins = this.state[currentPlayer + "Coins"];
        let communityWork = this.state[currentPlayer + "CommunityWork"];
        if (rewardedCoins === 0) lives--;
        else {
            if (communityWork) {
                communityWork = false;
            }
            else
                coins += rewardedCoins;
        }
        this.setState({
            [`${currentPlayer}Lives`]: lives,
            [`${currentPlayer}Coins`]: coins,
            [`${currentPlayer}CommunityWork`]: communityWork,

        });
    }

    addItemToPlayerInventory(playerCharacter, itemName, itemPrice) {
        let player = "player" + playerCharacter;
        let inventoryName = player + "Inventory";
        let inventory = this.state[inventoryName];
        let quantity = (itemName in inventory) ? inventory[itemName] + 1 : 1;

        this.setState({
            [player+"Coins"]: this.state[player+"Coins"] - itemPrice,
            [inventoryName]: {...inventory, [itemName]: quantity}
        });
    }

    switchPlayer() {
        if (this.state.numberOfPlayers === 2)
            this.setState({ currentPlayer: (this.state.currentPlayer === "B")? "A" : "B" });
    }

    getTaskDetails(currentPlayerInTaskTile) {
        if (currentPlayerInTaskTile) {
            let task = this.props.taskTiles[this.state["player"+this.state.currentPlayer+"CurrentTile"]];
            let price = this.props.shopInventory[task.necessaryItemName].price;
            let hasNecessaryItem = (task.necessaryItemName in this.state[`player${this.state.currentPlayer}Inventory`]);
            return {
                ...task,
                necessaryItemPrice: price,
                hasNecessaryItem,
                canCompleteTask: (hasNecessaryItem || price <= this.state[`player${this.state.currentPlayer}Coins`])
            };
        } else
            return this.props.taskTiles.null;

    }

    checkIfPlayerHasHazardItems(currentPlayerInChestTile) {
        if (currentPlayerInChestTile) {
            let currentTile = this.state[`player${this.state.currentPlayer}CurrentTile`];
            return this.props.chestTiles[currentTile].hazard.necessaryItems
                .every((item) => Object.keys(this.state[`player${this.state.currentPlayer}Inventory`]).includes(item));}
        else return null;
    }

    getConditionsForTaskCompletion(currentPlayerInTaskTile) {
        if (currentPlayerInTaskTile){
            let currentPlayer = "player"+this.state.currentPlayer;
            let necessaryItemName = this.props.taskTiles[this.state[currentPlayer + "CurrentTile"]].necessaryItemName;
            let necessaryItemPrice = this.props.shopInventory[necessaryItemName].price;
            let currentPlayerInventory = this.state[currentPlayer + "Inventory"];
            let currentPlayerCoins = this.state[currentPlayer + "Coins"];
            let hasNecessaryItem = (necessaryItemName in currentPlayerInventory);
            return{
                hasNecessaryItem: hasNecessaryItem,
                canCompleteTask: (hasNecessaryItem || necessaryItemPrice <= currentPlayerCoins)
            };
        } else
            return null;

    }

    consumeItem(playerChar, itemName) {
        let playerInventory = this.state[`player${playerChar}Inventory`];
        console.log(playerInventory);
        let newPlayerInventory = {
            ...playerInventory,
            [itemName]: playerInventory[itemName] - 1
        };
        console.log(newPlayerInventory);
        if (newPlayerInventory[itemName] === 0) { console.log(itemName);
            delete newPlayerInventory[itemName];}
        this.setState({[`player${playerChar}Inventory`]: newPlayerInventory});
    }

    completeTask(playerChar) {
        let player = "player" + playerChar;

        let conditions = this.getConditionsForTaskCompletion(true);
        let details = this.getTaskDetails(true);

        if (conditions.hasNecessaryItem) {
            this.consumeItem(playerChar, details.necessaryItemName);
        }

        else if (conditions.canCompleteTask) {
            this.setState(
                {
                    [player + "Coins"]: this.state[player + "Coins"] - details.necessaryItemPrice
                }
            );
        }

        else
            this.setState({[player + "CommunityWork"]: true});
    }

    getKeysFromPlayerInventory(playerChar) {
        return Object.keys(this.state[`player${playerChar}Inventory`])
            .filter((itemName) => itemName.includes("Chave"))
            .map((itemName) => (
                {
                    name: itemName,
                    image: this.props.shopInventory[itemName].image,
                }));
    }

    selectKey(playerChar, keyName) {
        let success = (keyName === this.props.chestTiles[this.state[`player${playerChar}CurrentTile`]].chest.key);

        if (success){
            this.consumeItem(playerChar, keyName);
            this.setState({
                [`player${playerChar}OpenedChestTiles`]:
                    [...this.state[`player${playerChar}OpenedChestTiles`], this.state[`player${playerChar}CurrentTile`]]
            });
        }
        else
            this.setState({[`player${playerChar}Lives`]: this.state[`player${playerChar}Lives`] - 1});

        return success;
    }

    consumeItemsOrKill(playerChar, hasNecessaryItems) {
        if (hasNecessaryItems) {
            this.props.chestTiles[this.state[`player${playerChar}CurrentTile`]].hazard.necessaryItems
            .forEach((item) => {this.consumeItem(playerChar, item)});
            this.setState({[`player${playerChar}MapPieces`]: this.state[`player${playerChar}MapPieces`] + 1});
        }
        else
            this.setState({[`player${playerChar}Lives`]: 0});
    }

    selectPlayers(numberOfPlayers, playerAName, playerBName) {
        this.setState({
            numberOfPlayers: numberOfPlayers,
            playerAName: playerAName,
            playerBName: playerBName,
            playerBCurrentTile: (numberOfPlayers === 2) ? 1 : null
        })
    }

    render() {
        let players = {
            "A": {
                name: this.state.playerAName,
                lives: this.state.playerALives,
                coins: this.state.playerACoins,
                mapPieces: this.state.playerAMapPieces,
                currentTile: this.state.playerACurrentTile,
                inventory: this.state.playerAInventory
            },
            "B": {
                name: this.state.playerBName,
                lives: this.state.playerBLives,
                coins: this.state.playerBCoins,
                mapPieces: this.state.playerBMapPieces,
                currentTile: this.state.playerBCurrentTile,
                inventory: this.state.playerBInventory
            },
        };
        let currentPlayer = "player"+this.state.currentPlayer;
        let currentPlayerTile = this.state[currentPlayer + "CurrentTile"];
        let currentPlayerInTaskTile = (currentPlayerTile  in this.props.taskTiles);
        let currentPlayerInChestTile = (currentPlayerTile in this.props.chestTiles);

        if (!this.state.playerAName) {
            return (
                <PlayerSelector
                    onSubmit={(numberOfPlayers, playerAName, playerBName) =>
                        this.selectPlayers(numberOfPlayers, playerAName, playerBName)}
                />
                )
        }
        else return (
            <div id="gameDiv" style={{display: "block"}}>
                <div id="header">
                    {/*<nav className="navbar navbar-light bg-light" id="gloriaHeader">
                        <div className="container-fluid">
                            <img id="logoSmall" src="images/logo_horizontal.png" height="70px"/>
                        </div>
                    </nav>*/}
                    <PlayerStatuses
                        numberOfPlayers={this.state.numberOfPlayers}
                        players={players}
                        currentPlayer={this.state.currentPlayer}
                        shopInventory={this.props.shopInventory}
                    />
                </div>
                <Help
                    buttonId="playerSelectorHelpButton"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" fill="currentColor"
                         className="bi bi-question-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                        <path
                            d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                    </svg>
                    <br/>
                    <small>Regras</small>
                </Help>
                <Board
                    numberOfTiles={50}
                    numberOfPlayers={this.state.numberOfPlayers}
                    taskTiles={this.props.taskTiles}
                    chestTiles={this.props.chestTiles}
                    normalTileImages={this.props.normalTileImages}
                    playerATile={this.state.playerACurrentTile}
                    playerBTile={this.state.playerBCurrentTile}
                    lastDiceValue={this.state.lastDiceValue}
                />
                    {/*<div id="dummyFooter"/>*/}

                <GameWizard
                    loser={
                        (this.state.playerALives === 0 || this.state.playerBMapPieces === 3) ?
                            {character: "A", opponent: {name: this.state.playerBName, character: "B"}} :
                            (this.state.playerBLives === 0 || this.state.playerAMapPieces === 3) ?
                                {character: "B", opponent: {name: this.state.playerAName, character: "A"}} :
                                null
                    }


                    currentPlayer={{
                        name: this.state[`${currentPlayer}Name`],
                        char: this.state.currentPlayer,
                        coins: this.state[`${currentPlayer}Coins`],
                        keys: this.getKeysFromPlayerInventory(this.state.currentPlayer),
                        communityWork: this.state[`${currentPlayer}CommunityWork`],
                        task: this.getTaskDetails(currentPlayerInTaskTile),
                        chest: {
                            ...this.props.chestTiles[currentPlayerTile],
                            hasHazardItems: this.checkIfPlayerHasHazardItems(currentPlayerInChestTile),
                            opened:
                                this.state[`${currentPlayer}OpenedChestTiles`]
                                    .includes(currentPlayerTile)
                        }
                    }}

                    shopInventory={this.props.shopInventory}


                    onDiceThrow={
                        (steps) => this.movePlayerForward(this.state.currentPlayer, steps)}
                    onAnswerSelection={
                        (reward) => this.rewardOrPunishPlayer(this.state.currentPlayer, reward)}
                    onItemSale={
                        (itemName, itemPrice) =>
                            this.addItemToPlayerInventory(this.state.currentPlayer, itemName, itemPrice)}
                    onFinish={
                        () => this.switchPlayer()}
                    onTaskCompletion={
                        () => this.completeTask(this.state.currentPlayer)}
                    onChestKeySelection={
                        (keyName) => this.selectKey(this.state.currentPlayer, keyName)}
                    onChestCompletion={
                        (hasNecessaryItems) => this.consumeItemsOrKill(this.state.currentPlayer, hasNecessaryItems)
                    }
                />

                {(this.state[`${currentPlayer}CommunityWork`]) ?
                    <Toast
                        id="communityWorkToast"
                        title="Trabalho comunitário"
                        subtitle={null}
                        display={this.state[`${currentPlayer}CommunityWork`]}
                        currentPlayer={this.state.currentPlayer}
                    >
                        <p id="communityWorkDescription">
                            Só pode voltar a avançar se responder corretamente a uma pergunta.
                        </p>
                    </Toast>
                    :
                    null
                }

                {(currentPlayerInTaskTile) ?
                    <Toast
                        id="taskToast"
                        title="Tarefa"
                        subtitle={this.getTaskDetails(currentPlayerInTaskTile).location}
                        currentPlayer={this.state.currentPlayer}
                    >
                        <p id="taskDescription">{this.getTaskDetails(currentPlayerInTaskTile).taskDescription}</p>
                        <h6>
                            <b>Item necessário:</b><br/>
                            <img src={`images/shop/${this.props.shopInventory[this.getTaskDetails(currentPlayerInTaskTile).necessaryItemName].image}`}/>
                            &nbsp;
                            {this.getTaskDetails(currentPlayerInTaskTile).necessaryItemName}
                            <br/>
                            <img src="images/coin.png" height="25px" />
                            &nbsp; x &nbsp;
                            {this.props.shopInventory[this.getTaskDetails(currentPlayerInTaskTile).necessaryItemName].price}
                        </h6>
                    </Toast>
                :
                    null
                }

            </div>
        );
    }
}

// ========================================

let chestTiles = {
    "12": {
        chest: {
            key: "Chave Azul",
            image: "cofreAzul.png"
        },
        hazard: {
            description: "Ocorre um tempestade, com mar alteroso, o que impede que o barco chegue na altura prevista...",
            necessaryItems: ["Garrafa de água", "Protetor solar"]
        }
    },
    "25": {
        chest: {
            key: "Chave Vermelha",
            image: "cofreVermelho.png"
        },
        hazard: {
            description: "O ar torna-se irrespirável...",
            necessaryItems: ["Máscara", "Garrafa de água", "Corda"]
        }
    },
    "49": {
        chest: {
            key: "Chave Verde",
            image: "cofreVerde.png"
        },
        hazard: {
            description: "Ocorre um sismo, o que dificulta imenso a descida...",
            necessaryItems: ["Corda"]
        }
    }
};

let chests = Object.values(chestTiles)
    .map((chestDescObj) => chestDescObj.chest)
    .sort(() => Math.random() - 0.5);
Object.keys(chestTiles).forEach((tileNumber) => chestTiles[tileNumber].chest = chests.pop());

ReactDOM.render(
    <Game
        shopInventory={require("./shop.json")}
        taskTiles={{
                6: {
                    backgroundImage: 'tile_santamaria.png',
                    taskDescription: "Fazer uma viagem de barco para ver baleias.",
                    necessaryItemName: "Bilhete: Whale watching",
                    location: "Santa Maria"
                },
                12: {
                    backgroundImage: 'tile_vilafranca.png',
                    taskDescription: "Viajar até ao ilhéu de Vila Franca",
                    necessaryItemName: "Bilhete: Ilhéu de Vila Franca",
                    location: "São Miguel"
                },
                18: {
                    backgroundImage: 'tile_terceira.png',
                    taskDescription: "Assistir a uma tourada à corda.",
                    necessaryItemName: "Bilhete: Tourada à corda",
                    location: "Terceira"
                },
                25: {
                    backgroundImage: 'tile_furnadoenxofre.png',
                    taskDescription: "Visitar a furna do enxofre",
                    necessaryItemName: "Bilhete: Furna do Enxofre",
                    location: "Graciosa"
                },
                33: {
                    backgroundImage: 'tile_saojorge.png',
                    taskDescription: "Fazer uma viagem à Fajã de Santo Cristo.",
                    necessaryItemName: "Bilhete: Viagem guiada à Fajã do St.º Cristo",
                    location: "São Jorge"
                },
                40: {
                    backgroundImage: 'tile_flores.png',
                    taskDescription: "Fazer uma viagem à Rocha dos Bordões.",
                    necessaryItemName: "Bilhete: Visita guiada à Rocha dos Bordões",
                    location: "Flores"
                },
                42: {
                    backgroundImage: 'tile_corvo.png',
                    taskDescription: "Fazer uma viagem à lagoa do Caldeirão.",
                    necessaryItemName: "Bilhete: Viagem guiada à Lagoa do Caldeirão",
                    location: "Corvo"
                },
                49: {
                    backgroundImage: 'tile_pico.png',
                    taskDescription: "Subir à Montanha do Pico",
                    necessaryItemName: "Bilhete: Subida à montanha do Pico",
                    location: "Pico"
                },
                null: {
                    backgroundImage: null,
                    taskDescription: null,
                    necessaryItemName: null,
                    location: null,
                    necessaryItemPrice: null,
                    hasNecessaryItem: null,
                    canCompleteTask: null,
                    valueOf: () => null
                }
            }}
        chestTiles={chestTiles}
    />,
    document.getElementById('root')
);
