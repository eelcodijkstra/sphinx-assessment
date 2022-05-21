(function() {
  /*
  ** mchoice
  */
  function mcHandler(event) {
    console.log('target: ' + event.target.id);
    const myform = event.target;
    const correct = myform.dataset.correct;
    const feedbackline = myform.getElementsByClassName('feedback')[0];
    if (myform.answer.value == correct) {
      feedbackline.innerHTML = '<i class="fas fa-check"> </i>';
    } else {
      feedbackline.innerHTML = '<i class="fas fa-times"> </i>';
    }
    const feedbacklist = myform.getElementsByTagName('ul')[0];
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
    return false; // no further action
  }

  function mcResetHandler(event) {
    console.log('target: ' + event.target.id);
    console.log('form: ' + event.target.form.id);
    const myform = event.target.form;
    const feedbackline = myform.getElementsByClassName('feedback')[0];
    feedbackline.innerHTML = '';
    const feedbacklist = myform.getElementsByTagName('ul')[0];
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

  function fitbcheck(evt, item) {
    console.log('check fitb');
    const answers = item.getElementsByClassName('fitbanswer');
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
      }
    }
  }

  function findFillintheblanks() {
    //    const fitbs = document.getElementsByClassName('fillintheblank');
    const fitbs = document.querySelectorAll('.fillintheblank');
    for (const item of fitbs) {
      const checkbutton = item.querySelector('.fitbcheckbutton');
      checkbutton.onclick = function(evt) {
        fitbcheck(evt, item);
      };
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
    const dnd = ev.target.parentNode;
    const items = dnd.querySelectorAll('.dndsourceitem');
    for (const item of items) {
      if (
        (item.parentNode.dataset != null) &&
        (item.dataset.value == item.parentNode.dataset.value)
      ) {
        item.style.backgroundColor = 'yellowGreen';
      } else {
        item.style.backgroundColor = 'salmon';
      }
    }
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
    // find surrounding parsons admonition
    const parsons = evt.target.closest('.parsons');
    const targets = parsons.getElementsByClassName('parsons-target');
    console.log('target found? - ' + targets.length);
    const target = targets[0];
    for (const item of target.children) {
      console.log('next item');
      if (item.classList.contains('parsons-item')) {
        if ((item.style.gridRowStart == item.dataset.value) &&
          (item.style.gridColumnStart - 1 == item.dataset.indent)) {
          item.style.backgroundColor = 'yellowgreen';
        } else {
          item.style.backgroundColor = 'salmon';
        }
      }
    }
    // find parsons-target in this admonition
    // check all elements in this target:
    // if parsons-item: check 'value' == item.style.gridRowStart and
    // 'indent' == item.style.gridColumnStart - 1
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
  ** initialization
  */
  document.addEventListener('DOMContentLoaded', function(event) {
    findFillintheblanks();
    findMchoices();
    findDragndrops();
    findParsons();
  });
})();
