//class that contains homework title, classes, time it takes
class Homework{
    constructor(title, classes, length, difficulty){
        this.title = title
        this.classes = classes
        this.length = length
        this.difficulty = difficulty
    }
}

//set of homework classes


let today = []
let todayString = localStorage.getItem("today")
today = JSON.parse(todayString) ?? []

updateToday()


let allwork = []
allworkString = localStorage.getItem("allwork")
allwork = JSON.parse(allworkString) ?? []

updateAllwork()

//check if homework in today is also in allwork, if not, remove it from today
function checkToday(){
    isFound = false
    today.forEach(homework => {
        allwork.forEach(classes =>{
            let found = classes.work.find(work => work.title == homework.title)
            if(found){
                isFound = true
            }
        })
        if(!isFound){
            today = today.filter(twork => twork.title != homework.title)
            updateToday()
            }
    })
}

checkToday()


window.addEventListener("unload", ()=>{
    let todayString = JSON.stringify(today)
    localStorage.setItem("today", todayString)

    let allworkString = JSON.stringify(allwork)
    localStorage.setItem("allwork", allworkString)
})


function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.coursework.students.readonly"})
        .then(() => { console.log("Sign-in successful"); },
            (err)=> { console.error("Error signing in", err); });
}
function loadClient() {
    gapi.client.setApiKey("AIzaSyB7Jo8YdHQd71FeLSHC-k4jIPmy2EIfDeM");
    return gapi.client.load("https://classroom.googleapis.com/$discovery/rest?version=v1")
        .then(()=>{
            console.log("GAPI client loaded for API"); 
            //show refresh button
            let refreshButton = document.querySelector("#refresh")
            refreshButton.hidden = false
        },(err)=>{
            console.error("Error loading GAPI client for API", err); 
        });
}

function signOut() {
    gapi.auth2.getAuthInstance().disconnect()
}

function execute(){
    return gapi.client.classroom.courses.list({"courseStates":["ACTIVE"]})
        .then((response)=>{
            return response.result
        },(err) => { 
            console.error("Execute error", err) 
        }).then((data)=>{
            let classesContainer = document.querySelector("#classes")
            classesContainer.innerHTML = ""
            allwork = []
            data.courses.forEach(course => {
                gapi.client.classroom.courses.courseWork.list({"courseId": course.id,"courseWorkStates":["PUBLISHED"]})
                    .then(value => {
                        console.log(value)
                        let filtered = value.result.courseWork.filter(work => work.workType=="ASSIGNMENT").filter(work => {
                            if(work.dueDate == undefined){return false}
                            // return true
                            let date = new Date()
                            date.setFullYear(work.dueDate.year)
                            date.setMonth(work.dueDate.month-1)
                            date.setDate(work.dueDate.day)
                            return (date.getTime() > Date.now() && date.getTime() < Date.now()+604800000)
                        })
                        if(filtered.length > 0){
                            let classObj = {name:course.name,work:[]}
                            filtered.forEach(work => {
                                let homework = new Homework(work.title, classObj.name, 30, "medium")
                                classObj.work.push(homework)
                            })
                            allwork.push(classObj)

                            createAllworkElements(classObj)
                        }
                    })
            })
        });
}

//update list of homework classes in today array on div today
function updateToday(){
    let todayContainer = document.querySelector("#today")
    todayContainer.innerHTML = ""
    today.forEach(homework => {
        let homeworkDiv = document.createElement("div")
        homeworkDiv.classList.add("work")
        let homeworkName = document.createElement("p")
        homeworkName.innerText = homework.title
        homeworkDiv.appendChild(homeworkName)
        let homeworkClass = document.createElement("p")
        homeworkClass.classList.add("class")
        homeworkClass.innerText = homework.classes
        homeworkDiv.appendChild(homeworkClass)
        let homeworkLength = document.createElement("p")
        homeworkLength.classList.add("length")
        homeworkLength.innerText = homework.length + "min"
        homeworkDiv.appendChild(homeworkLength)
        todayContainer.appendChild(homeworkDiv)
    })
}

//update all work with allwork array
function updateAllwork(){
    let allworkContainer = document.querySelector("#classes")
    allworkContainer.innerHTML = ""
    allwork.forEach(classObj => {
        createAllworkElements(classObj);
    })
}

function createAllworkElements(classObj){
    let allworkContainer = document.querySelector("#classes")

    let classDiv = document.createElement("div")
    classDiv.id = classObj.name
    let className = document.createElement("h3")
    className.innerText = classObj.name
    classDiv.appendChild(className)
    classObj.work.forEach(work => {
        let workDiv = document.createElement("div")
        workDiv.classList.add("work")
        let addButton = document.createElement("button")
        addButton.innerText = "+"
        let homework = new Homework(work.title,classObj.name,30)
        if(today.some(twork => twork.title == homework.title)){

            console.log(today,homework.title)
            workDiv.classList.add("added")
        }
        addButton.onclick = () => {
            if(!workDiv.classList.contains("added")){
                today.push(homework)
                addButton.innerText = "-"
                workDiv.classList.add("added")
                updateToday()
            }else{
                today = today.filter(twork => twork.title != homework.title)
                addButton.innerText = "+"
                workDiv.classList.remove("added")
                updateToday()
            }
        }
        workDiv.appendChild(addButton)

        let workName = document.createElement("p")
        workName.innerText = work.title
        workDiv.appendChild(workName)

        //add a select input with difficulties easy, medium, hard
        let select = document.createElement("select")
        let easy = document.createElement("option")
        easy.value = "easy"
        easy.innerText = "easy"
        let medium = document.createElement("option")
        medium.value = "medium"
        medium.innerText = "medium"
        let hard = document.createElement("option")
        hard.value = "hard"
        hard.innerText = "hard"
        select.appendChild(easy)
        select.appendChild(medium)
        select.appendChild(hard)
        //show default difficulty based on work object 
        if(work.difficulty == "easy"){
            easy.selected = true
        }else if(work.difficulty == "medium"){
            medium.selected = true
        }else if(work.difficulty == "hard"){
            hard.selected = true
        }
        //set difficulty of work object when select input is changed
        select.onchange = () => {
            work.difficulty = select.value
        }

        workDiv.appendChild(select)

        classDiv.appendChild(workDiv)
    })
    allworkContainer.appendChild(classDiv)

}

gapi.load("client:auth2", function() {
    gapi.auth2.init({client_id: "258057136719-3h1oh71eerbakhtmrgq8m4pvg3f7fhv5.apps.googleusercontent.com"})
        .then((googleAuth)=>{
            if(googleAuth.isSignedIn.get()){
                loadClient()
                document.querySelector("#sign-out").hidden = false
                document.querySelector("#log-in").hidden = true
            }
            googleAuth.isSignedIn.listen((isSignedIn)=>{
                if(isSignedIn){
                    loadClient()
                    document.querySelector("#sign-out").hidden = false
                    document.querySelector("#log-in").hidden = true
                }else{
                    document.querySelector("#sign-out").hidden = true
                    document.querySelector("#log-in").hidden = false
                }
            })
        });
}); 
