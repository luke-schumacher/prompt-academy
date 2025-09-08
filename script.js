document.addEventListener('DOMContentLoaded', () => {
  // State and constants
  let currentPromptId = null;
  let layerCards = [];
  let layerIndex = 0;

  // Get elements from the DOM
  const screenHero = document.getElementById('screen-hero');
  const screenPrompts = document.getElementById('screen-prompts');
  const screenResponses = document.getElementById('screen-responses');
  const screenLayers = document.getElementById('screen-layers');
  const screenFinal = document.getElementById('screen-final');

  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');

  const promptList = document.getElementById('prompt-list');
  const customInput = document.getElementById('custom-input');
  const customButton = document.getElementById('custom-btn');

  const tagline = document.getElementById('tagline');
  const messageText = document.getElementById('message-text');
  const messageButton = document.getElementById('message-btn');
  const responsesContainer = document.getElementById('responses-container');

  const layerContainer = document.getElementById('layer-container');
  const peelButton = document.getElementById('peel-btn');

  // Utility to create elements with classes
  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  
  // ----- UI Building Functions -----

  // Build the prompt selection list
  function buildPromptList() {
    promptList.innerHTML = '';
    prompts.forEach(p => {
      const item = createEl('div', 'prompt-list__item', p.text);
      item.addEventListener('click', () => choosePrompt(p.id));
      promptList.appendChild(item);
    });
  }

  // Build the response cards (called once)
  const responseCards = [];
  function buildResponseCards() {
    responsesContainer.innerHTML = '';
    systemPrompts.forEach((prompt, i) => {
      const card = createEl('div', 'response-card');
      const cardInner = createEl('div', 'card-inner');
      
      const front = createEl('div', 'card-face card-front');
      front.appendChild(createEl('div', 'card-title', 'Response'));
      const frontContent = createEl('div', 'card-content');
      front.appendChild(frontContent);
      
      const back = createEl('div', 'card-face card-back');
      back.appendChild(createEl('div', 'card-title', prompt.title));
      back.appendChild(createEl('div', 'card-content', prompt.description));
      
      cardInner.appendChild(front);
      cardInner.appendChild(back);
      card.appendChild(cardInner);
      responsesContainer.appendChild(card);
      responseCards.push({ cardInner, frontContent });
    });
  }

  // Build the layered instruction cards
  function buildLayers() {
    layerContainer.innerHTML = '';
    layerCards = [];
    layers.forEach(layer => {
      const card = createEl('div', 'layer-card');
      card.appendChild(createEl('h3', null, layer.title));
      card.appendChild(createEl('p', null, layer.content));
      if (layer.conflict) {
        card.classList.add('layer-card--conflict');
      }
      layerContainer.appendChild(card);
      layerCards.push(card);
    });
    layerIndex = 0;
    updateLayerPositions();
  }
  
  // ----- Screen Transition & Logic Functions -----

  function choosePrompt(id) {
    currentPromptId = id;
    responseCards.forEach((card, idx) => {
      card.cardInner.classList.remove('flipped');
      card.frontContent.textContent = 'typing…';
      card.frontContent.classList.add('typing');
      
      const fullText = responses[id][idx];
      setTimeout(() => {
        card.frontContent.classList.remove('typing');
        card.frontContent.textContent = '';
        let i = 0;
        const interval = setInterval(() => {
          card.frontContent.textContent += fullText.charAt(i);
          i++;
          if (i >= fullText.length) clearInterval(interval);
        }, 20);
      }, 500 + idx * 200);
    });

    tagline.textContent = 'All answers below come from the same model.';
    tagline.classList.remove('revealed');
    messageText.textContent = 'But why do these answers sound so different?';
    messageText.classList.add('curious');
    messageButton.textContent = 'Reveal the masks';
    messageButton.onclick = () => revealPrompts();
    messageButton.classList.add('pulse-button');
    
    screenPrompts.classList.add('hidden');
    screenResponses.classList.remove('hidden');
  }

  function revealPrompts() {
    responseCards.forEach((card, idx) => {
      setTimeout(() => card.cardInner.classList.add('flipped'), idx * 300);
    });

    tagline.textContent = 'Masks revealed';
    tagline.classList.add('revealed');
    messageText.classList.remove('curious');
    messageText.textContent = 'Behind every response lie hidden instructions that shape the kind of answer you get.';
    messageButton.textContent = 'Continue';
    messageButton.onclick = () => showLayers();
    messageButton.classList.remove('pulse-button');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showLayers() {
    screenResponses.classList.add('hidden');
    buildLayers();
    peelButton.textContent = 'Reveal next layer';
    peelButton.onclick = () => peelLayer();
    screenLayers.classList.remove('hidden');
  }

  function showFinal() {
    screenLayers.classList.add('hidden');
    screenFinal.classList.remove('hidden');
  }

  function updateLayerPositions() {
    const offsetY = 20;
    const scaleStep = 0.02;
    for (let i = layerIndex; i < layerCards.length; i++) {
      const card = layerCards[i];
      const pos = i - layerIndex;
      card.style.transform = `translateY(${pos * offsetY}px) scale(${1 - pos * scaleStep})`;
      card.style.zIndex = `${layerCards.length - i}`;
      card.style.display = '';
      card.classList.remove('removed');
    }
  }

  function peelLayer() {
    if (layerIndex >= layerCards.length) return;
    
    const card = layerCards[layerIndex];
    card.classList.add('removed');
    
    setTimeout(() => {
      card.style.display = 'none';
      layerIndex++;
      if (layerIndex < layerCards.length) {
        updateLayerPositions();
        peelButton.textContent = (layerIndex < layerCards.length - 1) ? 'Reveal next layer' : 'Continue';
      } else {
        showFinal();
      }
    }, 600);
  }
  
  // ----- Event Listeners -----

  startBtn.addEventListener('click', () => {
    screenHero.classList.add('hidden');
    screenPrompts.classList.remove('hidden');
  });

  restartBtn.addEventListener('click', () => {
    screenFinal.classList.add('hidden');
    screenPrompts.classList.remove('hidden');
  });

  customButton.addEventListener('click', () => {
    const text = customInput.value.trim();
    if (!text) return;
    
    const capitalised = text.charAt(0).toUpperCase() + text.slice(1);
    responses['custom'] = [
      `This is a thoughtful question: ${text}. Reflect on your deeper motivations and how the outcome aligns with your values.`,
      `Absolutely! ${capitalised} sounds like a great idea — embrace it with enthusiasm and see where it takes you.`,
      `Here are some factual considerations about ${text}. It’s important to weigh pros and cons before deciding.`
    ];
    choosePrompt('custom');
  });

  // ----- Initialisation -----
  
  buildPromptList();
  buildResponseCards();
});