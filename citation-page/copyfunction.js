function copyText() {
    const textToCopy = document.getElementById('textToCopy').innerText;

    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;

    // Set the textarea to be invisible
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';

    // Append the textarea to the document
    document.body.appendChild(textarea);

    // Select and copy the text in the textarea
    textarea.select();
    document.execCommand('copy');

    // Remove the textarea from the document
    document.body.removeChild(textarea);

    // Optionally, provide feedback to the user
    alert('Text copied to clipboard!');
}
