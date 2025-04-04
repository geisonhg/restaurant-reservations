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

// Load all reservations from the server (GET)
async function loadReservations() {
    try {
        const response = await fetch('/reservations');
        const data = await response.json();

        reservationsTbody.innerHTML = '';
        data.forEach(reservation => {
            addReservationRow(reservation);
        });
    } catch (error) {
        console.error('Error loading reservations:', error);
        showMessage("Could not load reservations. Server error.", true);
    }
}

// Create a new reservation (POST)
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

// Delete a reservation (DELETE)
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

reservationsTbody.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteBtn')) {
        const id = event.target.getAttribute('data-id');
        deleteReservation(id);
    }
});

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
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const rows = reservationsTbody.querySelectorAll('tr');
    let csvContent = 'ID,Name,Date,Time,Table\\n';
  
    rows.forEach(row => {
      if (row.style.display !== 'none') {
        const cols = row.querySelectorAll('td');
        const rowData = Array.from(cols).map(td => td.textContent);
        csvContent += rowData.join(',') + '\\n';
      }
    });
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'reservations.csv');
    link.click();
  });
  

loadReservations();
