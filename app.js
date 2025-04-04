// Get the form and table body elements
const reservationForm = document.getElementById('reservationForm');
const reservationsTbody = document
    .getElementById('reservationsTable')
    .querySelector('tbody');

// Adds a reservation row to the table and updates the visible count
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
    updateReservationCount();
}

// Displays a toast message to indicate success or error
function showMessage(message, isError = false) {
    const box = document.getElementById('messageBox');
    box.textContent = message;
    box.classList.remove('hidden');
    box.className = isError ? 'toast error' : 'toast success';

    setTimeout(() => {
        box.classList.add('fade-out');
        setTimeout(() => box.classList.add('hidden'), 500);
    }, 3000);
}

// Updates the reservation count label with number of visible rows
function updateReservationCount() {
    const rows = reservationsTbody.querySelectorAll('tr');
    let count = 0;

    rows.forEach(row => {
        if (row.style.display !== 'none') {
            count++;
        }
    });

    document.getElementById('reservationCount').textContent = `Showing ${count} reservation${count !== 1 ? 's' : ''}`;
}

// Loads all reservations from server and populates the table
async function loadReservations() {
    try {
        const response = await fetch('/reservations');
        const data = await response.json();

        reservationsTbody.innerHTML = '';
        data.forEach(reservation => {
            addReservationRow(reservation);
        });
        updateReservationCount();
    } catch (error) {
        console.error('Error loading reservations:', error);
        showMessage("Could not load reservations. Server error.", true);
    }
}

// Sends new reservation to the backend and adds it to the table
async function createReservation(newReservation) {
    try {
        const response = await fetch('/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newReservation)
        });

        if (!response.ok) {
            const errorData = await response.json();
            showMessage(errorData.error || "Reservation failed.", true);
            return;
        }

        const created = await response.json();
        addReservationRow(created);
        showMessage("Reservation created successfully!");

    } catch (error) {
        console.error('Error creating reservation:', error);
        showMessage("Failed to create reservation.", true);
    }
}

// Deletes a reservation by ID and reloads the list
async function deleteReservation(id) {
    try {
        const response = await fetch(`/reservations/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        showMessage("Reservation deleted.");
        loadReservations();
    } catch (error) {
        console.error('Error deleting reservation:', error);
        showMessage("Failed to delete reservation.", true);
    }
}

// Handles the form submission to create a reservation
reservationForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const newReservation = {
        name: reservationForm.name.value,
        date: reservationForm.date.value,
        time: reservationForm.time.value,
        table: reservationForm.table.value
    };

    createReservation(newReservation);
    reservationForm.reset();
});

// Delegates click events to delete reservation buttons
reservationsTbody.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteBtn')) {
        const id = event.target.getAttribute('data-id');
        deleteReservation(id);
    }
});

// Filters the reservation table based on user input
document.getElementById('searchInput').addEventListener('input', function () {
    const searchValue = this.value.toLowerCase();
    const rows = reservationsTbody.querySelectorAll('tr');

    rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(searchValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    updateReservationCount();
});

// Exports only visible reservation data to a CSV file (excluding the delete button column)
document.getElementById('exportBtn').addEventListener('click', () => {
    const rows = reservationsTbody.querySelectorAll('tr');
    let csvContent = 'ID,Name,Date,Time,Table\n';

    rows.forEach(row => {
        if (row.style.display !== 'none') {
            const cols = row.querySelectorAll('td');
            const rowData = Array.from(cols).slice(0, 5).map(td => td.textContent.trim().replace(/\n/g, ''));
            csvContent += rowData.join(',') + '\n';
        }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'reservations.csv');
    link.click();
});

// Load the initial reservations on page load
loadReservations();
