var assessment_log = function (obj) {
    if (typeof progress_log !== 'undefined') { // check if exists
        progress_log(obj);
        assessment_log = progress_log; // to avoid repeated check
    }      
};

(function() {
  /*
  ** mchoice
  */
  function mcHandler(event) {
    const myform = event.target;  
    const mydiv = myform.closest('.mchoice');
    console.log('target: ' + mydiv.id);

    const correct = myform.dataset.correct;
    const multiple = myform.dataset.multiple == "True";
    let answer = "";  
    if (multiple) {
      let checkboxes = myform.querySelectorAll('input[name="answer"]:checked');
       checkboxes.forEach((checkbox) => {
          answer += checkbox.value;
       });
    } else {
      answer = myform.answer.value;
    }
    const feedbackline = mydiv.getElementsByClassName('feedback')[0];
    if (answer == correct) {
      feedbackline.innerHTML = '<i class="fas fa-check"> </i>';
    } else {
      feedbackline.innerHTML = '<i class="fas fa-times"> </i>';
    }
    const feedbacklist = mydiv.getElementsByTagName('ul')[0];
    feedbacklist.hidden = false;
    const feedbacks = feedbacklist.getElementsByTagName('li');
    for (let i = 0; i < feedbacks.length; i++) {
      if (feedbacks[i].dataset.value == myform.answer.value) {
        feedbacks[i].hidden = false;
        if (myform.answer.value == correct) {
          feedbacklist.style.backgroundColor = 'yellowgreen';
        } else {
          feedbacklist.style.backgroundColor = 'salmon';
        }
      } else {
        feedbacks[i].hidden = true;
      }
    }
    const opgave = mydiv.querySelector('span.caption-number').innerHTML;  
    assessment_log({'type': 'mchoice',
                    'opgave': opgave,
                    'label': mydiv.id,
                    'answerlog': {
                        'answer': answer,
                        'correctanswer': correct
                    },
                    'correct': correct == answer
    });  
    return false; // no further action
  }

  function mcResetHandler(event) {
    const myform = event.target.form;
    const mydiv = myform.closest('.mchoice');
    console.log('target: ' + mydiv.id);

    const feedbackline = mydiv.getElementsByClassName('feedback')[0];
    feedbackline.innerHTML = '';
    const feedbacklist = mydiv.getElementsByTagName('ul')[0];
    feedbacklist.hidden = true;
    const feedbacks = feedbacklist.getElementsByTagName('li');
    for (let i = 0; i < feedbacks.length; i++) {
      feedbacks[i].hidden = true;
    }
    const elements = myform.elements;
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].nodeName == 'INPUT') {
        elements[i].checked = false;
      }
    }
    return false; // no further action
  }

  function findMchoices() {
    const forms = document.getElementsByClassName('mchoice');
    for (let i = 0; i < forms.length; i++) {
      forms[i].onsubmit = mcHandler;
      const resetButton = forms[i].querySelector('button[type=reset]');
      resetButton.onclick = mcResetHandler;
    }
  }

  /*
  ** fillintheblank
  */

  function fitbcheck(evt) {
    const mydiv = evt.target.closest('.fillintheblank');
    console.log('check fitb: ' + mydiv.id);
      
    var answerlog = [];
    var correct = true;
    const answers = mydiv.getElementsByClassName('fitbanswer');
    for (const answer of answers) {
      const type = answer.dataset.type;
      const answer1 = answer.dataset.answer;
      const answer2 = answer.dataset.answer2;
      const input = answer.value;
      console.log(
          'Check: ' + type + ' - ' + answer1 + ' - ' + answer2 + ' > ' + input
      );
      let ok = false;
      if (type == 'text') {
        ok = answer.value == answer.dataset.answer;
      } else if (type == 'range') {
        const num = Number(answer.value);
        const min = Number(answer.dataset.answer);
        const max = Number(answer.dataset.answer2);
        ok = (min <= num) && (num <= max);
      } else if (type == 'regexp') {
        const regexp = new RegExp(answer.dataset.answer);
        ok = regexp.test(answer.value);
      }
      if (ok) {
        answer.style.backgroundColor = 'yellowGreen';
      } else {
        answer.style.backgroundColor = 'salmon';
        correct = false;  
      }
      answerlog.push({'answer': answer.value, 'correct': ok});  
    }
    const opgave = mydiv.querySelector('span.caption-number').innerHTML;  
    assessment_log({'type': 'fillintheblank',
                    'opgave': opgave,
                    'label': mydiv.id,                    
                    'answerlog': answerlog,
                    'correct': correct
    });      
  }

  function findFillintheblanks() {
    //    const fitbs = document.getElementsByClassName('fillintheblank');
    const fitbs = document.querySelectorAll('.fillintheblank');
    for (const item of fitbs) {
      const checkbutton = item.querySelector('.fitbcheckbutton');
      checkbutton.onclick = fitbcheck;
    }
  }

  /*
  ** dragndrop
  */

  function allowDrop(ev) {
    ev.preventDefault();
  }

  function drag(ev) {
    ev.dataTransfer.setData('text', ev.target.id);
    console.log('drag source: ' + ev.target.id);
  }

  function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text');
    const elt = document.getElementById(data);
    let target = ev.target;
    while (target.tagName != 'DIV') {
      target = target.parentNode;
    }
    target.appendChild(elt);
  }

  function checkDnd(ev) {
    const mydiv = ev.target.closest('.dragndrop');
    console.log('check dnd: ' + mydiv.id);

    const items = mydiv.querySelectorAll('.dndsourceitem');
    var correct = true;
    for (const item of items) {
      if (
        (item.parentNode.dataset != null) &&
        (item.dataset.value == item.parentNode.dataset.value)
      ) {
        item.style.backgroundColor = 'yellowGreen';
      } else {
        item.style.backgroundColor = 'salmon';
        correct = false;
      }
    }
    const opgave = mydiv.querySelector('span.caption-number').innerHTML;  
    assessment_log({'type': 'dragndrop',
                    'opgave': opgave,
                    'label': mydiv.id,                    
                    'correct': correct
    });       
  }

  function resetDnd(ev) {
    const dnd = ev.target.parentNode;
    const items = dnd.querySelectorAll('.dndsourceitem');
    const source = dnd.querySelector('.dndsourcelist');
    for (const item of items) {
      if (item.parentNode != source) {
        source.appendChild(item);
      }
      item.style.backgroundColor = '';
    }
  }

  function findDragndrops() {
    const sources = document.getElementsByClassName('dndsourceitem');
    for (const item of sources) {
      item.ondragstart = drag;
    }
    const targets = document.getElementsByClassName('dndtargetitem');
    for (const item of targets) {
      item.ondrop = drop;
      item.ondragover = allowDrop;
    }
    const checkbuttons = document.getElementsByClassName('dndcheckbutton');
    for (const button of checkbuttons) {
      button.onclick = checkDnd;
    }
    const resetbuttons = document.getElementsByClassName('dndresetbutton');
    for (const button of resetbuttons) {
      button.onclick = resetDnd;
    }
  }

  /*
  ** parsons
  */

  function parsonsAllowDrop(ev) {
    ev.preventDefault();
  }

  function parsonsDrag(ev) {
    ev.dataTransfer.setData('text', ev.target.id);
    console.log('drag: ' + ev.target.id);
  }

  function parsonsPositionItems(target) {
    const itemList = target.getElementsByClassName('parsons-item');
    let pos = 1;
    for (const item of itemList) {
      item.style.gridRowStart = pos;
      pos += 1;
    }
  }

  function parsonsDrop(ev) {
    ev.preventDefault();
    console.log('initial target: ' + ev.target.id);
    const rect = ev.target.getBoundingClientRect();
    const x = ev.clientX - Math.round(rect.left); // x pos. within the element
    const y = ev.clientY - Math.round(rect.top); // y pos. within the element
    console.log('drop-X: ' + x + ' ; Y: ' + y + '.');
    const data = ev.dataTransfer.getData('text');

    let target = ev.target;
    const item = document.getElementById(data);
    if (target.classList.contains('parsons-source')) {
      const parent = item.parentElement;
      target.appendChild(item); // move back to source container
      parsonsPositionItems(parent); // rearrange target container
      return;
    }
    if (target.classList.contains('parsons-column1')) {
      item.style.gridColumnStart = 1;
      item.style.gridColumnEnd = 6;
      if (item.parentElement.classList.contains('parsons-target')) {
        console.log('move left');
        return;
      }
    }
    if (target.classList.contains('parsons-column2')) {
      item.style.gridColumnStart = 2;
      item.style.gridColumnEnd = 6;
      if (item.parentElement.classList.contains('parsons-target')) {
        console.log('move left');
        return;
      }
    }
    if (target.classList.contains('parsons-column3')) {
      item.style.gridColumnStart = 3;
      item.style.gridColumnEnd = 6;
      if (item.parentElement.classList.contains('parsons-target')) {
        console.log('move left');
        return;
      }
    }
    let insertItem = null;
    if (target.classList.contains('parsons-item') &&
        target.parentElement.classList.contains('parsons-target')) {
      insertItem = target;
      if (insertItem === item) {
        item.style.gridColumnStart = parseInt(item.style.gridColumnStart) + 1;
        console.log('move right');
      } else {
        item.style.gridColumnStart = insertItem.style.gridColumnStart;
        item.style.gridColumnEnd = 6;
      }
    }
    while (!target.classList.contains('parsons-target') &&
           !target.classList.contains('parsons-source')) {
      target = target.parentElement;
    }
    // console.log('drop target: ' + target.id);
    let dndItemCount = target.dndItemCount || 0;
    dndItemCount += 1;
    target.dndItemCount = dndItemCount;
    item.style.gridRowStart = dndItemCount;
    if (insertItem !== null) {
      target.insertBefore(item, insertItem);
    } else {
      target.appendChild(item);
    }
    item.style.zIndex = 10;
    parsonsPositionItems(target);
  }

  function parsonsCheckHandler(evt) {
    console.log('Parsons: check');
    var correct = true;
    var answerlog = [];
    // find enclosing parsons admonition
    const parsons = evt.target.closest('.parsons');
    const targets = parsons.getElementsByClassName('parsons-target');
    console.log('target found? - ' + targets.length);
    const target = targets[0];
    for (const item of target.children) {
      console.log('next item');

      if (item.classList.contains('parsons-item')) {
        answerlog.push({
            'item': item.dataset.value,
            'order': item.style.gridRowStart,
            'indent': item.style.gridColumnStart
        });          
        if ((item.style.gridRowStart == item.dataset.value) &&
          (item.style.gridColumnStart - 1 == item.dataset.indent)) {
          item.style.backgroundColor = 'yellowgreen';
        } else {
          item.style.backgroundColor = 'salmon';
          correct = false;
        }
      }
    }
    // find parsons-target in this admonition
    // check all elements in this target:
    // if parsons-item: check 'value' == item.style.gridRowStart and
    // 'indent' == item.style.gridColumnStart - 1
    const opgave = parsons.querySelector('span.caption-number').innerHTML;  
    assessment_log({'type': 'parsons',
                    'opgave': opgave,
                    'label': parsons.id,                      
                    'answerlog': answerlog,
                    'correct': correct
    });        
  }

  function findParsons() {
    const items = document.getElementsByClassName('parsons-item');
    for (const item of items) {
      item.ondragstart = parsonsDrag;
    }
    const targets = document.getElementsByClassName('parsons-target');
    for (const item of targets) {
      item.ondrop = parsonsDrop;
      item.ondragover = parsonsAllowDrop;
    }
    const sources = document.getElementsByClassName('parsons-source');
    for (const item of sources) {
      item.ondrop = parsonsDrop;
      item.ondragover = parsonsAllowDrop;
    }
    const buttons = document.getElementsByClassName('parsons-checkbutton');
    for (const button of buttons) {
      button.onclick = parsonsCheckHandler;
    }
  }
    
  /*
  ** shortanswer
  */
  
  function findShortanswers() {
    const items = document.getElementsByClassName('shortanswer');
    for (const item of items) {
        button = item.querySelector('button');
        button.onclick = shortanswerCheck;
    }
  }

  function shortanswerCheck(evt) {
    const mydiv = evt.target.closest('.shortanswer');
    console.log('submit shortanswer: ' + mydiv.id);

    const answer = mydiv.querySelector('textarea');
    console.log('Submit: ' + answer.value);
    const answerlog = {answer: answer.value};

    const opgave = mydiv.querySelector('span.caption-number').innerHTML;  
    assessment_log({'type': 'shortanswer',
                    'opgave': opgave,
                    'label': mydiv.id,                    
                    'answerlog': answerlog,
                    'correct': null
    });   
  }

  /*
  ** initialization
  */    
    
  document.addEventListener('DOMContentLoaded', function(event) {
    findFillintheblanks();
    findMchoices();
    findDragndrops();
    findParsons();
    findShortanswers();
  });
})();
