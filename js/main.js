window.addEventListener('load', function () {

    //Select document fields
    const transactionDescription = document.querySelectorAll('input.frm-control')[0];
    const transactionType = document.querySelector('select.frm-control');
    const enteredAmount = document.querySelectorAll('input.frm-control')[1];
    const errorDiv = document.querySelector('.error');
    const transactionsForm = document.querySelector('.frm-transactions');

    //Arrays to track transactions
    let debitTransactions = [];
    let creditTransactions = [];

    //Reload page if the user was inactive for 2 minutes
    idleReload();
    
    //Submit event on the form element
    transactionsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        //Flag for errors indication
        let isError = false;

        //Check for errors, display error messages
        if (transactionType.value == "") {
            setErrorMessage("Invalid type", "type");
            isError = true;
        }
        if (enteredAmount.value <= 0) {
            setErrorMessage("You should enter an amount greater than 0", "amount");
            isError = true;
        }

        //If no errors
        if (!isError) {
            //Create a transaction object
            const transactionRecord = {
                id: uuidv4().substring(0, 8),
                description: transactionDescription.value,
                type: transactionType.value,
                amount: parseFloat(enteredAmount.value)
            }

            //Create transaction in the DOM
            createTransaction(transactionRecord);

            //Add corresponding transactions to the debit or credit arrays
            if (transactionRecord.type === "debit") {
                debitTransactions.push(transactionRecord);
            }
            else if (transactionRecord.type === "credit") {
                creditTransactions.push(transactionRecord);
            }
            //Display Totals
            displayTotal();
            //Reset input values
            reset();
        }
    })//End of the Submit event

    //Focus events to remove errors
    transactionType.addEventListener('focus', () => removeErrorMessage("type"));
    enteredAmount.addEventListener('focus', () => removeErrorMessage("amount"));

    // *******************************Functions*****************************************
 
    function createTransaction(transaction) {
        //Create a DOM element - transaction row
        const amountFormatted = formatCurrency(transaction.amount);
        const template = `
        <table>
        <tr class="${transaction.type}">
            <td>${transaction.description}</td>
            <td>${transaction.type}</td>
            <td class="amount">${amountFormatted}</td>
            <td class="tools">
                <i class="delete fa fa-trash-o" data-key=${transaction.id}></i>
            </td>
        </tr>
        </table>
        `;
        const tableRow = document.createRange().createContextualFragment(template);
        const transactionRow = tableRow.querySelector('tr');
        
        //Place the element into the document
        document.querySelector('tbody').appendChild(transactionRow);

        //Add an event listener to the "i" element (trash icon)
        transactionRow.querySelector('i').addEventListener('click', removeTransaction);
    }

    function removeTransaction(e) {
        //Display a confirm dialog prompt
        const agree = confirm("Are you sure you want to delete the record?");

        if (agree){
            const transactionKey = e.currentTarget.dataset.key;
            const transactionType = e.currentTarget.parentElement.parentElement.className;
    
            //Remove transaction record from the corresponding array
            if (transactionType == "debit") {
                removeTransactionFromArray(debitTransactions, transactionKey);
            }
            else if (transactionType == "credit") {
                removeTransactionFromArray(creditTransactions, transactionKey);
            }
            //Remove transaction row from the document
            e.currentTarget.parentElement.parentElement.remove();

            //Update totals
            displayTotal();
        }
    }

    function removeTransactionFromArray(transactionRecords, recordKey) {
        const keyIndex = transactionRecords.findIndex(record => record.id === recordKey);
        transactionRecords.splice(keyIndex, 1);
    }

    function displayTotal() {
        const totalDebits = debitTransactions.reduce((total, transaction) => {
            total += transaction.amount;
            return total;
        }, 0);

        const totalCredits = creditTransactions.reduce((total, transaction) => {
            total += transaction.amount;
            return total;
        }, 0);

        //Display in the document
        document.querySelector('.total.debits').textContent = formatCurrency(totalDebits);
        document.querySelector('.total.credits').textContent = formatCurrency(totalCredits);
    }

    //Format numbers to two decimal places and a dollar-sign: $0.00
    function formatCurrency(amount) {
        const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
        return formattedAmount;
    }


    function setErrorMessage(message, errorType) {
        let isErrorDisplayed = false;

        //Check if the same error is already displayed
        isErrorDisplayed = Array.from(errorDiv.children).some(p => p.dataset.errortype === errorType);

        if (!isErrorDisplayed) {
            //Create an element to display an error
            const template = `
            <p data-errortype="${errorType}">
            ${message}
            </p>
            `;
            errorDiv.insertAdjacentHTML('beforeend', template);
        }
    }

    function removeErrorMessage(errorType) {
        //Iterate through all error p-paragraphs to remove the one of data-errortype equals errorType
        Array.from(errorDiv.children).forEach(p => {
            if (p.dataset.errortype === errorType) {
                errorDiv.removeChild(p);
            }
        })
    }

    //Reset the form's input fields
    function reset() {
        transactionDescription.value = "";
        transactionType.value = "";
        enteredAmount.value = "";
    }

    //Inactivity timeout javascript - contributed to gerard-kanters from GitHub: https://gist.github.com/gerard-kanters/2ce9daa5c23d8abe36c2
    function idleReload() {
        let timer;

        window.onload = resetTimer;
        window.onmousemove = resetTimer;
        window.onmousedown = resetTimer;      
        window.onclick = resetTimer;      
        window.onkeypress = resetTimer;   
        window.onscroll = resetTimer; 
    
        function reloadPage() {
            window.alert("The page will be reload due to inactivity");
            window.location = self.location.href; 
        }
    
        function resetTimer() {
            clearTimeout(timer);
            timer = setTimeout(reloadPage, 120000);  // time is in milliseconds
        }
    }
})
