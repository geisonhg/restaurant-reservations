const reservationForm = document.getElementById('reservationForm');
const reservationsTbody = document
    .getElementById('reservationsTable')
    .querySelector('tbody');

// Helper: Add a single reservation row to the table
function addReservationRow(reservation) {
    const row = document.createElement('tr');
    row.innerHTML = `
    <td>${reservation.id}</td>
    <td>${reservation.name}</td>
    <td>${reservation.date}</td>
    <td>${reservation.time}</td>
    <td>${reservation.table}</td>
    <td>
      <button class="deleteBtn" data-id="${reservation.id}">Delete</button>
    </td>
  `;
    reservationsTbody.appendChild(row);
}

// Load all reservations from the server (GET)
async function loadReservations() {
    try {
        const response = await fetch('http://localhost:5000/reservations');
        const data = await response.json();

        // Clear the table before re-filling it
        reservationsTbody.innerHTML = '';

        data.forEach(reservation => {
            addReservationRow(reservation);
        });
    } catch (error) {
        console.error('Error loading reservations:', error);
    }
}

// Create a new reservation (POST)
async function createReservation(newReservation) {
    try {
        const response = await fetch('http://localhost:5000/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newReservation)
        });

        // If the response is not OK (e.g., status 400), handle the error
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server returned an error:', errorData.error);
            showMessage(errorData.error, "error"); // Show an alert or handle it in the UI
            return;
        }

        const created = await response.json();
        console.log('Reservation created:', created);

        // Append the new reservation to the bottom of the table
        addReservationRow(created);
        showMessage("Reservation created successfully! 🎉", "success");

    } catch (error) {
        console.error('Error creating reservation:', error);
    }
}

// Delete a reservation (DELETE)
async function deleteReservation(id) {
    try {
        const response = await fetch(`http://localhost:5000/reservations/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        console.log(data);

        // Reload the table to keep it in sync
        loadReservations();
    } catch (error) {
        console.error('Error deleting reservation:', error);
    }
}

// Handle the form submission to create a reservation
reservationForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent page reload

    const newReservation = {
        name: reservationForm.name.value,
        date: reservationForm.date.value,
        time: reservationForm.time.value,
        table: reservationForm.table.value
    };

    createReservation(newReservation);
    reservationForm.reset(); // optional
});

// Listen for clicks on any Delete button
reservationsTbody.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteBtn')) {
        const id = event.target.getAttribute('data-id');
        deleteReservation(id);
    }
});

function showMessage(message, type = "success") {
    const box = document.getElementById("messageBox");
    box.textContent = message;
    box.className = `show ${type}`;

    setTimeout(() => {
        box.className = "hidden";
    }, 3000);
}


// On page load, fetch the existing reservations
loadReservations();
