document.addEventListener('DOMContentLoaded', function () {
    // Accordion feature motion
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        const accordionItem = header.parentElement;
        const accordionContent = accordionItem.querySelector('.accordion-content');

        // Hide the content initially
        accordionContent.style.display = 'none';

        // Toggle the display of the content and change the icon on click
        header.addEventListener('click', function () {
            accordionContent.style.display = accordionContent.style.display === 'none' ? 'block' : 'none';
            this.classList.toggle('open');

            // Change the text content based on the open/closed state
            this.textContent = this.classList.contains('open') ? '- ' + header.getAttribute('data-title') : '+ ' + header.getAttribute('data-title');
        });
    });


