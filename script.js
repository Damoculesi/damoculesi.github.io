const numParticipantsPage = document.getElementById('num-participants-page');
const numParticipantsInput = document.getElementById('num-participants');
const numSubmitBtn = document.getElementById('num-submit');
const participantsNamesDiv = document.getElementById('participants-names');
const transactionsForm = document.getElementById('transactions');
const payer = document.getElementById('payer');
const amount = document.getElementById('amount');
const debtorsSelect = document.getElementById('debtors');
const formBtn = document.getElementById('form-button');
const confirmPage = document.getElementById('confirmation-page')
const addMoreBtn = document.getElementById('add-more');
const calcTotalBtn = document.getElementById('calculate-total');
const resultPage = document.getElementById('result-page')

// Array to store participant names
let participantNames = [];
let balances = {};
let finalTransactions = {};

function createDebtorCheckboxes(names) {
    const debtorsDiv = document.getElementById('debtors');

    // Clear previous checkboxes if they exist
    debtorsDiv.innerHTML = '<p>split with:</p>';

    // Create a checkbox for each participant name
    names.forEach((name, index) => {
        const label = document.createElement('label');
        label.style.display = 'block'; // Ensures each checkbox appears on a new line

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'debtor-options';
        checkbox.className = 'split-with-participants'
        checkbox.value = name; // Use the participant's name as the value

        label.appendChild(checkbox);

        const labelText = document.createTextNode(` ${name}`);
        label.appendChild(labelText);

        debtorsDiv.appendChild(label);
    });
}

function createPayerRadioButtons(names) {
    const payerDiv = document.getElementById('payer');

    // Clear previous radio buttons if they exist
    payerDiv.innerHTML = '<p>paid by:</p>';

    // Create a radio button for each participant name
    names.forEach((name, index) => {
        const label = document.createElement('label');

        const radioButton = document.createElement('input');
        radioButton.type = 'radio';
        radioButton.name = 'payer-options';
        radioButton.value = name; // Use the participant's name as the value

        label.appendChild(radioButton);

        const labelText = document.createTextNode(` ${name}`);
        label.appendChild(labelText);

        const lineBreak = document.createElement('br');

        payerDiv.appendChild(label);
        payerDiv.appendChild(lineBreak);
    });
}

const collectNames =() => {
    participantsNamesDiv.style.display = 'none'
    transactionsForm.classList.toggle('hide');

    participantNames = []; // Reset the array to empty
    const nameInputs = document.getElementsByClassName('participant-name');

    for (let input of nameInputs) {
        if (input.value.trim() !== '') {
            participantNames.push(input.value.trim());
        }
    }

    // After collecting names, create radio buttons
    createPayerRadioButtons(participantNames);
    createDebtorCheckboxes(participantNames);
}

const createParticipantInputs = numParticipants => {
    // Clear the participantsNamesDiv first
    participantsNamesDiv.innerHTML = '';

    const namesLabel = document.createElement('label');
    namesLabel.textContent = "Names of participants: "
    participantsNamesDiv.appendChild(namesLabel)

    // Create the specified number of nameInput elements for participant names
    for (let i = 0; i < numParticipants; i++) {
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'participant-name'; // Use a class to style the inputs if needed
        nameInput.id = `participant-${i+1}`
        nameInput.placeholder = `Participant ${i + 1} Name`;
        nameInput.required = true; // Make the nameInput field required to ensure a name is entered
        participantsNamesDiv.appendChild(nameInput);
    }

    // Create a submit button for participant names
    const namesSubmitButton = document.createElement('button');
    namesSubmitButton.type = 'button'; // Use 'button' if you will handle the click event with JavaScript
    namesSubmitButton.id = 'names-submit';
    namesSubmitButton.textContent = 'Submit Names';
    participantsNamesDiv.appendChild(namesSubmitButton);

    // Add an event listener to the submit button here if needed
    namesSubmitButton.addEventListener('click', () => collectNames());

}

const numSubmitFn = () => {

    const numParticipants = parseInt(numParticipantsInput.value, 10)
    // Validate the number of participants
    if (numParticipants <= 0) {
        alert('Please enter a valid number of participants.');
        return;
    }
    numParticipantsPage.style.display = "none";
    participantsNamesDiv.style.display = "flex";

    createParticipantInputs(numParticipants);
}

const backToTransaction = () => {
    confirmPage.classList.add('hide'); // Ensure the confirm page is hidden
    transactionsForm.classList.remove('hide'); // Show the transactions form
}

let expenses = {};

const calculateFn = () => {
    const totalAmount = parseInt(amount.value);
    console.log("total amount: " + totalAmount)
    let splitWithParticipants = [];
    // To calculate numOfPeople, we need to know who are in the split with.
    const checkBoxes = document.querySelectorAll(".split-with-participants");
    checkBoxes.forEach(checkbox => {
        console.log(checkbox.value)
        if (checkbox.checked) {
            console.log(checkbox.value)
            splitWithParticipants.push(checkbox.value);
        }
    });

    console.log(splitWithParticipants)
    // Extract the payer name:
    const selectedPayerName = document.querySelector('input[name="payer-options"]:checked').value;

    const numOfPeople = splitWithParticipants.length;
    const pricePerParticipant = totalAmount / numOfPeople;

    // Initialize payer object if not already present
    if (!expenses[selectedPayerName]) {
        expenses[selectedPayerName] = {};
    }

    // Ensure the payer is not included in the splitWithParticipants array
    splitWithParticipants = splitWithParticipants.filter(debtor => debtor !== selectedPayerName);

    // Add each debtor to the payer's object, excluding the payer.
    splitWithParticipants.forEach(debtor => {
        // Exclude the payer
        expenses[selectedPayerName][debtor] = pricePerParticipant;
    });

    // Assuming expenses is already defined and populated
    for (const payer in expenses) {
        if (expenses.hasOwnProperty(payer)) {
            console.log(`Payer: ${payer}`);
            for (const debtor in expenses[payer]) {
                if (expenses[payer].hasOwnProperty(debtor)) {
                    console.log(`  Debtor: ${debtor}, Amount: ${expenses[payer][debtor]}`);
                }
            }
        }
    }
    console.log(expenses)
}

const calculateBalances = () => {

    for(let payer in expenses){
        balances[payer] = 0;
    }
    for (let payer in expenses) {
        for (let debtor in expenses[payer]) {
            let amount = expenses[payer][debtor];
            balances[payer] -= amount; // Subtract from sender
            balances[debtor] = (balances[debtor] || 0) + amount; // Add to debtor
        }
    }
    console.log(balances)
    separateAndSortAndProcessBalances(balances)
}

function addTransaction(giver, receiver, amount) {
    if (!finalTransactions[giver]) {
        finalTransactions[giver] = {};
    }
    finalTransactions[giver][receiver] = amount;
}

const processTransactions = (sortedGivers, sortedReceivers) => {
    while (sortedGivers.length > 0 && sortedReceivers.length > 0) {
        let currentGiver = sortedGivers[0];
        let currentReceiver = sortedReceivers[0];

        // Compare the top items of the giver and receiver balances
        if (Math.abs(currentGiver[1]) <= Math.abs(currentReceiver[1])) {
            // If the giver amount is smaller than or equal to the receiver amount
            // Add the transaction
            addTransaction(currentGiver[0], currentReceiver[0], Math.abs(currentGiver[1]));
            // Remove the giver from the giverBalances
            sortedGivers.shift();
        } else {
            // If the giver amount is greater than the receiver amount
            // Add the transaction
            addTransaction(currentGiver[0], currentReceiver[0], Math.abs(currentReceiver[1]));
            // Update the giver's balance
            currentGiver[1] += currentReceiver[1];
            // Remove the receiver from the receiverBalances
            sortedReceivers.shift();
        }
    }
}

const separateAndSortAndProcessBalances = (balances) => {
    let receiverBalances = {};
    let giverBalances = {};
    for (let person in balances) {
        if (balances[person] < 0) {
            receiverBalances[person] = balances[person]; // Negative balance - receiver
        } else if (balances[person] > 0) {
            giverBalances[person] = balances[person]; // Positive balance - giver
        }
        // If the balance is zero, we do not need to include it as they are even
    }
    // Sort giver balances from largest to smallest
    let sortedGivers = Object.entries(giverBalances).sort((a, b) => b[1] - a[1]);
    // Sort receiver balances from smallest to largest (more negative to less negative)
    let sortedReceivers = Object.entries(receiverBalances).sort((a, b) => a[1] - b[1]);
    
    processTransactions(sortedGivers, sortedReceivers)
}

function displayTransactions(transactions) {

    let transactionList = '<div style="line-height:1.6;">Final Results:<br>';

    // Create a counter for transaction numbering
    let counter = 1;

    for (const giver in transactions) {
        for (const receiver in transactions[giver]) {
            const amount = transactions[giver][receiver].toFixed(2);
            transactionList += `<div>${counter}. <span style="border:1px solid #000; padding:2px;"><strong>${giver}</strong></span> owes <span style="border:1px solid #000; padding:2px;"><strong>${receiver}</strong></span> <span style="border:1px solid #000; padding:2px;"><strong>$${amount}</strong></span></div>`;
            counter++;
        }
    }

    transactionList += '</div>';
    resultPage.innerHTML = transactionList;
}

const resultFn = () => {
    confirmPage.classList.toggle('hide');
    calculateBalances();
    console.log(finalTransactions);
    displayTransactions(finalTransactions);
}






const confirmPageFn = () => {
    confirmPage.classList.remove('hide'); // show the confirm page
    transactionsForm.classList.add('hide'); // hide the transactions form

    addMoreBtn.addEventListener('click', () => {
        calculateFn();
        backToTransaction();
    });
    
    calcTotalBtn.addEventListener('click', () => {
        calculateFn();
        resultFn();
    });
}

numSubmitBtn.addEventListener('click', numSubmitFn)
formBtn.addEventListener('click', confirmPageFn)