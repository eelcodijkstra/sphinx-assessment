var progress_db; 
var progress_context = {};

const progress_log = function (obj) {
    console.log('progress-log' + JSON.stringify(obj));
    const now = new Date();
    obj["_id"] = now.toString();
    obj.time = now.toString();
    obj.book = progress_context.booktitle;
    obj.page = progress_context.pagetitle;
    progress_db.put(obj);
}

function progress_init() {
    const booktitle = document.getElementById('site-title').innerHTML;
    const pagetitle = document.querySelector('h1 > a.headerlink').parentElement.firstChild.textContent;
    progress_context.booktitle = booktitle;
    progress_context.pagetitle = pagetitle;                                             
}

document.addEventListener('DOMContentLoaded', function(event) {
  console.log("start progress");
  progress_init();
  progress_db = new PouchDB(
                  'https://ampict.com:6984/testprogress',
                  {auth: {username: 'hans', password: 'appelscha1399#Zeekoe'}}
                );
  progress_db.info().then(function (info) {
      console.log('We have a database: ' + JSON.stringify(info));
  });                         
  console.log("pouchDB connected?");  
  if (typeof assessment_log !== 'undefined') { // check if variable exists
        assessment_log = progress_log;
  }    
});