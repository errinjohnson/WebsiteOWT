// Handle form submission for adding or updating a participant
document.getElementById('participantForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const participantId = document.getElementById('participant_id').value; // Get participant ID from hidden field
    const formData = {
        email: document.getElementById('email').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        phone: document.getElementById('phone').value,
        registration: document.getElementById('registration').value
    };

    if (participantId) {
        // Update existing participant if ID exists
        updateParticipant(participantId, formData);
    } else {
        // Add new participant if no ID
        addParticipant(formData);
    }

    // Reset form after submission
    this.reset();
    document.getElementById('formSubmitButton').textContent = 'Add Participant'; // Reset button text
});

// Function to add a new participant using the API
function addParticipant(participant) {
    fetch('/api/participants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(participant)
    })
    .then(response => response.json())
    .then(data => {
        if (data.participant_id) { // Check if participant ID is returned from server
            participant.participant_id = data.participant_id; // Assign returned ID to participant
            addParticipantToTable(participant); // Add participant to the table
        }
        console.log('Participant added:', data);
    })
    .catch(error => console.error('Error adding participant:', error));
}

// Function to add participant to the table
function addParticipantToTable(participant) {
    const tbody = document.getElementById('participantTableBody');
    const row = document.createElement('tr');

    // Add Edit button before other participant fields
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.classList.add('btn', 'btn-warning', 'btn-sm');
    editButton.addEventListener('click', () => loadParticipantForEdit(participant));
    const editCell = document.createElement('td');
    editCell.appendChild(editButton);
    row.appendChild(editCell);

    // Add each participant field to the row
    for (const key of ['participant_id', 'email', 'first_name', 'last_name', 'phone', 'registration']) {
        const cell = document.createElement('td');
        cell.textContent = participant[key];
        cell.style.maxWidth = '200px';
        cell.style.overflow = 'hidden';
        cell.style.textOverflow = 'ellipsis';
        row.appendChild(cell);
    }

    tbody.appendChild(row);
}

// Fetch all participants from the API and display them
function fetchParticipants() {
    fetch('api/participants')
 .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(participants => {
            participants.forEach(participant => {
                addParticipantToTable(participant);
            });
        })
        .catch(error => console.error('Error fetching participants:', error));
}

// Call fetchParticipants on page load
document.addEventListener('DOMContentLoaded', fetchParticipants);

// Input mask for phone number field
document.getElementById('phone').addEventListener('input', function (e) {
    let input = e.target.value;
    input = input.replace(/\D/g, ''); // Remove all non-digit characters
    if (input.length <= 3) {
        e.target.value = '(' + input;
    } else if (input.length <= 6) {
        e.target.value = '(' + input.substring(0, 3) + ') ' + input.substring(3, 6);
    } else {
        e.target.value = '(' + input.substring(0, 3) + ') ' + input.substring(3, 6) + '-' + input.substring(6, 10);
    }
});

// Function to populate form fields with participant data for editing
function loadParticipantForEdit(participant) {
    document.getElementById('participant_id').value = participant.participant_id; // Populate hidden field
    document.getElementById('email').value = participant.email;
    document.getElementById('first_name').value = participant.first_name;
    document.getElementById('last_name').value = participant.last_name;
    document.getElementById('phone').value = participant.phone;
    document.getElementById('registration').value = participant.registration;

    // Change the button text to indicate edit mode
    document.getElementById('formSubmitButton').textContent = 'Update Participant';
}

// Function to update a participant using the API
function updateParticipant(participantId, participant) {
    fetch(`api/participants/${participantId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(participant)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Participant updated:', data);
        updateParticipantRow(participantId, participant); // Update participant row in table
    })
    .catch(error => console.error('Error updating participant:', error));
}

// Function to update participant row in the table
function updateParticipantRow(participantId, updatedParticipant) {
    const rows = document.getElementById('participantTableBody').getElementsByTagName('tr');
    for (let row of rows) {
        if (row.cells[1].textContent == participantId) { // Adjusted index for participant_id
            row.cells[2].textContent = updatedParticipant.email;
            row.cells[3].textContent = updatedParticipant.first_name;
            row.cells[4].textContent = updatedParticipant.last_name;
            row.cells[5].textContent = updatedParticipant.phone;
            row.cells[6].textContent = updatedParticipant.registration;
            break;
        }
    }
}

// Optional: Refresh the participant list
function refreshParticipantList() {
    document.getElementById('participantTableBody').innerHTML = ''; // Clear existing rows
    fetchParticipants(); // Fetch and display updated participant list
}

