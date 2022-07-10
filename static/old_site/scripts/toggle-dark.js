/** Dark Mode Toggle script based on: https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/ */
const btn = document.querySelector(".btn-toggle-theme");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

btn.addEventListener("click", function() {
    if (prefersDarkScheme.matches) {
        document.body.classList.toggle("light-theme");
    } else {
        document.body.classList.toggle("dark-theme");
    }
});