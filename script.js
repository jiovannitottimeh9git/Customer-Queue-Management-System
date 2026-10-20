// QueueFlow Queue Management System
// The queue is a JavaScript array and follows FIFO: First In, First Out.

const STORAGE_KEY = "queueflow-state-v1";

const defaultCustomers = [
  { id: 101, name: "Ama Mensah", service: "Payment", initials: "AM" },
  { id: 102, name: "Kofi Owusu", service: "Registration", initials: "KO" },
  { id: 103, name: "Abena Boateng", service: "General enquiry", initials: "AB" }
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.queue)) {
      return {
        queue: saved.queue,
        served: Number.isFinite(saved.served) ? saved.served : 12,
        nowServing: saved.nowServing || null
      };
    }
  } catch (error) {
    console.warn("Could not load saved queue:", error);
  }

  return { queue: defaultCustomers, served: 12, nowServing: null };
}

let state = loadState();
let nextId = Math.max(104, ...state.queue.map(customer => customer.id + 1));
let toastTimer;

// A temporary manual override for the estimated waiting time.
// It resets automatically when the queue changes.
let waitTimeReset = false;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function render() {
  const list = document.getElementById("queueList");
  document.getElementById("queueCount").textContent = state.queue.length;
  document.getElementById("servedCount").textContent = state.served;

  const estimatedWait = waitTimeReset ? 0 : state.queue.length * 3;
  document.getElementById("waitTime").innerHTML = `${estimatedWait} <small>min</small>`;

  document.getElementById("liveBadge").textContent = `${state.queue.length} waiting`;
  document.getElementById("heroServing").textContent = state.nowServing ? state.nowServing.name : "—";

  if (!state.queue.length) {
    list.innerHTML = '<div class="empty-state"><strong>Your queue is clear</strong>New arrivals will appear here.</div>';
  } else {
    const avatarColors = [
      ["#eeeaff", "#6657e8"],
      ["#e4f8ef", "#219b6a"],
      ["#fff0e2", "#d88935"],
      ["#e8f3ff", "#3b80c8"]
    ];

    list.innerHTML = state.queue.map((customer, index) => {
      const colors = avatarColors[index % avatarColors.length];
      return `<div class="queue-row">
        <div class="customer">
          <div class="customer-avatar" style="background:${colors[0]};color:${colors[1]}">${escapeHtml(customer.initials || initials(customer.name))}</div>
          <div>
            <div class="customer-name">${escapeHtml(customer.name)}</div>
            <div class="customer-id">Ticket #${customer.id}</div>
          </div>
        </div>
        <div class="service-name">${escapeHtml(customer.service)}</div>
        <span class="status-pill">${index === 0 ? "Next up" : "Waiting"}</span>
      </div>`;
    }).join("");
  }

  document.getElementById("nextBtn").disabled = state.queue.length === 0;
  document.getElementById("nextBtn").style.opacity = state.queue.length === 0 ? ".5" : "1";
  saveState();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Add a customer to the back of the queue (enqueue).
document.getElementById("customerForm").addEventListener("submit", event => {
  event.preventDefault();

  const nameInput = document.getElementById("customerName");
  const name = nameInput.value.trim();
  const service = document.getElementById("serviceType").value;

  if (!name) {
    showToast("Please enter a customer name.");
    nameInput.focus();
    return;
  }

  waitTimeReset = false;
  state.queue.push({
    id: nextId++,
    name,
    service,
    initials: initials(name)
  });

  render();
  event.target.reset();
  nameInput.focus();
  showToast(`${name} has been added to the queue.`);
});

// Serve the first customer in the queue (dequeue).
document.getElementById("nextBtn").addEventListener("click", () => {
  if (!state.queue.length) return;

  waitTimeReset = false;
  state.nowServing = state.queue.shift();
  state.served += 1;

  render();
  showToast(`Now serving ${state.nowServing.name}.`);
});

// Reset the number of customers helped today without changing the queue.
document.getElementById("resetServedBtn").addEventListener("click", () => {
  if (state.served === 0) {
    showToast("The served count is already zero.");
    return;
  }

  if (!confirm("Reset the number of customers served today to zero? This will not clear the waiting queue.")) {
    return;
  }

  state.served = 0;
  render();
  showToast("Today's served count has been reset.");
});

// Reset the displayed estimated waiting time.
// The estimate is calculated again when the queue changes.
document.getElementById("resetWaitBtn").addEventListener("click", () => {
  if (waitTimeReset) {
    showToast("Estimated wait is already reset.");
    return;
  }

  if (!confirm("Reset the estimated waiting time to zero? It will be recalculated when the queue changes.")) {
    return;
  }

  waitTimeReset = true;
  render();
  showToast("Estimated waiting time has been reset.");
});

// Clear everyone currently waiting.
document.getElementById("clearBtn").addEventListener("click", () => {
  if (!state.queue.length) {
    showToast("The queue is already empty.");
    return;
  }

  if (!confirm("Clear everyone currently waiting in the queue?")) return;

  waitTimeReset = false;
  state.queue = [];
  render();
  showToast("Waiting queue cleared.");
});

render();
