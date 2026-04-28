function createDynamicField(containerId, buttonId, className, rows = 2) {
  const newNode = document.createElement('textarea');
  newNode.classList.add('form-control', className, 'mt-2');
  newNode.setAttribute('placeholder', 'enter here');
  newNode.setAttribute('rows', rows);

  const container = document.getElementById(containerId);
  const addButton = document.getElementById(buttonId);
  container.insertBefore(newNode, addButton);
}

function addNewWeField() {
  createDynamicField('we', 'weAddButton', 'weField', 2);
}

function addNewEduField() {
  createDynamicField('edu', 'eduAddButton', 'eduField', 2);
}

function addNewPjField() {
  createDynamicField('pj', 'pjAddButton', 'pjField', 2);
}

function addNewSkField() {
  createDynamicField('sk', 'skAddButton', 'skField', 1);
}

function addNewlgField() {
  createDynamicField('lg', 'lgAddButton', 'lgField', 1);
}

document.getElementById('download').style.display = 'none';

function sanitize(value) {
  return (value || '').trim();
}

function condenseText(text, maxLength = 130) {
  if (!text) return '';

  const replacements = [
    [/responsible for/gi, 'led'],
    [/worked on/gi, 'built'],
    [/in order to/gi, 'to'],
    [/utilized/gi, 'used'],
    [/a lot of/gi, 'many'],
    [/very /gi, ''],
    [/successfully/gi, ''],
    [/highly /gi, '']
  ];

  let output = text.replace(/\s+/g, ' ').trim();
  replacements.forEach(([from, to]) => {
    output = output.replace(from, to);
  });

  output = output.replace(/\s+([,.!?;:])/g, '$1');
  if (output.length > maxLength) {
    output = `${output.slice(0, maxLength - 1).trim()}…`;
  }

  return output;
}

function optimizeCollection(className, maxLength) {
  const nodes = document.getElementsByClassName(className);
  for (const node of nodes) {
    node.value = condenseText(node.value, maxLength);
  }
}

function improveWithAI() {
  const summary = document.getElementById('psField');
  const profession = sanitize(document.getElementById('pfField').value);

  optimizeCollection('weField', 140);
  optimizeCollection('eduField', 120);
  optimizeCollection('pjField', 130);
  optimizeCollection('skField', 45);
  optimizeCollection('lgField', 25);

  if (summary.value.trim()) {
    summary.value = condenseText(summary.value, 220);
  } else {
    const skills = Array.from(document.getElementsByClassName('skField'))
      .map((node) => sanitize(node.value))
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');

    summary.value = condenseText(
      `Results-focused ${profession || 'professional'} delivering concise, measurable impact${skills ? ` with strengths in ${skills}` : ''}.`,
      220
    );
  }

  alert('✨ AI optimization complete. Your CV content is now more concise.');
}

function buildTimelineHTML(values) {
  return values
    .filter(Boolean)
    .map(
      (value) => `<div class="education_content"><div class="education_time" id="time">
        <span class="education_rounder"></span>
        <span class="education_line"></span>
      </div>${value}</div>`
    )
    .join('');
}

function generateCV() {
  document.getElementById('nameT').textContent = sanitize(document.getElementById('nameField').value) || 'Your Name';
  document.getElementById('addressT').textContent = sanitize(document.getElementById('addressField').value);
  document.getElementById('contactT').textContent = sanitize(document.getElementById('contactField').value);
  document.getElementById('emailT').textContent = sanitize(document.getElementById('emailField').value);
  document.getElementById('lkT').textContent = sanitize(document.getElementById('lkField').value);
  document.getElementById('ttT').textContent = sanitize(document.getElementById('ttField').value);
  document.getElementById('wbT').textContent = sanitize(document.getElementById('wbField').value);
  document.getElementById('gtT').textContent = sanitize(document.getElementById('gtField').value);
  document.getElementById('pfT').textContent = sanitize(document.getElementById('pfField').value);
  document.getElementById('psT').textContent = sanitize(document.getElementById('psField').value);

  const builderName = sanitize(document.getElementById('builderField').value) || 'Your Name';
  document.getElementById('builderCredit').textContent = builderName;

  const wes = Array.from(document.getElementsByClassName('weField')).map((e) => condenseText(sanitize(e.value), 140));
  document.getElementById('weT').innerHTML = buildTimelineHTML(wes);

  const edus = Array.from(document.getElementsByClassName('eduField')).map((e) => condenseText(sanitize(e.value), 120));
  document.getElementById('eduT').innerHTML = buildTimelineHTML(edus);

  const pjs = Array.from(document.getElementsByClassName('pjField')).map((e) => condenseText(sanitize(e.value), 130));
  document.getElementById('pjT').innerHTML = buildTimelineHTML(pjs);

  const sks = Array.from(document.getElementsByClassName('skField'))
    .map((e) => condenseText(sanitize(e.value), 45))
    .filter(Boolean)
    .map((value) => `<li><span class="skills_circle" id="c"></span>${value}</li>`)
    .join('');
  document.getElementById('skT').innerHTML = sks;

  const lgs = Array.from(document.getElementsByClassName('lgField'))
    .map((e) => condenseText(sanitize(e.value), 25))
    .filter(Boolean)
    .map((value) => `<li>${value}</li>`)
    .join('');
  document.getElementById('lgT').innerHTML = lgs;

  const file = document.getElementById('imageField').files[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      document.getElementById('imageT').src = reader.result;
    };
  }

  document.getElementById('goback').style.display = 'block';
  document.getElementById('download').style.display = 'block';
  document.getElementById('cv-form').style.display = 'none';
  document.getElementById('cv-template').style.display = 'grid';
}

function formCV() {
  document.getElementById('goback').style.display = 'none';
  document.getElementById('cv-form').style.display = 'block';
  document.getElementById('cv-template').style.display = 'none';
  document.getElementById('download').style.display = 'none';
}

const areaCv = document.getElementById('cv-template');
const opt = {
  margin: 0,
  filename: 'myResume.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 4 },
  jsPDF: { format: 'a4', orientation: 'portrait' }
};

function printCV() {
  html2pdf(areaCv, opt);
}
