import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRrHfSjIQNiZJMsa-Ycvr5t5aM69VV8co",
  authDomain: "creative-handmade-orders.firebaseapp.com",
  projectId: "creative-handmade-orders",
  storageBucket: "creative-handmade-orders.appspot.com",
  messagingSenderId: "783106711784",
  appId: "1:783106711784:web:12104ec53b7b0dae82295d",
  measurementId: "G-42467KSBWS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Arrays to store orders and history
let orders = [];
let history = [];

// Handle image preview
document.getElementById('image').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Handle form submission
document.getElementById('orderForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const image = document.getElementById('image').files[0];
    const date = document.getElementById('date').value;
    const place = document.getElementById('place').value;
    const number1 = document.getElementById('number1').value;
    const number2 = document.getElementById('number2').value;
    const amount = document.getElementById('amount').value;

    if (image && date && place && number1 && number2 && amount) {
        const reader = new FileReader();
        reader.onload = function(e) {
            orders.push({
                image: e.target.result,
                date,
                place,
                number1,
                number2,
                amount,
                done: false,
                timestamp: new Date().toISOString()
            });
            displayOrders();
            document.getElementById('orderForm').reset();
            document.getElementById('imagePreview').style.display = 'none';
        };
        reader.readAsDataURL(image);
    } else {
        alert('Please fill out all fields.');
    }
});

// Display submitted orders
function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders submitted yet.</p>';
    } else {
        orders.forEach((order, index) => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.style.position = 'relative';

            orderItem.innerHTML = `
                <h3>Order #${index + 1}</h3>
                <img src="${order.image}" alt="Order Image" style="max-width: 100%; height: auto;">
                <p><strong>Date:</strong> ${order.date}</p>
                <p><strong>Place:</strong> ${order.place}</p>
                <p><strong>1st Contact Number:</strong> ${order.number1}</p>
                <p><strong>2nd Contact Number:</strong> ${order.number2}</p>
                <p><strong>Amount:</strong> $${order.amount}</p>
                <button class="doneButton">${order.done ? 'Undo' : 'Mark as Done'}</button>
                <button class="deleteButton">Delete</button>
            `;

            ordersList.appendChild(orderItem);

            // Add event listeners for buttons
            orderItem.querySelector('.doneButton').addEventListener('click', function() {
                if (!order.done) {
                    moveToHistory(index, true); // Mark as done
                } else {
                    orders[index].done = false; // Undo done status
                    displayOrders();
                }
            });

            orderItem.querySelector('.deleteButton').addEventListener('click', function() {
                moveToHistory(index, false); // Mark as deleted
            });
        });
    }
}

// Move an order to history
function moveToHistory(index, done) {
    const order = orders.splice(index, 1)[0];
    order.done = done;
    order.timestamp = new Date().toISOString();
    history.push(order);
    displayOrders();
    displayHistory();
}

// Display order history
function displayHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<p>No orders in history.</p>';
    } else {
        history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        history.forEach((order, index) => {
            const orderItem = document.createElement('div');
            orderItem.className = 'history-item';
            orderItem.style.position = 'relative';

            orderItem.innerHTML = `
                <h3>Order #${index + 1} ${order.done ? '(Completed)' : '(Deleted)'}</h3>
                <img src="${order.image}" alt="Order Image" style="max-width: 100%; height: auto;">
                <p><strong>Date:</strong> ${order.date}</p>
                <p><strong>Place:</strong> ${order.place}</p>
                <p><strong>1st Contact Number:</strong> ${order.number1}</p>
                <p><strong>2nd Contact Number:</strong> ${order.number2}</p>
                <p><strong>Amount:</strong> $${order.amount}</p>
                <p><strong>Completed On:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
                <div class="overlay ${order.done ? 'green-overlay' : 'red-overlay'}"></div>
            `;

            historyList.appendChild(orderItem);
        });
    }
}

// Clear history
document.getElementById('clearHistoryButton').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete the history?')) {
        history = [];
        displayHistory();
    }
});

// Show form
function showForm() {
    document.getElementById('orderForm').classList.remove('hidden');
    document.getElementById('ordersPanel').classList.add('hidden');
    document.getElementById('historyPanel').classList.add('hidden');
}

// Show submitted orders
function showOrders() {
    document.getElementById('orderForm').classList.add('hidden');
    document.getElementById('ordersPanel').classList.remove('hidden');
    document.getElementById('historyPanel').classList.add('hidden');
    displayOrders();
}

// Show history
function showHistory() {
    document.getElementById('orderForm').classList.add('hidden');
    document.getElementById('ordersPanel').classList.add('hidden');
    document.getElementById('historyPanel').classList.remove('hidden');
    displayHistory();
}

// Add event listeners to buttons
document.getElementById('placeOrderButton').addEventListener('click', showForm);
document.getElementById('viewSubmittedOrdersButton').addEventListener('click', showOrders);
document.getElementById('viewHistoryButton').addEventListener('click', showHistory);
