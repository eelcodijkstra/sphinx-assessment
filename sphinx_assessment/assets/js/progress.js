var progress_db = null;
var progress_context = {};
var loginForm = null;
var progress_user = {username: "noname", password: ""};

const progress_log = function (obj) {
    console.log('progress-log' + JSON.stringify(obj));
    const now = new Date().toISOString();
    obj["_id"] = now;
    obj.time = now.toString();
    obj.book = progress_context.booktitle;
    obj.page = progress_context.pagetitle;
    obj.user = progress_user.username;
    if (progress_db !== null) {
        progress_db.put(obj);
    } else {
        console.log("no log DB");
    }
}

function progress_login() {
  document.getElementById("progressLoginForm").style.display = "block";
}

const login_template = `
  <form class="form-container">
    <h1>Login</h1>

    <label for="name"><b>Naam</b></label>
    <input type="text" placeholder="naam" name="name" required>

    <label for="psw"><b>Wachtwoord</b></label>
    <input type="password" placeholder="wachtwoord" name="psw" required>

    <button type="submit" class="btn">Login</button>
    <button type="button" class="btn cancel" onclick="closeLoginForm()">Close</button>
  </form>
`;

function closeLoginForm() {
  document.getElementById("progressLoginForm").style.display = "none";
}

function submitLoginForm(evt) {
    const form = evt.target;
    console.log(form.name.value + "-" + form.psw.value);
    progress_user = {username: form.name.value, password: form.psw.value};
    form.name.value = "";
    form.psw.value = "";
    localStorage.setItem('progress_user', JSON.stringify(progress_user));
    
    if (progress_user != 'noname') {
        progress_db = new PouchDB(
                        'https://ampict.com:6984/testprogress',
                        {auth: progress_user}
                      );
        progress_db.info().then(function (info) {
          console.log('We have a database: ' + JSON.stringify(info));
          console.log("pouchDB connected"); 
        }, function () {
          console.log("no DB connection");
          progress_db = null;  
        });                         
    } else {
        progress_db = null;
    }
    
    document.getElementById("progressLoginForm").style.display = "none";    
    return false;
}

function progress_init() {
    const booktitle = document.getElementById('site-title').innerHTML;
    const pagetitle = document.querySelector('h1 > a.headerlink').parentElement.firstChild.textContent;
    progress_context.booktitle = booktitle;
    progress_context.pagetitle = pagetitle;
    
    const topbar = document.querySelector("div.topbar-main");
    var elmt = document.createElement('a');
    elmt.classList.add("full-screen-button");
    elmt.innerHTML = `
<button type="button" class="btn btn-secondary topbarbtn" 
        data-toggle="tooltip" data-placement="bottom" 
        onclick="progress_login()" aria-label="Login" 
        title="" data-original-title="Login">    
  <i class="fas fa-user"></i>
</button>
`;
    topbar.appendChild(elmt);
    
    const formDiv = document.createElement('div');
    formDiv.id = 'progressLoginForm';
    formDiv.classList.add('form-popup');
    formDiv.innerHTML = login_template;
    loginForm = formDiv.querySelector('form');
    loginForm.onsubmit = submitLoginForm;
    document.body.appendChild(formDiv);
}

document.addEventListener('DOMContentLoaded', function(event) {
  console.log("start progress");
  progress_init();

  const stored_user = localStorage.getItem("progress_user");
  if (stored_user == null) {
      progress_user = {username: 'noname', password: ""};
  } else {
      progress_user = JSON.parse(stored_user);
  }
    
  if (progress_user != 'noname') {
      progress_db = new PouchDB(
                      'https://ampict.com:6984/testprogress',
                      {auth: progress_user}
                    );
      progress_db.info().then(function (info) {
        console.log('We have a database: ' + JSON.stringify(info));
        console.log("pouchDB connected"); 
      }, function () {
          console.log("no DB connection");
          progress_db = null;          
      });                         
  } else {
      progress_db = null;
  }
 
  if (typeof assessment_log !== 'undefined') { // check if variable exists
        assessment_log = progress_log;
  }    
});