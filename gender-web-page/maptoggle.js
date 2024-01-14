// Get the dropdown and corresponding content divs
const mapToggle = document.getElementById('mapToggle');
const mapScore = document.getElementById('map_score');
const mapChi = document.getElementById('map_chi');

// Add event listener to the dropdown for change event
mapToggle.addEventListener('change', toggleMap);

// Set the initial state to show the first option
mapToggle.value = 'score';
toggleMap();

// Function to toggle map based on the dropdown selection
function toggleMap() {
    if (mapToggle.value === 'score') {
        mapScore.style.display = 'block';
        mapChi.style.display = 'none';
    } else if (mapToggle.value === 'chi') {
        mapScore.style.display = 'none';
        mapChi.style.display = 'block';
    }
}


