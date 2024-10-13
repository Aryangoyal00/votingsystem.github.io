let users = {}; // Store user data for voters
let organizations = {}; // Store organization data
let currentUser = null;
let currentOrg = null;
let polls = {}; // Store poll data

// Display the login or signup page based on user type
function showLoginPage(type) {
    document.querySelector('.container').classList.add('hidden');
    if (type === 'voter') {
        document.getElementById('voter-login').classList.remove('hidden');
    } else {
        document.getElementById('organization-login').classList.remove('hidden');
    }
}

// Display the signup page
function showSignupPage(type) {
    if (type === 'voter') {
        document.getElementById('voter-login').classList.add('hidden');
        document.getElementById('voter-signup').classList.remove('hidden');
    } else {
        document.getElementById('organization-login').classList.add('hidden');
        document.getElementById('organization-signup').classList.remove('hidden');
    }
}

// Voter signup function
function voterSignup() {
    const name = document.getElementById('signup-name').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone').value;

    // Check if the phone number already exists
    for (const user in users) {
        if (users[user].phone === phone) {
            alert('Phone number already registered.');
            return;
        }
    }

    // Store user data
    users[username] = { name, password, phone, votedPolls: [] };
    alert('Signup successful! Please login.');
    document.getElementById('voter-signup').classList.add('hidden');
    document.getElementById('voter-login').classList.remove('hidden');
}

// Voter login function
function voterLogin() {
    const username = document.getElementById('voter-username').value;
    const password = document.getElementById('voter-password').value;

    if (users[username] && users[username].password === password) {
        currentUser = username;
        document.getElementById('voter-login').classList.add('hidden');
        document.getElementById('voter-home').classList.remove('hidden');
        document.getElementById('user-name').textContent = users[username].name;
    } else {
        alert('Invalid username or password.');
    }
}

// Function to search for a poll by ID
// Function to search for a poll by ID
function searchPoll() {
    const pollId = document.getElementById('poll-id').value;

    // Check all organization polls for the poll ID
    let foundPoll = null;
    for (const org in organizations) {
        const orgPolls = organizations[org].polls;
        for (let i = 0; i < orgPolls.length; i++) {
            if (orgPolls[i].id === pollId) {
                foundPoll = orgPolls[i];
                break;
            }
        }
        if (foundPoll) break; // Stop search once poll is found
    }

    if (foundPoll) {
        // Display the poll details to the voter
        document.getElementById('poll-details').classList.remove('hidden');
        document.getElementById('poll-question').textContent = `Question: ${foundPoll.questions[0].question}`;

        // Add options for casting the vote (for the first question)
        const pollOptionsDiv = document.createElement('div');
        foundPoll.questions[0].options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.textContent = option;
            optionBtn.onclick = () => castVote(pollId, index);
            pollOptionsDiv.appendChild(optionBtn);
        });

        document.getElementById('poll-details').appendChild(pollOptionsDiv);

    } else {
        alert('Poll not found.');
    }
}



// Function to cast a vote
// Function to cast a vote
function castVote(pollId, selectedOptionIndex) {
    // Check if the voter has already voted in this poll
    if (!users[currentUser].votedPolls.includes(pollId)) {
        // Mark this poll as voted for the current user
        users[currentUser].votedPolls.push(pollId);

        // Add vote to the poll
        let poll = polls[pollId] || null;
        for (const org in organizations) {
            const orgPolls = organizations[org].polls;
            for (let i = 0; i < orgPolls.length; i++) {
                if (orgPolls[i].id === pollId) {
                    poll = orgPolls[i];
                    break;
                }
            }
            if (poll) break;
        }

        // If poll is found, record the vote
        if (poll) {
            const selectedQuestion = poll.questions[0];
            const optionVoted = selectedQuestion.options[selectedOptionIndex];
            if (!poll.votes) {
                poll.votes = {};
            }
            poll.votes[currentUser] = { option: optionVoted };
            alert('Vote cast successfully!');

            // Hide the poll details after voting
            document.getElementById('poll-details').classList.add('hidden');
        } else {
            alert('Poll not found.');
        }
    } else {
        alert('You have already voted in this poll.');
    }
}

// Organization signup function
function organizationSignup() {
    const orgName = document.getElementById('org-name').value;
    const username = document.getElementById('org-username').value;
    const password = document.getElementById('org-password').value;
    const phone = document.getElementById('org-phone').value;

    // Check if the phone number already exists
    for (const org in organizations) {
        if (organizations[org].phone === phone) {
            alert('Phone number already registered.');
            return;
        }
    }

    // Store organization data
    organizations[username] = { orgName, password, phone, polls: [] };
    alert('Signup successful! Please login.');
    document.getElementById('organization-signup').classList.add('hidden');
    document.getElementById('organization-login').classList.remove('hidden');
}

// Organization login function
function organizationLogin() {
    const username = document.getElementById('org-username').value;
    const password = document.getElementById('org-password').value;

    if (organizations[username] && organizations[username].password === password) {
        currentOrg = username;
        document.getElementById('organization-login').classList.add('hidden');
        document.getElementById('org-home').classList.remove('hidden');
        document.getElementById('org-name-display').textContent = organizations[username].orgName;
        loadPolls();
    } else {
        alert('Invalid username or password.');
    }
}

// Load organization polls
function loadPolls() {
    const pollListDiv = document.getElementById('poll-list');
    pollListDiv.innerHTML = ''; // Clear previous polls

    const orgPolls = organizations[currentOrg].polls;
    if (orgPolls.length === 0) {
        pollListDiv.innerHTML = '<p>No polls created yet.</p>';
    } else {
        orgPolls.forEach(poll => {
            const pollButton = document.createElement('button');
            pollButton.textContent = poll.name;
            pollButton.onclick = () => viewPollResults(poll.id);
            pollListDiv.appendChild(pollButton);
        });
    }
}

// Show create poll page
function showCreatePollPage() {
    document.getElementById('org-home').classList.add('hidden');
    document.getElementById('create-poll').classList.remove('hidden');
    document.getElementById('poll-name').value = '';
    document.getElementById('question-list').innerHTML = ''; // Clear previous questions
}

// Add a new question for the poll
function addQuestion() {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';

    const questionInput = document.createElement('input');
    questionInput.placeholder = 'Enter question';

    const optionList = document.createElement('div');
    optionList.className = 'options';

    const addOptionButton = document.createElement('button');
    addOptionButton.textContent = 'Add Option';
    addOptionButton.onclick = () => {
        const optionInput = document.createElement('input');
        optionInput.placeholder = 'Option';
        optionList.appendChild(optionInput);
    };

    questionDiv.appendChild(questionInput);
    questionDiv.appendChild(optionList);
    questionDiv.appendChild(addOptionButton);
    document.getElementById('question-list').appendChild(questionDiv);
}

// Submit the poll
// Submit the poll
function submitPoll() {
    const pollName = document.getElementById('poll-name').value;
    const questions = document.querySelectorAll('.question');
    const pollId = generatePollId();

    const pollData = {
        name: pollName,
        id: pollId,
        questions: [],
        votes: {},
        createdBy: currentOrg  // Add the organization reference to the poll
    };

    questions.forEach(q => {
        const questionText = q.querySelector('input').value;
        const options = Array.from(q.querySelectorAll('.options input')).map(opt => opt.value);
        pollData.questions.push({ question: questionText, options: options });
    });

    // Store the poll in both global polls and under the current organization
    polls[pollId] = pollData;
    organizations[currentOrg].polls.push(pollData);  // Associate poll with the organization

    alert(`Poll created successfully! Poll ID: ${pollId}`);
    document.getElementById('create-poll').classList.add('hidden');
    document.getElementById('org-home').classList.remove('hidden');
    loadPolls(); // Reload the organization's polls
}


// Generate a unique poll ID
function generatePollId() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit number
    const letterPart = letters.charAt(Math.floor(Math.random() * letters.length)) +
                       letters.charAt(Math.floor(Math.random() * letters.length)) +
                       letters.charAt(Math.floor(Math.random() * letters.length)) +
                       letters.charAt(Math.floor(Math.random() * letters.length));
    return letterPart + numbers;
}

// View poll results
function viewPollResults(pollId) {
    const poll = polls[pollId];

    if (poll) {
        const results = document.createElement('div');
        results.innerHTML = `<h3>Results for ${poll.name}</h3>`;
        poll.questions.forEach(q => {
            const questionDiv = document.createElement('div');
            questionDiv.innerHTML = `<strong>${q.question}</strong>`;
            const chartData = [];
            q.options.forEach(opt => {
                const votesCount = Object.values(poll.votes).filter(vote => vote.option === opt).length;
                chartData.push({ option: opt, votes: votesCount });
                questionDiv.innerHTML += `<p>${opt}: ${votesCount} votes</p>`;
            });
            results.appendChild(questionDiv);
        });
        document.getElementById('org-home').appendChild(results);
    } else {
        alert('Poll not found.');
    }
}


// Sign out function
function signOut() {
    // Hide the current page
    if (currentUser) {
        document.getElementById('voter-home').classList.add('hidden');
    } else if (currentOrg) {
        document.getElementById('org-home').classList.add('hidden');
    }

    // Show the login page again
    document.querySelector('.container').classList.remove('hidden');
    
    // Clear current user/org references
    currentUser = null;
    currentOrg = null;
}



// Sign out function
function signOut() {
    // Hide all current pages
    document.querySelectorAll('.home').forEach(page => page.classList.add('hidden'));

    // Show the starting login options (voter/organization)
    document.querySelector('.container').classList.remove('hidden');

    // Clear current user/org references
    currentUser = null;
    currentOrg = null;
}





