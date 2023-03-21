import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chat_container = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
};


//function to ensure that we see the ai typing
function typeText(element, text)
{
  let index = 0;

  let interval = setInterval(() => {
    //check if ai has not finished printing output
    if(index < text.length)
    {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else 
    {
      clearInterval(interval);
    }
  }, 20);
}

//generate unique id for messages to keep the tracked
function generateUniqueId()
{
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

//chat stripe wysiwyg
function chatStripe(isAi, value, uniqueId)
{
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi ? bot : user}"
              alt="${isAi ? user : bot}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's charstripe
  chat_container.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //bot's charstripe
  const uniqueId = generateUniqueId();
  chat_container.innerHTML += chatStripe(true, " ", uniqueId);
  chat_container.scrollTop = chat_container.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  //fetch data from bot server
  const response = await fetch('https://m-ai.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok)
  {
    const data = await response.json();
    const parsedData =  data.bot.trim();

    typeText(messageDiv, parsedData);
  }
  else 
  {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if(e.keyCode === 13)
  {
    handleSubmit(e);
  }
})