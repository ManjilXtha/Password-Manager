
        // Initialize state
        let currentUser = null;
        let passwords = [];

        // DOM Elements
        const loginForm = document.getElementById('loginForm');
        const vault = document.getElementById('vault');
        const userInfo = document.getElementById('userInfo');
        const searchInput = document.getElementById('searchVault');

        // Event Listeners
        document.addEventListener('DOMContentLoaded', () => {
            initializeApp();
        });
        

        function initializeApp() {
            // Login form handler
            loginForm.addEventListener('submit', handleLogin);

            // Password management
            document.getElementById('addPasswordBtn').addEventListener('click', () => showModal('addPasswordModal'));
            document.getElementById('addPasswordForm').addEventListener('submit', handleAddPassword);
            document.getElementById('editPasswordForm').addEventListener('submit', handleEditPassword);
            document.getElementById('generatePasswordBtn').addEventListener('click', generatePassword);
           
            // Search functionality
            searchInput.addEventListener('input', handleSearch); 
            document.getElementById('settingsMyAccount').addEventListener('click', (e) => {
        e.preventDefault();
        showMyAccount();
    });
            const myAccountLink = document.querySelector('nav ul li a[href="#"]:not([onclick])');
myAccountLink.addEventListener('click', (e) => {
    e.preventDefault();
    showMyAccount();
});
            
            // Add click event listener to close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userInfo = document.getElementById('userInfo');
    const userMenu = document.getElementById('userMenu');
    if (!userInfo.contains(event.target)) {
        userMenu.classList.add('hidden');
    }
});

            // Password strength meter
            document.getElementById('passwordInput').addEventListener('input', (e) => {
                checkPasswordStrength(e.target.value); 
            });document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
            
            });
        }

        // Add all the JavaScript functions we created earlier
        function updateLengthValue(value) {
            document.getElementById('lengthValue').textContent = value;
        }

        function generatePasswordWithOptions() {
            const length = parseInt(document.getElementById('passwordLength').value);
            const uppercase = document.getElementById('includeUppercase').checked;
            const lowercase = document.getElementById('includeLowercase').checked;
            const numbers = document.getElementById('includeNumbers').checked;
            const symbols = document.getElementById('includeSymbols').checked;
            
            let charset = '';
            if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
            if (numbers) charset += '0123456789';
            if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
            
            if (charset === '') {
                alert('Please select at least one character type');
                return;
            }
            
            let password = '';
            for (let i = 0; i < length; i++) {
                password += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            
            document.getElementById('generatedPassword').value = password;
            checkPasswordStrength(password);
        }

        function copyGeneratedPassword() {
            const password = document.getElementById('generatedPassword').value;
            navigator.clipboard.writeText(password);
            alert('Password copied to clipboard!');
        }

        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('masterPassword').value;

            if (email && password) {
                currentUser = { email };
                showVault();
                loadPasswords();
            }
        } 
        function showVault() {
            loginForm.classList.add('hidden');
            vault.classList.remove('hidden');
            userInfo.classList.remove('hidden');
            document.getElementById('userEmail').textContent = currentUser.email;
            history.pushState({page: 'vault'}, 'Password Vault', '#vault');
        }
            function logout() {
                // Reset all states
                currentUser = null;
                passwords = [];
                
                // Clear any input fields
                document.getElementById('email').value = '';
                document.getElementById('masterPassword').value = '';
                if (searchInput) {
                    searchInput.value = '';
                }
                
                // Hide vault and show login form
                vault.classList.add('hidden');
                userInfo.classList.add('hidden');
                loginForm.classList.remove('hidden');
                
                // Close any open modals
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => modal.classList.add('hidden'));
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

        function loadPasswords() {
            // Demo passwords
            passwords = [
                { id: 1, url: 'https://gmail.com', username: 'user@gmail.com', password: encryptPassword('demo123') },
                { id: 2, url: 'https://github.com', username: 'developer', password: encryptPassword('github456') }
            ];
            renderPasswords();
        }

        function renderPasswords(filteredPasswords = null) {
            const container = document.getElementById('cards-container');
            const passwordsToRender = filteredPasswords || passwords;
            
            container.innerHTML = passwordsToRender.map(pass => `
                <div class="password-card bg-white p-6 rounded-lg shadow-md">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">${new URL(pass.url).hostname}</h3>
                        <div class="flex space-x-2">
                            <button onclick="editPassword(${pass.id})" class="text-gray-600 hover:text-yellow-500">
                                ✏️
                            </button>
                            <button onclick="deletePassword(${pass.id})" class="text-gray-600 hover:text-red-500">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <p class="text-sm text-gray-600">Username: ${pass.username}</p>
                        <div class="flex items-center space-x-2">
                            <input type="password" value="${decryptPassword(pass.password)}" 
                                   class="text-sm text-gray-800 bg-transparent border-none" readonly>
                            <button onclick="copyPassword('${pass.password}')" 
                                    class="text-gray-600 hover:text-yellow-500">
                                📋
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function handleSearch(e) {
            const searchTerm = e.target.value.toLowerCase();
            const filteredPasswords = passwords.filter(pass => 
                pass.url.toLowerCase().includes(searchTerm) || 
                pass.username.toLowerCase().includes(searchTerm)
            );
            renderPasswords(filteredPasswords);
        }

        function showModal(modalId) {
            document.getElementById(modalId).classList.remove('hidden');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.add('hidden');
        }

        function handleAddPassword(e) {
        e.preventDefault();
        const form = e.target;
        const newPassword = {
            id: passwords.length + 1,
            url: form.url.value,
            username: form.username.value,
            password: encryptPassword(form.password.value),
            category: form.category.value // Add this line
        };
        passwords.push(newPassword);
        renderPasswords();
        closeModal('addPasswordModal');
        form.reset();
}

function editPassword(id) {
    const password = passwords.find(p => p.id === id);
    document.getElementById('editPasswordId').value = password.id;
    document.getElementById('editUrl').value = password.url;
    document.getElementById('editUsername').value = password.username;
    document.getElementById('editPassword').value = decryptPassword(password.password);
    document.getElementById('editCategory').value = password.category; // Add this line
    showModal('editPasswordModal');
}

        function handleEditPassword(e) {
            e.preventDefault();
            const id = parseInt(document.getElementById('editPasswordId').value);
            const passwordIndex = passwords.findIndex(p => p.id === id);
            
            passwords[passwordIndex] = {
                id,
                url: document.getElementById('editUrl').value,
                username: document.getElementById('editUsername').value,
                password: encryptPassword(document.getElementById('editPassword').value)
            };
            
            renderPasswords();
            closeModal('editPasswordModal');
        }

        function deletePassword(id) {
            if (confirm('Are you sure you want to delete this password?')) {
                passwords = passwords.filter(p => p.id !== id);
                renderPasswords();
            }
        }

        function generatePassword() {
            const length = 16;
            const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
            let password = "";
            for (let i = 0; i < length; i++) {
                password += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            document.getElementById('passwordInput').value = password;
            checkPasswordStrength(password);
        }

        function checkPasswordStrength(password) {
    const strengthIndicator = document.querySelector('.strength-indicator');
    const strengthText = document.getElementById('strengthText');
    
    // Initialize strength criteria
    let strength = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /[0-9]/.test(password),
        special: /[^a-zA-Z0-9]/.test(password)
    };
    
    // Calculate total strength score
    const score = Object.values(strength).filter(Boolean).length;
    
    // Update strength meter UI
    if (score <= 2) {
        strengthIndicator.style.width = '33%';
        strengthIndicator.style.backgroundColor = '#ef4444'; // Red
        strengthText.innerHTML = `
            <span class="text-red-500">Weak Password</span><br>
            <span class="text-xs">Add uppercase, numbers, or special characters</span>
        `;
    } else if (score <= 4) {
        strengthIndicator.style.width = '66%';
        strengthIndicator.style.backgroundColor = '#f59e0b'; // Yellow
        strengthText.innerHTML = `
            <span class="text-yellow-500">Medium Password</span><br>
            <span class="text-xs">Add more character types to strengthen</span>
        `;
    } else {
        strengthIndicator.style.width = '100%';
        strengthIndicator.style.backgroundColor = '#10b981'; // Green
        strengthText.innerHTML = `
            <span class="text-green-500">Strong Password</span><br>
            <span class="text-xs">Great! Your password is strong</span>
        `;
    }

    // Add detailed requirements list
    const requirementsList = document.createElement('ul');
    requirementsList.className = 'text-xs mt-2 space-y-1';
    requirementsList.innerHTML = `
        <li class="${strength.length ? 'text-green-500' : 'text-red-500'}">
            ${strength.length ? '✓' : '×'} At least 8 characters
        </li>
        <li class="${strength.lowercase ? 'text-green-500' : 'text-red-500'}">
            ${strength.lowercase ? '✓' : '×'} Lowercase letters
        </li>
        <li class="${strength.uppercase ? 'text-green-500' : 'text-red-500'}">
            ${strength.uppercase ? '✓' : '×'} Uppercase letters
        </li>
        <li class="${strength.numbers ? 'text-green-500' : 'text-red-500'}">
            ${strength.numbers ? '✓' : '×'} Numbers
        </li>
        <li class="${strength.special ? 'text-green-500' : 'text-red-500'}">
            ${strength.special ? '✓' : '×'} Special characters
        </li>
    `;
    
    // Update the strength text container
    strengthText.appendChild(requirementsList);
}


        function encryptPassword(password) {
            return CryptoJS.AES.encrypt(password, 'secret-key').toString();
        }

        function decryptPassword(encryptedPassword) {
            const bytes = CryptoJS.AES.decrypt(encryptedPassword, 'secret-key');
            return bytes.toString(CryptoJS.enc.Utf8);
        }

        function copyPassword(encryptedPassword) {
            const password = decryptPassword(encryptedPassword);
            navigator.clipboard.writeText(password);
            alert('Password copied to clipboard!');
        }

        function toggleEditPassword() {
            const passwordInput = document.getElementById('editPassword');
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        }
        function toggleAddPassword() {
    const passwordInput = document.getElementById('passwordInput');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
}
// Add these functions to your existing script section

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    menu.classList.toggle('hidden');
} 
function showMyAccount() {
    document.getElementById('vault').classList.add('hidden');
    document.getElementById('userMenu').classList.add('hidden');
    const myAccount = document.getElementById('myAccountInterface');
    myAccount.classList.remove('hidden');
    history.pushState({page: 'account'}, 'My Account', '#account');
}

// Add new event listener
window.addEventListener('popstate', (event) => {
    if (event.state?.page === 'vault') {
        document.getElementById('myAccountInterface').classList.add('hidden');
        vault.classList.remove('hidden');
    } else if (!currentUser) {
        logout();
    }
});

function saveAccountSettings() {
    // Save the account settings
    currentUser.name = document.getElementById('profileName').value;
    currentUser.autoLogout = document.getElementById('autoLogout').checked;
    currentUser.showPasswordStrength = document.getElementById('showPasswordStrength').checked;
    
    // Show success message
    alert('Account settings saved successfully!');
}

function showChangeMasterPassword() {
    // Implement master password change functionality
    const currentPassword = prompt('Enter current master password:');
    if (currentPassword) {
        const newPassword = prompt('Enter new master password:');
        if (newPassword) {
            const confirmPassword = prompt('Confirm new master password:');
            if (newPassword === confirmPassword) {
                // Update master password logic here
                alert('Master password updated successfully!');
            } else {
                alert('Passwords do not match!');
            }
        }
    }
}


        

