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
            
            //adds the class headings
            let classesContainer = document.querySelector("#classes")
            classesContainer.innerHTML = data.courses.map(course => `
                <div id="${course.id}">
                <h3>${course.name}</h3>
                </div>
                `).join("")

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
                        let list = filtered.map(work => 
                            `<div class="work">
                            <button onclick="console.log('${work}')">+</button>
                            <p>${work.title}</p>
                            </div>`
                        ).join("")
                        document.getElementById(`${course.id}`).innerHTML += list
                    })
            })
        });
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
