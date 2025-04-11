// 캔버스 설정
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 게임 버튼
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

// 게임 변수
let gameRunning = false;
let score = 0;
let lives = 3;
let level = 1;
let aspectRatio = 1.5; // 가로:세로 비율 (3:2)

// 캔버스 크기 설정
function resizeCanvas() {
    // 화면 크기의 50%로 제한
    let width = window.innerWidth * 0.5;
    let height = width / aspectRatio;
    
    // 세로 크기가 화면의 50%를 넘지 않도록 조정
    if (height > window.innerHeight * 0.5) {
        height = window.innerHeight * 0.5;
        width = height * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // 게임 요소 크기 재조정
    updateGameElements();
}

// 게임 요소 크기 업데이트
function updateGameElements() {
    // 공 크기 조정
    ball.radius = Math.max(canvas.width * 0.015, 5);
    
    // 패들 크기 조정
    paddle.width = canvas.width * 0.17;
    paddle.height = canvas.height * 0.025;
    
    // 벽돌 크기 조정
    brickWidth = (canvas.width - (brickColumnCount + 1) * brickPadding) / brickColumnCount;
    brickHeight = canvas.height * 0.04;
    brickOffsetTop = canvas.height * 0.1;
    brickOffsetLeft = brickPadding;
    
    // 위치 재설정
    if (!gameRunning) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height - paddle.height - ball.radius - 10;
        paddle.x = (canvas.width - paddle.width) / 2;
    }
}

// 공 설정
const ball = {
    x: 0,
    y: 0,
    radius: 10,
    dx: 4,
    dy: -4,
    color: "#0095DD"
};

// 패들 설정
const paddle = {
    width: 80,
    height: 10,
    x: 0,
    color: "#0095DD"
};

// 벽돌 설정
const brickRowCount = 4;
const brickColumnCount = 7;
let brickWidth = 50;
let brickHeight = 20;
const brickPadding = 10;
let brickOffsetTop = 40;
let brickOffsetLeft = 30;

// 벽돌 배열 초기화
const bricks = [];
function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            // 레벨에 따라 벽돌 체력 증가
            const hitPoints = Math.min(r + level, 3);
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1, 
                hitPoints: hitPoints 
            };
        }
    }
}

// 키보드 이벤트 변수
let rightPressed = false;
let leftPressed = false;

// 마우스/터치 위치
let mouseX = 0;

// 이벤트 리스너
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
document.addEventListener("mousemove", mouseMoveHandler);
canvas.addEventListener("touchmove", touchMoveHandler);
window.addEventListener("resize", resizeAndRedraw);

// 화면 크기 변경 시 처리
function resizeAndRedraw() {
    resizeCanvas();
    if (!gameRunning) {
        drawStartScreen();
    } else {
        draw();
    }
}

// 키보드 핸들러
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// 마우스 핸들러
function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

// 터치 핸들러
function touchMoveHandler(e) {
    e.preventDefault();
    const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

// 게임 시작
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        startButton.style.display = "none";
        restartButton.style.display = "none";
        initBricks();
        
        // 속도 조정 (화면 크기에 비례)
        ball.dx = canvas.width * 0.006;
        ball.dy = -canvas.width * 0.006;
        
        draw();
    }
}

// 게임 재시작
function restartGame() {
    score = 0;
    lives = 3;
    level = 1;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - paddle.height - ball.radius - 10;
    ball.dx = canvas.width * 0.006;
    ball.dy = -canvas.width * 0.006;
    paddle.x = (canvas.width - paddle.width) / 2;
    initBricks();
    gameRunning = true;
    restartButton.style.display = "none";
    draw();
}

// 버튼 이벤트 리스너
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);

// 벽돌 충돌 감지
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                if (
                    ball.x > brick.x &&
                    ball.x < brick.x + brickWidth &&
                    ball.y > brick.y &&
                    ball.y < brick.y + brickHeight
                ) {
                    ball.dy = -ball.dy;
                    brick.hitPoints--;
                    
                    if (brick.hitPoints <= 0) {
                        brick.status = 0;
                        score++;
                    }
                    
                    // 모든 벽돌을 부쉈는지 확인
                    if (score === brickRowCount * brickColumnCount) {
                        level++;
                        ball.dx *= 1.1; // 속도 증가
                        ball.dy *= 1.1; // 속도 증가
                        score = 0;
                        initBricks();
                        ball.x = canvas.width / 2;
                        ball.y = canvas.height - paddle.height - ball.radius - 10;
                    }
                }
            }
        }
    }
}

// 점수 그리기
function drawScore() {
    const fontSize = Math.max(canvas.width * 0.03, 12);
    ctx.font = fontSize + "px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("점수: " + score, canvas.width * 0.02, canvas.height * 0.05);
}

// 레벨 그리기
function drawLevel() {
    const fontSize = Math.max(canvas.width * 0.03, 12);
    ctx.font = fontSize + "px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("레벨: " + level, canvas.width * 0.85, canvas.height * 0.05);
}

// 생명 그리기
function drawLives() {
    const fontSize = Math.max(canvas.width * 0.03, 12);
    ctx.font = fontSize + "px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("생명: " + lives, canvas.width * 0.7, canvas.height * 0.05);
}

// 공 그리기
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// 패들 그리기
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

// 벽돌 그리기
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                
                // 벽돌 체력에 따른 색상
                switch(bricks[c][r].hitPoints) {
                    case 1:
                        ctx.fillStyle = "#0095DD";
                        break;
                    case 2:
                        ctx.fillStyle = "#00DD95";
                        break;
                    case 3:
                        ctx.fillStyle = "#DD9500";
                        break;
                    default:
                        ctx.fillStyle = "#0095DD";
                }
                
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 게임 오버 화면
function drawGameOver() {
    ctx.font = Math.max(canvas.width * 0.06, 18) + "px Arial";
    ctx.fillStyle = "#FF0000";
    ctx.textAlign = "center";
    ctx.fillText("게임 오버", canvas.width / 2, canvas.height / 2);
    restartButton.style.display = "inline-block";
}

// 메인 그리기 함수
function draw() {
    // 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 게임 요소 그리기
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    drawLevel();
    collisionDetection();
    
    // 공 위치 업데이트
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // 벽 충돌 감지
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }
    
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    } else if (ball.y + ball.dy > canvas.height - ball.radius) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
            
            // 패들 충돌 위치에 따른 방향 변경
            const paddleCenter = paddle.x + paddle.width / 2;
            const hitPosition = ball.x - paddleCenter;
            ball.dx = hitPosition * 0.1;
        } else {
            lives--;
            if (lives === 0) {
                gameRunning = false;
                drawGameOver();
                return;
            } else {
                ball.x = canvas.width / 2;
                ball.y = canvas.height - paddle.height - ball.radius - 10;
                ball.dx = canvas.width * 0.006;
                ball.dy = -canvas.width * 0.006;
                paddle.x = (canvas.width - paddle.width) / 2;
            }
        }
    }
    
    // 패들 위치 업데이트
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += canvas.width * 0.01;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= canvas.width * 0.01;
    }
    
    // 게임이 실행 중인 경우 애니메이션 프레임 요청
    if (gameRunning) {
        requestAnimationFrame(draw);
    }
}

// 초기 화면
function drawStartScreen() {
    ctx.font = Math.max(canvas.width * 0.06, 18) + "px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "center";
    ctx.fillText("벽돌 게임", canvas.width / 2, canvas.height / 2 - canvas.height * 0.06);
    
    ctx.font = Math.max(canvas.width * 0.03, 12) + "px Arial";
    ctx.fillText("시작 버튼을 클릭하세요", canvas.width / 2, canvas.height / 2 + canvas.height * 0.04);
}

// 초기 설정 및 시작 화면 표시
resizeCanvas();
drawStartScreen(); 