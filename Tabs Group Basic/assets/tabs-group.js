document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll(".tabs-headings");
    const tabContents = document.querySelectorAll(".tabs-content");

    tabButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const target = this.getAttribute("data-tab");

            // Remove active class from all buttons and hide content
            tabButtons.forEach((btn) => btn.classList.remove("active"));
            tabContents.forEach((content) => (content.style.display = "none"));

            // Add active class to clicked button and show corresponding content
            this.classList.add("active");
            document.getElementById(`tab-${target}`).style.display = "block";
        });
    });

    // Activate the first tab by default
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
});
