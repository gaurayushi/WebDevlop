async function startGameAndSubmit(event) {
    event.preventDefault(); // Prevent form submission

    const textarea = document.getElementById("requirements");
    const errorMessage = document.getElementById("validation-error");
    const gameOverlay = document.getElementById("game-overlay");

    // Reset error display
    errorMessage.style.display = "none";
    textarea.style.borderColor = "";

    try {
        const formData = new FormData(event.target);

        // Show the game overlay immediately for valid input
        gameOverlay.style.display = "flex";
        initSnakeGame(); // Start the game without waiting for backend processing

        // Send form data to the backend
        const response = await fetch("/", {
            method: "POST",
            body: formData,
        });

        if (response.redirected) {
            // If the backend redirects, proceed to the recommendations page
            const recommendationsUrl = response.url;
            showRecommendationModal(recommendationsUrl); // Allow user to decide when to proceed
        } else if (response.status >= 400) {
            // Backend error response: Display error message and hide the game
            const errorText = await response.text();
            const cleanMessage = cleanErrorMessage(errorText);
            displayErrorMessage(cleanMessage);
            gameOverlay.style.display = "none"; // Hide the game overlay on error

            // Reload the page after displaying the error message
            setTimeout(() => {
                location.reload();
            }, 3000); // Reload after 3 seconds
        } else {
            // Unexpected response
            const errorText = await response.text();
            const cleanMessage = cleanErrorMessage(errorText || "Unexpected error occurred. Please try again.");
            displayErrorMessage(cleanMessage);
            gameOverlay.style.display = "none"; // Hide the game overlay on error
        }
    } catch (error) {
        // Handle network or other errors
        console.error("Error submitting form:", error);
        displayErrorMessage("Unable to submit your request. Please try again later.");
        gameOverlay.style.display = "none"; // Hide the game overlay on error

        // Reload the page to reset the state
        setTimeout(() => {
            location.reload();
        }, 3000); // Reload after 3 seconds
    }
}

// Helper function to display error messages
function displayErrorMessage(message) {
    const textarea = document.getElementById("requirements");
    const errorMessage = document.getElementById("validation-error");

    errorMessage.style.display = "block";
    errorMessage.textContent = message; // Display the cleaned message
    textarea.style.borderColor = "red";
}

// Helper function to clean and simplify error messages
function cleanErrorMessage(rawText) {
    if (rawText.includes("No valid recommendations")) {
        return "No valid recommendations could be generated based on the provided details.";
    }
    if (rawText.includes("Unable to extract event details")) {
        return "Unable to extract event details. Please check your input.";
    }
    return "An error occurred. Please check your input.";
}
function showRecommendationModal(recommendationsUrl) {
    const modalHTML = `
        <div id="recommendation-modal" style="position: fixed; z-index: 2000; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ffffff; padding: 30px; color: #333; border-radius: 12px; text-align: center; box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.3);">
            <h3 style="font-size: 24px; font-family: 'Poppins', sans-serif; font-weight: 600; color: #2c3e50; margin-bottom: 20px;">
                Recommendations Ready
            </h3>
            <p style="font-size: 16px; font-family: 'Roboto', sans-serif; color: #7f8c8d; margin-bottom: 25px;">
                Your recommendations are ready. Would you like to proceed or continue playing?
            </p>
            <div style="margin-top: 20px; display: flex; justify-content: center; gap: 20px;">
                <button id="proceed-btn" style="
                    background: linear-gradient(90deg, #ff4d4d, #ff6666);
                    color: white;
                    padding: 12px 25px;
                    font-size: 16px;
                    font-family: 'Poppins', sans-serif;
                    font-weight: bold;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0px 4px 15px rgba(255, 77, 77, 0.3);
                    transition: all 0.3s ease-in-out;">
                    Proceed
                </button>
                <button id="stay-btn" style="
                    background: linear-gradient(90deg, #2196f3, #64b5f6);
                    color: white;
                    padding: 12px 25px;
                    font-size: 16px;
                    font-family: 'Poppins', sans-serif;
                    font-weight: bold;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    box-shadow: 0px 4px 15px rgba(33, 150, 243, 0.3);
                    transition: all 0.3s ease-in-out;">
                    Stay Here
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Add hover effects for buttons
    document.querySelectorAll("#recommendation-modal button").forEach((button) => {
        button.addEventListener("mouseenter", () => {
            button.style.transform = "scale(1.05)";
            button.style.boxShadow = "0px 6px 20px rgba(0, 0, 0, 0.3)";
        });
        button.addEventListener("mouseleave", () => {
            button.style.transform = "scale(1)";
            button.style.boxShadow = "0px 4px 15px rgba(0, 0, 0, 0.2)";
        });
    });

    document.getElementById("proceed-btn").addEventListener("click", () => {
        window.location.href = recommendationsUrl; // Redirect to recommendations
    });

    document.getElementById("stay-btn").addEventListener("click", () => {
        document.getElementById("recommendation-modal").remove(); // Close modal

        // Add the "Proceed" button to the bottom-left corner of the game overlay
        const gameOverlay = document.getElementById("game-overlay");
        if (!document.getElementById("proceed-icon-container")) {
            const proceedContainer = document.createElement("div");
            proceedContainer.id = "proceed-icon-container";
            proceedContainer.style.position = "absolute";
            proceedContainer.style.bottom = "20px";
            proceedContainer.style.left = "20px";
            proceedContainer.style.zIndex = "1000";

            const proceedButton = document.createElement("button");
            proceedButton.id = "proceed-icon";
            proceedButton.innerHTML = `<i class="fa-solid fa-arrow-right" style="margin-right: 8px;"></i> Proceed`;
            proceedButton.style.background = "linear-gradient(90deg, #e74c3c, #c0392b)";
            proceedButton.style.color = "white";
            proceedButton.style.padding = "10px 20px";
            proceedButton.style.border = "none";
            proceedButton.style.borderRadius = "8px";
            proceedButton.style.cursor = "pointer";
            proceedButton.style.fontSize = "14px";
            proceedButton.style.boxShadow = "0px 4px 15px rgba(231, 76, 60, 0.3)";
            proceedButton.style.transition = "all 0.3s ease-in-out";

            proceedButton.addEventListener("mouseenter", () => {
                proceedButton.style.transform = "scale(1.1)";
                proceedButton.style.boxShadow = "0px 6px 20px rgba(231, 76, 60, 0.5)";
            });
            proceedButton.addEventListener("mouseleave", () => {
                proceedButton.style.transform = "scale(1)";
                proceedButton.style.boxShadow = "0px 4px 15px rgba(231, 76, 60, 0.3)";
            });

            proceedButton.addEventListener("click", () => {
                window.location.href = recommendationsUrl; // Redirect to recommendations
            });

            proceedContainer.appendChild(proceedButton);
            gameOverlay.appendChild(proceedContainer);
        }
    });
}


function initSnakeGame() {
    const playBoard = document.querySelector(".play-board");
    const scoreElement = document.querySelector(".score");
    const highScoreElement = document.querySelector(".high-score");

    let blockSize = 25;
    let total_row = 17;
    let total_col = 17;
    let snakeX = blockSize * 5;
    let snakeY = blockSize * 5;
    let velocityX = 0;
    let velocityY = 0;
    let snakeBody = [[snakeX, snakeY]];
    let foodX, foodY;
    let gameOver = false;
    let score = 0;

    let highScore = localStorage.getItem("high-score") || 0;
    highScoreElement.innerText = `High Score: ${highScore}`;

    const placeFood = () => {
        do {
            foodX = Math.floor(Math.random() * total_col) * blockSize;
            foodY = Math.floor(Math.random() * total_row) * blockSize;
        } while (snakeBody.some(segment => segment[0] === foodX && segment[1] === foodY));
    };
    placeFood();

    const renderGame = () => {
        playBoard.innerHTML = ""; // Clear the board

        // Render food
        const foodElement = document.createElement("div");
        foodElement.style.gridArea = `${foodY / blockSize + 1} / ${foodX / blockSize + 1}`;
        foodElement.classList.add("food");
        playBoard.appendChild(foodElement);

        // Render snake
        snakeBody.forEach(segment => {
            const segmentElement = document.createElement("div");
            segmentElement.style.gridArea = `${segment[1] / blockSize + 1} / ${segment[0] / blockSize + 1}`;
            segmentElement.classList.add("head");
            playBoard.appendChild(segmentElement);
        });

        scoreElement.innerText = `Score: ${score}`;
    };

    const handleGameOver = () => {
        clearInterval(setIntervalId);
        gameOver = true;

        const gameOverMessage = `
            <div id="game-over-card" style="display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: rgba(0, 0, 0, 0.7); color: white; border-radius: 8px; padding: 20px; width: 300px; margin: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                <h2>Game Over</h2>
                <p>Oops! You hit the wall or yourself.</p>
                <button id="restart-btn" style="background: #007BFF; color: white; padding: 10px; border-radius: 4px; cursor: pointer;">Restart</button>
            </div>
        `;
        playBoard.innerHTML = gameOverMessage;

        document.getElementById("restart-btn").addEventListener("click", restartGame);
    };

    const restartGame = () => {
        gameOver = false;
        snakeX = blockSize * 5;
        snakeY = blockSize * 5;
        velocityX = 0;
        velocityY = 0;
        snakeBody = [[snakeX, snakeY]];
        score = 0;
        placeFood();
        setIntervalId = setInterval(updateGame, 200);
        renderGame();
    };

    const updateGame = () => {
        if (gameOver) return handleGameOver();

        snakeX += velocityX * blockSize;
        snakeY += velocityY * blockSize;

        if (snakeX < 0 || snakeX >= blockSize * total_col || snakeY < 0 || snakeY >= blockSize * total_row) {
            gameOver = true;
            return handleGameOver();
        }

        for (let i = 1; i < snakeBody.length; i++) {
            if (snakeBody[i][0] === snakeX && snakeBody[i][1] === snakeY) {
                gameOver = true;
                return handleGameOver();
            }
        }

        if (snakeX === foodX && snakeY === foodY) {
            score++;
            snakeBody.push([foodX, foodY]);
            highScore = Math.max(score, highScore);
            localStorage.setItem("high-score", highScore);
            highScoreElement.innerText = `High Score: ${highScore}`;
            placeFood();
        }

        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i] = [...snakeBody[i - 1]];
        }
        snakeBody[0] = [snakeX, snakeY];

        renderGame();
    };

    const changeDirection = (key) => {
        if (key === "ArrowUp" && velocityY !== 1) {
            velocityX = 0;
            velocityY = -1;
        } else if (key === "ArrowDown" && velocityY !== -1) {
            velocityX = 0;
            velocityY = 1;
        } else if (key === "ArrowLeft" && velocityX !== 1) {
            velocityX = -1;
            velocityY = 0;
        } else if (key === "ArrowRight" && velocityX !== -1) {
            velocityX = 1;
            velocityY = 0;
        }
    };

    // Add event listeners for keyboard keys
    document.addEventListener("keydown", (e) => changeDirection(e.key));

    // Add event listeners for on-screen controls
    document.querySelectorAll(".controls i").forEach(button => {
        button.addEventListener("click", () => changeDirection(button.dataset.key));
    });

    let setIntervalId = setInterval(updateGame, 200);

    renderGame();
}
