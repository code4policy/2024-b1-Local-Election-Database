// maptoggle.js

function toggleMap(option) {
  // Your implementation for toggling maps based on the option
  if (option === 'score') {
    // Toggle the map for 'score'
    document.getElementById('map_score').style.display = 'block';
    document.getElementById('map_chi').style.display = 'none';
  } else if (option === 'chi') {
    // Toggle the map for 'chi'
    document.getElementById('map_score').style.display = 'none';
    document.getElementById('map_chi').style.display = 'block';
  }
}



