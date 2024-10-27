let currentSong = new Audio();
let songs;
let currFolder;

function convertSecondsToMinutesAndSeconds(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    // Adding leading zeros if necessary
    var minutesStr = minutes < 10 ? "0" + minutes : minutes;
    var secondsStr = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

    return minutesStr + ":" + Math.round(secondsStr);
}
//get songs from folder
async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${currFolder}/`)
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])

        }

    }
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `
        <li>
                           <div class="info">
                           <i class="fa-solid fa-guitar"></i>
                            <div class="anish">${song.replaceAll("%20", " ")}</div>
                         </div>
                         <div class="plybt">PlayNow&nbsp;&nbsp;&nbsp;</div>
                         
                       </li> `
    }
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
         playMusic(e.querySelector(".anish").innerHTML.trim())

        })

    })
    return songs

}
const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track;
   
    if (!pause) {
      
        currentSong.play()
        document.querySelector("#play").classList.remove("fa-play")
        document.querySelector("#play").classList.add("fa-pause")
        document.querySelector(".songInfo").innerHTML = decodeURI(track);
    }
  


}
//display albums dynamically
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-cont")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2 class="invert">${response.title}</h2>
            <p>${response.description}</p>

        </div>`
        }

    }
    //play song from album
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
    
}







//main function

async function main() {
    await getSongs("songs/Hindi");

    await displayAlbums()
   //play pause
    play.addEventListener("click", () => {

        if (currentSong.paused) {
            currentSong.play()


            document.querySelector("#play").classList.remove("fa-play")
            document.querySelector("#play").classList.add("fa-pause")
        }
        else {
            currentSong.pause()
            document.querySelector("#play").classList.add("fa-play")
            document.querySelector("#play").classList.remove("fa-pause")
        }
    })
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${convertSecondsToMinutesAndSeconds(currentSong.currentTime)} / ${convertSecondsToMinutesAndSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
   
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })
    document.querySelector("#menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })
    document.querySelector("#cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = -100 + "%";
    })
    //backward song
    previous.addEventListener("click", () => {
        currentSong.pause()
      
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }
        
    
    })
    //forward the song
    next.addEventListener("click", () => {
        currentSong.pause()
      
      
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
    
    })  
   
    //volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })
    //Add Event listener to mute the track
    document.querySelector(".volume>i").addEventListener("click",e=>{
     
        if(e.target.classList.contains("fa-volume-high")){
            e.target.classList.remove("fa-volume-high")
            e.target.classList.add("fa-volume-xmark")
            currentSong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.classList.remove("fa-volume-xmark")
            e.target.classList.add("fa-volume-high")
            currentSong.volume=0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })


}
console.log(currentSong)

main()
