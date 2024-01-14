<script>
  document.getElementById('downloadButton').addEventListener('click', function() {
    // Use the GitHub API to get the download link for the files
    var downloadLink = 'https://codeload.github.com/code4policy/2024-b1-Local-Election-Database/zip/refs/heads/main';

    // Create an invisible link element
    var link = document.createElement('a');
    link.href = downloadLink;
    link.download = 'files.zip';

    // Append the link to the document and trigger the click event
    document.body.appendChild(link);
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
  });
</script>