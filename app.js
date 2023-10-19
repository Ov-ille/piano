const buttons = document.querySelector("#buttons");
const keyboard = document.querySelector("#keyboard");
const ui = document.querySelector("#ui-hide");
const landscapeText = document.querySelector("#landscape-text");
const songList = document.querySelector("#song-list");

if (!("songs" in localStorage)) {
    localStorage.setItem("songs", "{}")
}

const positionBlackKeys = function () {
    // // don't allow proportions to be weird
    // short and wide keys
    keyboard.style.width = "90%"
    if (keyboard.getBoundingClientRect().width > keyboard.getBoundingClientRect().height * 3) {
        keyboard.style.width = `${keyboard.getBoundingClientRect().height * 3}px`;
    }
    // long and thin keys
    keyboard.style.height = "70%"
    if (keyboard.getBoundingClientRect().height > keyboard.getBoundingClientRect().width * 0.65) {
        keyboard.style.height = `${keyboard.getBoundingClientRect().width * 0.65}px`;
    }

    const whiteKeydDimensions = document.querySelector("#c").getBoundingClientRect();
    const whiteKeyWidth = whiteKeydDimensions.width;
    const whiteKeyHeight = whiteKeydDimensions.height;
    const blackKeys = document.querySelectorAll(".black-keys");

    for (let key of blackKeys) {
        // set common location and dimensions of black keys
        key.style.top = `${whiteKeydDimensions.top + window.scrollY}px`;
        key.style.width = `${whiteKeyWidth / 2}px`;
        key.style.height = `${whiteKeyHeight / 1.5}px`;

        // set individual position for each black key (x axis)
        const keyDimensions = document.querySelector(`#${key.id.replace("-sharp", "")}`).getBoundingClientRect();
        const keySharp = document.querySelector(`#${key.id}`);
        keySharp.style.left = `${keyDimensions.left + window.scrollX + (whiteKeyWidth * 0.75)}px`;
    }
}

const checkOrientation = function () {
    // show warning on small screens in portrait mode
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
    // check for stored songs
    if (localStorage.songs != "{}") {
        document.querySelector("#folder").src = "img/folder.svg";
    }
    // position black keys initially
    positionBlackKeys()

    // when resizing position black keys again and check device orientation
    addEventListener("resize", positionBlackKeys);
    addEventListener("resize", checkOrientation);
    addEventListener("resize", () => {
        positionSongList(songList)
    });

    // listen for key presses
    for (let key of document.querySelectorAll(".keys")) {
        key.addEventListener("mousedown", function (event) {
            PlaySound(event.target.id)
        });
    }

    const startButton = document.querySelector('#record-start');
    const stopButton = document.querySelector('#record-stop');
    const playButton = document.querySelector('#play');
    const folderButton = document.querySelector('#folder');
    const currentSongText = document.querySelector("#current-song");
    const songListBackdrop = document.querySelector("#song-list-backdrop");
    let recording = false;
    let playing = false;
    let recordedAudio = [];
    let startTime;
    let endTimeRecording;
    let playTimes = [];
    let selectedSong = false;

    // add hover effects
    startButton.addEventListener("mouseenter", () => {
        if (!recording & !playing) {
            startButton.src = "img/record_hover.svg";
            startButton.classList.add("cursor-pointer");

        }
    })
    startButton.addEventListener("mouseleave", () => {
        if (!(recording || playing)) {
            startButton.src = "img/record.svg";
            startButton.classList.remove("cursor-pointer");

        }
    })
    stopButton.addEventListener("mouseenter", () => {
        if (recording || playing) {
            stopButton.src = "img/stop_hover.svg";
            stopButton.classList.add("cursor-pointer");

        }
    })
    stopButton.addEventListener("mouseleave", () => {
        if (recording || playing) {
            stopButton.src = "img/stop_active.svg";
        }
        stopButton.classList.remove("cursor-pointer");

    })
    playButton.addEventListener("mouseenter", () => {
        if (!recording && !playing && selectedSong !== false) {
            playButton.src = "img/play_hover.svg";
            playButton.classList.add("cursor-pointer");

        }
    })
    playButton.addEventListener("mouseleave", () => {
        if (!recording && !playing && selectedSong !== false) {
            playButton.src = "img/play.svg";
            playButton.classList.remove("cursor-pointer");

        }
    })
    folderButton.addEventListener("mouseenter", () => {
        if (localStorage.songs != "{}" && !playing && !recording) {
            folderButton.src = "img/folder_hover.svg";
            folderButton.classList.add("cursor-pointer");

        }
    })
    folderButton.addEventListener("mouseleave", () => {
        if (localStorage.songs != "{}" && !playing && !recording) {
            folderButton.src = "img/folder.svg";
            folderButton.classList.remove("cursor-pointer");

        }
    })

    // initialise empty setInterval
    let activeRecording = setInterval(() => { })

    // start recording
    startButton.addEventListener("click", () => {
        if (!recording && !playing) {
            recording = true;

            stopAllAudio();

            stopButton.src = "img/stop_active.svg";
            startButton.src = "img/record_active.svg";
            playButton.src = "img/play_inactive.svg";
            folderButton.src = "img/folder_inactive.svg";

            // make button flash red
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

            // reset variables
            recordedAudio = [];
            startTime = Date.now();
        }
    })

    // stop recording
    stopButton.addEventListener("click", () => {
        clearInterval(activeRecording)

        // set button appearance
        startButton.src = "img/record.svg";
        stopButton.src = "img/stop.svg";

        stopAllAudio();

        if (recording && recordedAudio.length > 0) {
            // store end time if recording was ended
            endTimeRecording = Date.now() - startTime;
            let songsInList = JSON.parse(localStorage.getItem("songs"));
            let name = prompt("What do you call this masterpiece?");
            while (String(name).trim() === "") {
                name = prompt("Please enter a name!");
            }
            while (name in songsInList) {
                name = prompt("Name is already taken. Please pick a new one.");
            }
            if (name !== null) {
                songsInList[name] = [recordedAudio, endTimeRecording];
                localStorage.setItem("songs", JSON.stringify(songsInList));
            }

        }

        if (playing) {
            // drop earlier playbacks from array
            let endTimePlaying = Date.now()
            playTimes = playTimes.filter((time) => time > endTimePlaying);
        }

        folderButton.src = "img/folder.svg";

        recording = false;
        playing = false;
    })

    // start playback
    playButton.addEventListener("click", () => {
        if (selectedSong !== false) {
            folderButton.src = "img/folder_inactive.svg";
            let songsInStorage = JSON.parse(localStorage.getItem("songs"));
            let recordedAudio = songsInStorage[selectedSong][0]
            let endTimeRecording = songsInStorage[selectedSong][1]
            playSong(recordedAudio, endTimeRecording);
        }
    })

    // close songlist on click on backdrop
    songListBackdrop.addEventListener("click", (event) => {
        if (!songList.contains(event.target)) {
            songList.parentElement.classList.add("display-none");
        }
    }, true)

    folderButton.addEventListener("click", () => {
        if (!(playing || recording) && localStorage.songs != "{}") {
            let songsInList = [];
            if (songList.querySelectorAll("li") != null) {
                songsInList = Array.from(songList.querySelectorAll("li"), el => el.textContent);
            }
            let songsInStorage = JSON.parse(localStorage.getItem("songs"));
            for (let key in songsInStorage) {
                if (!songsInList.includes(key)) {
                    let newLi = document.createElement("li");
                    let newSpan = document.createElement("span");
                    newSpan.textContent = key;
                    newLi.append(newSpan)
                    let deleteSong = document.createElement("img");
                    deleteSong.src = "img/delete.svg";
                    deleteSong.classList.add("delete-song", "visibility-hidden");
                    deleteSong.addEventListener("mouseenter", () => {
                        deleteSong.src = "img/delete_hover.svg";
                        deleteSong.classList.add("cursor-pointer");
                    })
                    deleteSong.addEventListener("mouseleave", () => {
                        deleteSong.src = "img/delete.svg";
                        deleteSong.classList.remove("cursor-pointer");

                    })
                    deleteSong.addEventListener("click", function () {
                        let songsInStorageDelete = JSON.parse(localStorage.getItem("songs"));
                        let songToDelete = this.parentElement.firstChild.textContent;
                        delete songsInStorageDelete[songToDelete];
                        localStorage.setItem("songs", JSON.stringify(songsInStorageDelete));
                        songList.querySelector("ul").removeChild(this.parentElement);
                        if (Object.keys(songsInStorageDelete).length == 0) {
                            console.log("close")

                            songList.parentElement.classList.add("display-none");
                            folderButton.src = "img/folder_inactive.svg";
                        }
                        if (songToDelete === selectedSong) {
                            currentSongText.classList.add("visibility-hidden");
                            selectedSong = false;
                            playButton.src = "img/play_inactive.svg";
                        }
                    })
                    newLi.append(deleteSong)
                    newLi.addEventListener("mouseenter", () => {
                        newLi.querySelector("img").classList.remove("visibility-hidden");
                    })
                    newLi.addEventListener("mouseleave", () => {
                        newLi.querySelector("img").classList.add("visibility-hidden");
                    })
                    newSpan.addEventListener("click", function () {
                        let songName = this.textContent;
                        let currentSongName = document.querySelector("#current-song-name");
                        currentSongName.textContent = songName;
                        selectedSong = songName;
                        currentSongText.classList.remove("visibility-hidden");
                        playButton.src = "img/play.svg";
                        songList.parentElement.classList.add("display-none");
                    })
                    songList.querySelector("ul").append(newLi);
                }
            }
            positionSongList(songList)
            songList.parentElement.classList.remove("display-none");
        }
    })

    function positionSongList(songList) {
        let folderDimensions = document.querySelector("#folder").getBoundingClientRect();
        songList.style.top = `${folderDimensions.top}px`;
        songList.style.left = `${folderDimensions.left + folderDimensions.width + 10}px`;
    }

    function playSong(recordedAudio, endTimeRecording) {
        if (!playing && !recording && recordedAudio.length > 0) {
            playing = true;

            playButton.src = "img/play_active.svg";
            startButton.src = "img/record_inactive.svg";
            stopButton.src = "img/stop_active.svg";

            // store current time in array
            let currentTime = Date.now();
            playTimes.push(currentTime);

            for (let recordedNote of recordedAudio) {
                // initialise playback of all notes via settimeout and store copy of currentTime
                let currentTimeTemp = currentTime;
                setTimeout(() => {
                    // only play the note if currentTime is still in array playTimes
                    if (playTimes.includes(currentTimeTemp)) {
                        PlaySound(`${recordedNote[0]}`)
                    }
                }, recordedNote[1]);
            }
            setTimeout(() => {
                // initialise end of playback and store copy of currentTime
                let currentTimeTemp = currentTime;
                // only adjust buttons if currentTime is still in array playTimes
                if (playTimes.includes(currentTimeTemp)) {
                    playButton.src = "img/play.svg";
                    startButton.src = "img/record.svg";
                    stopButton.src = "img/stop.svg";
                    folderButton.src = "img/folder.svg";

                    stopAllAudio()
                    playing = false;
                }
            }, endTimeRecording);
        }
    }


    // play notes
    function PlaySound(elementId) {
        // store key and current time of pressing
        if (recording) {
            recordedAudio.push([elementId, (Date.now() - startTime)]);
        }
        // stop any other note
        stopAllAudio();

        // 100ms of key animation
        document.querySelector(`#${elementId}`).classList.toggle("play");
        setTimeout(() => {
            document.querySelector(`#${elementId}`).classList.toggle("play")
        }, 100);

        // play the audio
        document.querySelector(`#${elementId}-audio`).play();
    }

    // kill all audio and reset to start
    const stopAllAudio = function () {
        for (let audio of document.querySelectorAll("audio")) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

}


