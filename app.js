const buttons = document.querySelector("#buttons");
const keyboard = document.querySelector("#keyboard");
const ui = document.querySelector("#ui-hide");
const landscapeText = document.querySelector("#landscape-text");

const positionBlackKeys = function () {
    // // don't allow proportions to be weird
    // short and wide keys
    keyboard.style.width = "90%"
    if (keyboard.getBoundingClientRect().width > keyboard.getBoundingClientRect().height * 3) {
        keyboard.style.width = `${keyboard.getBoundingClientRect().height * 3}px`
    }
    // long and thin keys
    keyboard.style.height = "70%"
    if (keyboard.getBoundingClientRect().height > keyboard.getBoundingClientRect().width * 0.65) {
        keyboard.style.height = `${keyboard.getBoundingClientRect().width * 0.65}px`
    }

    const whiteKeydDimensions = document.querySelector("#c").getBoundingClientRect();
    const whiteKeyWidth = whiteKeydDimensions.width;
    const whiteKeyHeight = whiteKeydDimensions.height;



    const blackKeys = document.querySelectorAll(".black-keys");
    for (let key of blackKeys) {
        key.style.top = `${whiteKeydDimensions.top + window.scrollY}px`;
        key.style.width = `${whiteKeyWidth / 2}px`;
        key.style.height = `${whiteKeyHeight / 1.5}px`;
    }

    for (let key of ["c", "d", "f", "g", "a"]) {
        const keyDimensions = document.querySelector(`#${key}`).getBoundingClientRect();
        const keySharp = document.querySelector(`#${key}-sharp`);

        keySharp.style.left = `${keyDimensions.left + window.scrollX + (whiteKeyWidth * 0.75)}px`;
    }

}
const checkOrientation = function () {
    if (window.innerHeight < window.innerWidth | window.innerWidth > 400) {
        ui.classList.remove("display-none");
        landscapeText.classList.add("display-none");
        positionBlackKeys()
    }
    if (window.innerHeight > window.innerWidth & window.innerWidth < 400) {
        ui.classList.add("display-none");
        landscapeText.classList.remove("display-none");
    }
}
checkOrientation()

window.onload = function () {
    positionBlackKeys()

    addEventListener("resize", positionBlackKeys);
    addEventListener("resize", checkOrientation);

    for (let key of document.querySelectorAll(".keys")) {
        key.addEventListener("mousedown", function (event) {
            PlaySound(event.target.id)
        });
    }



    const startButton = document.querySelector('#record-start');
    const stopButton = document.querySelector('#record-stop');
    const playButton = document.querySelector('#play');
    let recording = false;
    let playing = false;
    let recordedAudio = [];
    let startTime;
    let endTimeRecording;

    startButton.addEventListener("mouseenter", () => {
        if (recording == false & playing == false) {
            startButton.src = "img/record_hover.svg"
        }
    })
    startButton.addEventListener("mouseleave", () => {
        if (recording == false & playing == false) {
            startButton.src = "img/record.svg"
        }
    })
    stopButton.addEventListener("mouseenter", () => {
        if (recording | playing) {
            stopButton.src = "img/stop_hover.svg"
        }
    })
    stopButton.addEventListener("mouseleave", () => {
        if (recording | playing) {
            stopButton.src = "img/stop_active.svg"
        }
    })
    playButton.addEventListener("mouseenter", () => {
        if (recordedAudio.length > 0 & recording == false & playing == false) {
            playButton.src = "img/play_hover.svg"
        }
    })
    playButton.addEventListener("mouseleave", () => {
        if (recordedAudio.length > 0 & recording == false & playing == false) {
            playButton.src = "img/play.svg"
        }
    })


    let activeRecording = setInterval(() => { })
    startButton.addEventListener("click", () => {
        if (recording == false & playing == false) {
            recording = true;

            stopAllAudio();

            stopButton.src = "img/stop_active.svg";

            startButton.src = "img/record_active.svg";
            playButton.src = "img/play_inactive.svg";
            setTimeout(() => {
                startButton.src = "img/record.svg";
            }, 500);
            activeRecording = setInterval(() => {
                if (recording) {
                    startButton.src = "img/record_active.svg";
                }
                setTimeout(() => {
                    startButton.src = "img/record.svg";

                }, 500);
            }, 1000)


            recordedAudio = [];
            endTime = null;
            startTime = Date.now();
        }
    })

    stopButton.addEventListener("click", () => {
        clearInterval(activeRecording)
        startButton.src = "img/record.svg";
        stopButton.src = "img/stop.svg";
        startButton.src = "img/record.svg";
        if (recordedAudio.length > 0) {
            playButton.src = "img/play.svg";

        }


        if (recording) {
            endTimeRecording = Date.now() - startTime;
        }
        if (playing) {
            let endTimePlaying = Date.now()
            playTimes = playTimes.filter((time) => time > endTimePlaying);
        }
        recording = false;
        playing = false;

        stopAllAudio();
    })

    let playTimes = [];
    playButton.addEventListener("click", () => {
        if (playing == false & recording == false & recordedAudio.length > 0) {
            playing = true;
            playButton.src = "img/play_active.svg";
            startButton.src = "img/record_inactive.svg";


            let currentTime = Date.now();
            playTimes.push(currentTime);

            stopButton.src = "img/stop_active.svg";

            for (let recordedNote of recordedAudio) {
                let currentTimeTemp = currentTime;
                setTimeout(() => {
                    if (playTimes.includes(currentTimeTemp)) {
                        PlaySound(`${recordedNote[0]}`)
                    }
                }, recordedNote[1]);
            }
            setTimeout(() => {
                playButton.src = "img/play.svg";
                startButton.src = "img/record.svg";
                stopAllAudio()
                playing = false;
            }, endTimeRecording);
        }

    })





    function PlaySound(elementId) {

        if (recording) {
            recordedAudio.push([elementId, (Date.now() - startTime)]);
        }
        stopAllAudio();
        const audio = document.querySelector(`#${elementId}-audio`);
        document.querySelector(`#${elementId}`).classList.toggle("play");
        setTimeout(() => {
            document.querySelector(`#${elementId}`).classList.toggle("play")
        }, 100);
        audio.play();
    }

}

const stopAllAudio = function () {
    for (let audio of document.querySelectorAll("audio")) {
        audio.pause();
        audio.currentTime = 0;
    }
}
