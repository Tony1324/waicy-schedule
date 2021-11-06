//class that contains homework title, classes, time it takes
class Homework{
    constructor(title, classes, length){
        this.title = title
        this.classes = classes
        this.length = length
    }
}

//set of homework classes
let today = new Set()


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
            execute()
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
                            return date.getTime() > Date.now()
                        })
                        if(filtered.length > 0){
                            let classDiv = document.createElement("div")
                            classDiv.id = course.id
                            let className = document.createElement("h3")
                            className.innerText = course.name
                            classDiv.appendChild(className)
                            filtered.forEach(work => {
                                let workDiv = document.createElement("div")
                                workDiv.classList.add("work")

                                let addButton = document.createElement("button")
                                addButton.innerText = "+"
                                let homework = new Homework(work.title,course.name,30)
                                addButton.onclick = () => {
                                    if(!workDiv.classList.contains("added")){
                                        today.add(homework)
                                        addButton.innerText = "-"
                                        workDiv.classList.add("added")
                                        updateToday()
                                    }else{
                                        today.delete(homework)
                                        addButton.innerText = "+"
                                        workDiv.classList.remove("added")
                                        updateToday()
                                    }
                                }
                                workDiv.appendChild(addButton, 30)

                                let workName = document.createElement("p")
                                workName.innerText = work.title
                                workDiv.appendChild(workName)
                                classDiv.appendChild(workDiv)
                            })
                            classesContainer.appendChild(classDiv)
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
