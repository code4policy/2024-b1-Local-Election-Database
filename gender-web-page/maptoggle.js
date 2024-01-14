// Get the radio buttons and their corresponding content divs
const scoreOption = document.getElementById('scoreOption');
const chiOption = document.getElementById('chiOption');
const mapScore = document.getElementById('map_score');
const mapChi = document.getElementById('map_chi');

// Add event listeners to the radio buttons
scoreOption.addEventListener('click', function () {
    mapScore.style.display = 'block';
    mapChi.style.display = 'none';
});

chiOption.addEventListener('click', function () {
    mapScore.style.display = 'none';
    mapChi.style.display = 'block';
});

// Set the initial state to show the first option
scoreOption.click();

