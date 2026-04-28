const OPEN_SOURCE_MODEL_API_URL = 'https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-7B-Instruct/v1/chat/completions';
const OPEN_SOURCE_MODEL_DOCS_URL = 'https://huggingface.co/docs/api-inference/index';

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

function optimizeCollection(className, maxLength) {
  const nodes = document.getElementsByClassName(className);
  for (const node of nodes) {
    node.value = condenseText(node.value, maxLength);
  }
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

function buildChatPrompt() {
  const sections = {
    profession: sanitize(document.getElementById('pfField').value),
    summary: sanitize(document.getElementById('psField').value),
    work: Array.from(document.getElementsByClassName('weField')).map((n) => sanitize(n.value)).filter(Boolean),
    education: Array.from(document.getElementsByClassName('eduField')).map((n) => sanitize(n.value)).filter(Boolean),
    projects: Array.from(document.getElementsByClassName('pjField')).map((n) => sanitize(n.value)).filter(Boolean),
    skills: Array.from(document.getElementsByClassName('skField')).map((n) => sanitize(n.value)).filter(Boolean),
    languages: Array.from(document.getElementsByClassName('lgField')).map((n) => sanitize(n.value)).filter(Boolean)
  };

  return `Rewrite resume text to be concise and impact-focused. Return strict JSON with keys summary, work, education, projects, skills, languages. Keep same number of bullet items per list. If empty list, return empty list. Input: ${JSON.stringify(sections)}`;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function applyAiResult(payload) {
  if (!payload) return false;

  if (typeof payload.summary === 'string') {
    document.getElementById('psField').value = condenseText(payload.summary, 220);
  }

  const mappings = [
    ['work', 'weField', 140],
    ['education', 'eduField', 120],
    ['projects', 'pjField', 130],
    ['skills', 'skField', 45],
    ['languages', 'lgField', 25]
  ];

  mappings.forEach(([key, className, maxLength]) => {
    if (!Array.isArray(payload[key])) return;
    const nodes = Array.from(document.getElementsByClassName(className));
    payload[key].forEach((text, idx) => {
      if (nodes[idx] && typeof text === 'string') {
        nodes[idx].value = condenseText(text, maxLength);
      }
    });
  });

  return true;
}

async function improveWithAI() {
  const improveBtn = document.querySelector('button[onclick="improveWithAI()"]');
  if (improveBtn) improveBtn.disabled = true;

  try {
    const token = sanitize(document.getElementById('aiTokenField')?.value || '');

    if (!token) {
      optimizeCollection('weField', 140);
      optimizeCollection('eduField', 120);
      optimizeCollection('pjField', 130);
      optimizeCollection('skField', 45);
      optimizeCollection('lgField', 25);

      const summaryField = document.getElementById('psField');
      summaryField.value = condenseText(summaryField.value, 220);

      alert(`✨ Local AI improve applied. For cloud open-source model, add Hugging Face token.\nAPI: ${OPEN_SOURCE_MODEL_API_URL}\nDocs: ${OPEN_SOURCE_MODEL_DOCS_URL}`);
      return;
    }

    const response = await fetch(OPEN_SOURCE_MODEL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [
          { role: 'system', content: 'You are a resume editor. Output JSON only.' },
          { role: 'user', content: buildChatPrompt() }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`AI API failed (${response.status})`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = safeJsonParse(content);

    if (!applyAiResult(parsed)) {
      throw new Error('Unable to parse model response');
    }

    alert('✨ Cloud AI improve complete with Qwen2.5-7B-Instruct (Hugging Face Inference).');
  } catch (error) {
    optimizeCollection('weField', 140);
    optimizeCollection('eduField', 120);
    optimizeCollection('pjField', 130);
    optimizeCollection('skField', 45);
    optimizeCollection('lgField', 25);
    alert(`⚠️ Cloud AI failed, local improve applied instead. ${error.message}`);
  } finally {
    if (improveBtn) improveBtn.disabled = false;
  }
}

function setLinkOrText(id, value, prefix = '') {
  const element = document.getElementById(id);
  if (!element) return;

  if (element.tagName.toLowerCase() === 'a') {
    if (!value) {
      element.textContent = '';
      element.removeAttribute('href');
      return;
    }

    element.textContent = value;
    if (prefix && !/^https?:\/\//i.test(value) && !value.startsWith(prefix)) {
      element.href = `${prefix}${value}`;
    } else if (/^https?:\/\//i.test(value) || value.startsWith('mailto:') || value.startsWith('tel:')) {
      element.href = value;
    } else {
      element.href = prefix ? `${prefix}${value}` : value;
    }
    return;
  }

  element.textContent = value;
}

function generateCV() {
  setLinkOrText('nameT', sanitize(document.getElementById('nameField').value) || 'Your Name');
  setLinkOrText('addressT', sanitize(document.getElementById('addressField').value));
  setLinkOrText('contactT', sanitize(document.getElementById('contactField').value), 'tel:');
  setLinkOrText('emailT', sanitize(document.getElementById('emailField').value), 'mailto:');
  setLinkOrText('lkT', sanitize(document.getElementById('lkField').value), 'https://');
  setLinkOrText('ttT', sanitize(document.getElementById('ttField').value), 'https://');
  setLinkOrText('wbT', sanitize(document.getElementById('wbField').value), 'https://');
  setLinkOrText('gtT', sanitize(document.getElementById('gtField').value), 'https://');
  setLinkOrText('pfT', sanitize(document.getElementById('pfField').value));
  setLinkOrText('psT', sanitize(document.getElementById('psField').value));

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

document.getElementById('download').style.display = 'none';
document.getElementById('goback').style.display = 'none';
