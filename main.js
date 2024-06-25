import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import MarkdownIt from 'markdown-it';
import './style.css';

// 🔥 FILL THIS OUT FIRST! 🔥
// 🔥 GET YOUR GEMINI API KEY AT 🔥
// 🔥 https://g.co/ai/idxGetGeminiKey 🔥
let API_KEY = 'YOUR_API_KEY';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ],
});

const chat = model.startChat({
  history: [],
  generationConfig: {
    maxOutputTokens: 100
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const title = "Let's Ask";
  document.getElementById('animated-title').innerText = title;
});

const form = document.getElementById('chat-form');
const promptInput = document.querySelector('input[name="prompt"]');
const chatContainer = document.getElementById('chat-container');

// Update stats whenever a message is sent
form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const userInput = promptInput.value.trim(); // Ensure input is trimmed
  if (!userInput) return; // Skip if input is empty

  console.log('User Input:', userInput); // Debug log

  // Display user message in chat
  displayUserMessage(userInput);

  // Clear input field immediately after displaying user message
  promptInput.value = ''; 
  console.log('Prompt after clearing:', promptInput.value); // Debug log

  // Send user input to AI model
  try {
    const result = await chat.sendMessageStream(userInput);
    const botResponse = await processBotResponse(result);

    // Display bot response in chat with typing animation
    await displayBotMessageWithTyping(botResponse);
  } catch (e) {
    displayBotMessage('Error: ' + e.message);
  }
});

function displayUserMessage(message) {
  const bubble = createChatBubble(message, 'user-bubble');
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function displayBotMessageWithTyping(message) {
  const bubble = createChatBubble('', 'bot-bubble');
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Animate typing effect
  const typingElement = document.createElement('span');
  typingElement.classList.add('typing');
  bubble.querySelector('p').appendChild(typingElement);

  for (let i = 0; i < message.length; i++) {
    typingElement.innerHTML = message.substring(0, i + 1);
    await new Promise(resolve => setTimeout(resolve, 50)); // Adjust typing speed here
    bubble.querySelector('p').scrollIntoView({ behavior: "smooth", block: "end" });
  }

  typingElement.classList.remove('typing');
  typingElement.innerHTML = message; // Set final message after typing
}

async function processBotResponse(result) {
  let buffer = [];
  let md = new MarkdownIt();
  for await (let response of result.stream) {
    buffer.push(response.text());
  }
  return md.render(buffer.join(''));
}

function createChatBubble(message, type) {
  const bubble = document.createElement('div');
  bubble.classList.add(type);
  bubble.innerHTML = `<p>${message}</p>`;
  bubble.style.wordWrap = "break-word";
  return bubble;
}

const themeToggle = document.querySelector('.theme-checkbox');

// Event listener for checkbox change
themeToggle.addEventListener('change', function() {
  if (this.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});

// Event listener for Enter key press
promptInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});

const faqContent = `
  <h2>FAQ</h2>
  <ul>
    <li><a href="#" data-question="What is Let's Ask?">What is Let's Ask?</a></li>
    <li><a href="#" data-question="How to use the chat?">How to use the chat?</a></li>
    <li><a href="#" data-question="How to switch themes?">How to switch themes?</a></li>
  </ul>
`;

const resourcesContent = `
  <h2>Resources</h2>
  <ul>
    <li><a href="https://gemini.google.com/app">Gemini AI</a></li>
    <li><a href="https://ai.google.dev/">Api Google Dev</a></li>
  </ul>
`;

document.getElementById('faq-link').addEventListener('click', event => {
  event.preventDefault();
  showDetailContent(faqContent);
});

document.getElementById('resources-link').addEventListener('click', event => {
  event.preventDefault();
  showDetailContent(resourcesContent);
});

function addFAQEventListeners() {
  document.querySelectorAll('ul li a').forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      const question = event.target.getAttribute('data-question');
      if (question) {
        handleFAQClick(question);
      }
    });
  });
}

const quotes = [
  "The best way to predict the future is to invent it. - Alan Kay",
  "Life is 10% what happens to us and 90% how we react to it. - Charles R. Swindoll",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "If you are not willing to risk the usual, you will have to settle for the ordinary. - Jim Rohn"
];

const trendingQuestions = [
  {
    group: "Artificial Intelligence",
    questions: [
      "How does AI work?",
      "What are the ethical implications of AI?",
      "How to improve machine learning models?"
    ]
  },
  {
    group: "Web Development",
    questions: [
      "What are the best practices for web development?",
      "How to secure web applications?"
    ]
  },
  {
    group: "Digital Marketing",
    questions: [
      "What is digital marketing?",
      "How to create an effective digital marketing strategy?"
    ]
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const questionGroupsContainer = document.getElementById('question-groups');

  trendingQuestions.forEach(group => {
    const groupElement = document.createElement('div');
    groupElement.classList.add('question-group');

    const groupTitle = document.createElement('button');
    groupTitle.classList.add('group-title');
    groupTitle.textContent = group.group;
    groupTitle.addEventListener('click', () => toggleQuestionList(groupElement));

    const questionsList = document.createElement('ul');
    questionsList.classList.add('questions-list');

    group.questions.forEach(question => {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = question;
      link.dataset.question = question;
      link.addEventListener('click', handleTrendingQuestionClick);
      listItem.appendChild(link);
      questionsList.appendChild(listItem);
    });

    groupElement.appendChild(groupTitle);
    groupElement.appendChild(questionsList);
    questionGroupsContainer.appendChild(groupElement);
  });
});

function toggleQuestionList(groupElement) {
  groupElement.classList.toggle('open');
}

function handleTrendingQuestionClick(event) {
  event.preventDefault();
  const question = event.target.dataset.question;
  if (question) {
    const promptInput = document.querySelector('input[name="prompt"]');
    promptInput.value = question;
    const form = document.getElementById('chat-form');
    form.dispatchEvent(new Event('submit'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('quote').innerText = randomQuote;
});

function handleFAQClick(question) {
  // Simulate user input
  promptInput.value = question;
  form.dispatchEvent(new Event('submit'));
}

function showDetailContent(content) {
  const contentBody = document.getElementById('content-body');
  contentBody.innerHTML = content;
  const detailContent = document.getElementById('detail-content');
  detailContent.classList.add('open');

  // Add event listener for dynamically added content
  addFAQEventListeners();
}

document.getElementById('close-button').addEventListener('click', () => {
  const detailContent = document.getElementById('detail-content');
  detailContent.classList.remove('open');
});

// Initially add event listeners to FAQ links
addFAQEventListeners();

