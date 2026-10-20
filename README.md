# QueueFlow — Queue Management System

A small queue-management web app demonstrating the **Queue** data structure using the **FIFO (First In, First Out)** rule.

## Files
- `index.html` — app layout and form
- `style.css` — responsive styling
- `script.js` — queue operations and browser local storage

## How to run in VS Code
1. Extract `Queue_Management_System.zip`.
2. Open the extracted `Queue_Management_System` folder in VS Code.
3. Open `index.html` in a browser. Recommended: install the **Live Server** extension, right-click `index.html`, and choose **Open with Live Server**.
4. Add a customer, then click **Call next customer** to serve the first person in line.

No Java installation, server, or external database is required.

## Where the queue is used
- **Enqueue:** `state.queue.push(customer)` adds a new customer to the back.
- **Dequeue:** `state.queue.shift()` removes the customer at the front when the next customer is called.
- **FIFO:** the first customer added is the first customer served.
- **Persistence:** `localStorage` saves the queue and served count in the browser so refreshing the page keeps the data.

## Note
The first visit includes three sample customers and a sample served count to demonstrate the interface. Use **Clear queue** to empty the waiting list. Data is stored in the current browser on the current device.

## Reset estimated wait
The Estimated Wait card includes a **Reset count** button. It temporarily sets the displayed estimate to 0 minutes without deleting waiting customers. When a customer is added, served, or the queue is cleared, the estimate returns to its normal calculation (3 minutes per waiting customer).
