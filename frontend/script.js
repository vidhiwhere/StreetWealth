// Dummy Data for Loans and Literacy Modules
// ... (Keep all previous code up to LOANS array)

const LOANS = [
  {
    name: "PM Svanidhi",
    details: "Affordable working capital loan up to ₹10,000 for street vendors with subsidy on timely repayment.",
    eligibility: "Vendor must have vending certificate or ID card.",
    link: "https://pmsvanidhi.mohua.gov.in/"
  },
  {
    name: "Mudra Yojana",
    details: "Micro-loans for small businesses: Shishu (up to ₹50,000), Kishor, and Tarun. No collateral required.",
    eligibility: "Available to all micro/unorganised businesses.",
    link: "https://www.mudra.org.in/"
  },
  {
    name: "Stand Up India",
    details: "Loans between ₹10L and ₹1Cr for SC/ST and women entrepreneurs.",
    eligibility: "Eligible if SC/ST or women above 18.",
    link: "https://www.standupmitra.in/"
  }
];



const LITERACY_MODULES = [
  {
    title: "How to Save Daily",
    desc: "Tips to help you save a little every day, so you're ready for rainy days and future investments.",
    file: "save_daily.ppt" // Replace with your actual PPT file name
  },
  {
    title: "Understanding Interest",
    desc: "Learn how bank interest works—what's the difference between simple and compound interest?",
    file: "understanding_interest.ppt" // Replace with your actual PPT file name
  },
  {
    title: "UPI Basics",
    desc: "A simple guide to cashless transactions using UPI and QR codes.",
    file: "upi_basics.ppt" // Replace with your actual PPT file name
  },
  {
    title: "Budgeting Your Business",
    desc: "Easy ways to plan your spending, increase earnings, and avoid unnecessary expenses.",
    file: "budgeting_business.ppt" // Replace with your actual PPT file name
  },
  {
    title: "Documents for Loans",
    desc: "List of basic documents you need for loan applications.",
    file: "documents_for_loans.ppt" // Replace with your actual PPT file name
  }
];
// Page Navigation Logic
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  if (pageId === 'ledger' || pageId === 'upi') {
    document.getElementById('ledger').classList.add('active');
    document.getElementById('upi').classList.add('active');
  } else {
    document.getElementById(pageId).classList.add('active');
  }
  document.querySelectorAll('.nav-link').forEach(i => i.classList.remove('active'));
  let navSelector = { home: 0, ledger: 1, loans: 2, learn: 3 };
  if (navSelector[pageId] !== undefined)
    document.querySelectorAll('.nav-link')[navSelector[pageId]].classList.add('active');
}
showPage('home');

// Ledger Logic
async function renderLedger() {
  const body = document.querySelector("#ledger-table tbody");
  body.innerHTML = '';
  let totalIncome = 0, totalExpense = 0;
  const entries = await fetchLedgerEntries();
  entries.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.desc}</td>
      <td class="${e.type === 'income' ? 'tx-income' : 'tx-expense'}">${e.type.charAt(0).toUpperCase() + e.type.slice(1)}</td>
      <td>${e.amount.toFixed(2)}</td>
    `;
    body.appendChild(tr);
    if (e.type === 'income') totalIncome += e.amount;
    else totalExpense += e.amount;
  });
  document.getElementById('ledger-summary').innerHTML = `
    <span><b>Total Income:</b> ₹${totalIncome.toFixed(2)}</span>
    <span><b>Expenses:</b> ₹${totalExpense.toFixed(2)}</span>
    <span><b>Balance:</b> ₹${(totalIncome - totalExpense).toFixed(2)}</span>
  `;
}

async function fetchLedgerEntries() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  try {
    const res = await fetch('http://localhost:4000/api/ledger/my-entries', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Failed to fetch entries');
    return await res.json();
  } catch (err) {
    console.error('Error fetching ledger entries:', err);
    return [];
  }
}

document.getElementById('ledger-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to add entries.');
    return;
  }
  const amount = parseFloat(document.getElementById('amount').value);
  const desc = document.getElementById('desc').value;
  const date = document.getElementById('date').value;
  const type = document.getElementById('type').value;
  if (amount > 0 && desc && date) {
    try {
      const res = await fetch('http://localhost:4000/api/ledger/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ date, desc, type, amount })
      });
      if (res.ok) {
        renderLedger();
        this.reset();
        // Calculate and notify cashflow status
        const entries = await fetchLedgerEntries();
        const { totalIncome, totalExpense } = entries.reduce((acc, e) => {
          if (e.type === 'income') acc.totalIncome += e.amount;
          else acc.totalExpense += e.amount;
          return acc;
        }, { totalIncome: 0, totalExpense: 0 });
        const cashflowStatus = getCashflowStatus(totalIncome, totalExpense);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Cashflow Status Update`, {
            body: `${cashflowStatus} - Income: ₹${totalIncome.toFixed(2)}, Expenses: ₹${totalExpense.toFixed(2)}`,
            icon: '/path/to/icon.png' // Optional: Add an icon URL if desired
          });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(`Cashflow Status Update`, {
                body: `${cashflowStatus} - Income: ₹${totalIncome.toFixed(2)}, Expenses: ₹${totalExpense.toFixed(2)}`,
                icon: '/path/to/icon.png' // Optional
              });
            }
          });
        }
      } else {
        alert('Error adding ledger entry');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to add ledger entry');
    }
  }
});

// Function to determine cashflow status
function getCashflowStatus(totalIncome, totalExpense) {
  const balance = totalIncome - totalExpense;
  const expenseRatio = totalExpense / totalIncome || 0;

  if (totalIncome === 0 && totalExpense > 0) {
    return 'Excess Expense - No Income Recorded';
  } else if (expenseRatio > 0.8) {
    return 'Excess Expense - High Spending';
  } else if (expenseRatio <= 0.8 && balance >= 0) {
    return 'Stable - Balanced Finances';
  } else if (balance > totalExpense * 0.2) {
    return 'Surplus - Healthy Cashflow';
  } else {
    return 'Uncertain - Monitor Finances';
  }
}

// UPI Transactions Logic
async function renderUPI() {
  const body = document.querySelector("#upi-table tbody");
  body.innerHTML = '';
  const entries = await fetchUPIEntries();
  entries.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${e.desc}</td>
      <td>${e.amount.toFixed(2)}</td>
    `;
    body.appendChild(tr);
  });
}

async function fetchUPIEntries() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  try {
    const res = await fetch('http://localhost:4000/api/upi/my-entries', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) throw new Error('Failed to fetch UPI entries');
    return await res.json();
  } catch (err) {
    console.error('Error fetching UPI entries:', err);
    return [];
  }
}

document.getElementById('upi-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please log in to add UPI entries.');
    return;
  }
  const amount = parseFloat(document.getElementById('upi-amount').value);
  const desc = document.getElementById('upi-desc').value;
  const date = document.getElementById('upi-date').value;
  if (amount > 0 && desc && date) {
    try {
      const res = await fetch('http://localhost:4000/api/upi/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ date, desc, amount })
      });
      if (res.ok) {
        renderUPI();
        this.reset();
      } else {
        alert('Error adding UPI entry');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to add UPI entry');
    }
  }
});

// Receipt Scanning Logic
const imgInput = document.getElementById('receipt-image-input');
const scanBtn = document.getElementById('scan-receipt-btn');
const statusDiv = document.getElementById('ocr-status');
const outputBox = document.getElementById('ocr-output');
const detailsBox = document.getElementById('extracted-details');
const amtField = document.getElementById('extracted-amount');
const dateField = document.getElementById('extracted-date');
const useBtn = document.getElementById('use-extracted-btn');

function extractAmount(text) {
  const amtRegex = /(?:₹|Rs\.?|INR)?\s?([0-9]+(?:[.,][0-9]{1,2})?)/ig;
  let match, last;
  while ((match = amtRegex.exec(text)) !== null) { last = match[1]; }
  const totalRegex = /Total[^0-9]{0,10}([0-9]+(?:[.,][0-9]{1,2})?)/i;
  const totalMatch = text.match(totalRegex);
  if (totalMatch && totalMatch[1]) return totalMatch[1];
  return last || "";
}

function extractDate(text) {
  let cleanText = text.replace(/[OlI|]/g, x => {
    if (x === 'O') return '0';
    if (x === 'l' || x === 'I' || x === '|') return '1';
    return x;
  });
  const dateRegex = /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/g;
  const dateLineRegex = /(date[:\s]*)(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})/i;
  const labeledLine = cleanText.match(dateLineRegex);
  if (labeledLine && labeledLine[2]) return labeledLine[2];
  const match = cleanText.match(dateRegex);
  return match ? match[0] : "";
}

scanBtn.addEventListener('click', function() {
  if (!imgInput.files || !imgInput.files[0]) {
    statusDiv.innerText = 'Please select a receipt image first.';
    return;
  }
  statusDiv.innerText = 'Scanning... Please wait.';
  outputBox.value = '';
  detailsBox.style.display = "none";
  amtField.textContent = "-";
  dateField.textContent = "-";

  Tesseract.recognize(
    imgInput.files[0],
    'eng',
    {
      logger: m => {
        if (m.status === "recognizing text") {
          statusDiv.innerText = `Scanning... (${Math.round(m.progress * 100)}%)`;
        }
      }
    }
  ).then(async result => {
    const text = result.data.text.trim();
    outputBox.value = text;
    statusDiv.innerText = 'Scan complete!';
    const amt = extractAmount(text);
    const date = extractDate(text);
    if (amt || date) {
      detailsBox.style.display = "block";
      amtField.textContent = amt || "-";
      dateField.textContent = date || "-";
      // Save receipt data to backend
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch('http://localhost:4000/api/receipts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ amount: parseFloat(amt) || 0, date, desc: 'Receipt Scan' })
          });
        } catch (err) {
          console.error('Error saving receipt:', err);
        }
      }
    } else {
      detailsBox.style.display = "none";
    }
  });
});

useBtn.addEventListener('click', function() {
  const amountInput = document.getElementById('amount');
  const dateInput = document.getElementById('date');
  const descInput = document.getElementById('desc');
  amountInput.value = amtField.textContent !== "-" ? amtField.textContent : "";
  dateInput.value = dateField.textContent !== "-" ? dateField.textContent : "";
  descInput.value = "From Receipt Scan";
  amountInput.focus();
});

// Loans Logic
function renderLoans() {
  const grid = document.getElementById('loans-list');
  grid.innerHTML = '';
  LOANS.forEach(loan => {
    const card = document.createElement('div');
    card.className = 'loan-card';
    card.innerHTML = `
      <h4>${loan.name}</h4>
      <p>${loan.details}</p>
      <p><b>Eligibility:</b> ${loan.eligibility}</p>
      <a href="${loan.link}" target="_blank" class="apply-link">Apply</a>
    `;
    grid.appendChild(card);
  });
}
renderLoans();

// Financial Literacy Logic
function renderModules() {
  const grid = document.getElementById('modules-list');
  grid.innerHTML = '';
  LITERACY_MODULES.forEach(m => {
    const card = document.createElement('div');
    card.className = 'literacy-card';
    card.innerHTML = `
      <div>
        <h4>${m.title}</h4>
        <p>${m.desc}</p>
      </div>
      <a href="${m.file}" target="_blank" class="start-link" download>Download PPT</a>
    `;
    grid.appendChild(card);
  });
}
renderModules();


// Chatbot Logic
const FAQS = [
  {
    keywords: ["loan", "pm svanidhi", "microloan", "mudra", "borrow", "credit"],
    answer: "StreetWealth helps you learn about government-backed loans like <b>PM Svanidhi</b> and <b>Mudra Yojana</b>. Check the Loans page for details. Log your entries to build your digital credit profile."
  },
  {
    keywords: ["ledger", "record", "expense", "income", "balance"],
    answer: "On the Digital Ledger page, you can easily record all your business incomes and expenses. Use this regularly to always know your balance!"
  },
  {
    keywords: ["upi", "digital payment", "pay", "payment", "qr"],
    answer: "You can track all your UPI sales and payments in the separate UPI section on the app. This helps you stay on top of all digital transactions."
  },
  {
    keywords: ["financial literacy", "learn", "module", "training"],
    answer: "Explore our gamified learning modules in the Learn section! Topics include budgeting, saving, UPI basics, and more."
  },
  {
    keywords: ["document", "required", "eligibility", "apply"],
    answer: "Basic documents (vending certificate, Aadhaar, etc.) are needed for most loan schemes. See eligibility on the Loans page before applying."
  },
  {
    keywords: ["hello", "hi", "namaste", "help"],
    answer: "Namaste! Ask me about loans, ledgers, UPI, or financial tips. I'm here to help!"
  }
];

function toggleChatbotPopup() {
  const pop = document.getElementById('chatbot-popup');
  pop.classList.toggle('open');
  if (pop.classList.contains('open')) {
    setTimeout(() => {
      document.getElementById('chatbot-input').focus();
    }, 200);
  }
}

function addChatBubble(text, who = 'bot') {
  const msgBox = document.getElementById('chatbot-messages');
  const div = document.createElement('div');
  div.className = 'chat-bubble' + (who === 'user' ? ' user' : '');
  div.innerHTML = text;
  msgBox.appendChild(div);
  msgBox.scrollTop = msgBox.scrollHeight;
}

function chatbotReply(question) {
  question = question.toLowerCase();
  for (const faq of FAQS) {
    for (const kw of faq.keywords) {
      if (question.includes(kw)) {
        return faq.answer;
      }
    }
  }
  return "Sorry, I didn't understand that. Please ask about <b>ledger, loans, payments,</b> or <b>financial literacy</b>.";
}

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById('chatbot-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('chatbot-input');
    const msg = input.value.trim();
    if (!msg) return;
    addChatBubble(msg, 'user');
    setTimeout(() => {
      const reply = chatbotReply(msg);
      addChatBubble(reply, 'bot');
      document.getElementById('chatbot-messages').scrollTop = 9999;
    }, 320);
    input.value = '';
  });

  // Authentication Logic
  const showLoginBtn = document.getElementById('show-login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const authModal = document.getElementById('auth-modal');
  const closeAuthModal = document.getElementById('close-auth-modal');

  showLoginBtn.onclick = function() {
    authModal.style.display = 'block';
    document.getElementById('auth-message').innerText = '';
  };

  closeAuthModal.onclick = function() {
    authModal.style.display = 'none';
  };

  window.onclick = function(event) {
    if (event.target == authModal) {
      authModal.style.display = 'none';
    }
  };

  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        document.getElementById('auth-message').style.color = "green";
        document.getElementById('auth-message').innerText = "Login successful!";
        setTimeout(() => {
          authModal.style.display = 'none';
          updateAuthButtons();
          renderLedger();
          renderUPI();
        }, 800);
      } else {
        document.getElementById('auth-message').style.color = "#e14040";
        document.getElementById('auth-message').innerText = data.message || 'Login failed';
      }
    } catch (err) {
      document.getElementById('auth-message').style.color = "#e14040";
      document.getElementById('auth-message').innerText = 'Error logging in';
    }
  };

  document.getElementById('signup-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        document.getElementById('auth-message').style.color = "green";
        document.getElementById('auth-message').innerText = "Signup successful!";
        setTimeout(() => {
          authModal.style.display = 'none';
          updateAuthButtons();
          renderLedger();
          renderUPI();
        }, 800);
      } else {
        document.getElementById('auth-message').style.color = "#e14040";
        document.getElementById('auth-message').innerText = data.message || 'Signup failed';
      }
    } catch (err) {
      document.getElementById('auth-message').style.color = "#e14040";
      document.getElementById('auth-message').innerText = 'Error signing up';
    }
  };

  logoutBtn.onclick = () => {
    localStorage.removeItem('token');
    updateAuthButtons();
    document.querySelector("#ledger-table tbody").innerHTML = '';
    document.querySelector("#upi-table tbody").innerHTML = '';
    document.getElementById('ledger-summary').innerHTML = '';
    alert('You have successfully logged out.');
  };

  function updateAuthButtons() {
    if (localStorage.getItem('token')) {
      logoutBtn.style.display = 'inline-block';
      showLoginBtn.style.display = 'none';
    } else {
      logoutBtn.style.display = 'none';
      showLoginBtn.style.display = 'inline-block';
    }
  }

  updateAuthButtons();
  renderLedger();
  renderUPI();
});