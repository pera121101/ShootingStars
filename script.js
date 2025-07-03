// Handle form submissions and store data in localStorage
document.addEventListener('DOMContentLoaded', () => {
    const athleteForm = document.getElementById('athleteForm');
    const investorForm = document.getElementById('investorForm');

    if (athleteForm) {
        athleteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.getElementById('role').value,
                sport: document.getElementById('sport').value,
                age: document.getElementById('age').value,
                location: document.getElementById('location').value,
                kyc: document.getElementById('kyc').files[0]?.name || 'No file'
            };
            localStorage.setItem('athleteData', JSON.stringify(data));
            alert('Athlete signup saved! Data stored in localStorage.');
            window.location.href = 'athlete-profile.html';
        });
    }

    if (investorForm) {
        investorForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                investorType: document.getElementById('investorType').value,
                accreditation: document.getElementById('accreditation').value,
                investmentFocus: document.getElementById('investmentFocus').value,
                kyc: document.getElementById('kyc').files[0]?.name || 'No file'
            };
            localStorage.setItem('investorData', JSON.stringify(data));
            alert('Investor signup saved! Data stored in localStorage.');
            window.location.href = 'investor-dashboard.html';
        });
    }
});