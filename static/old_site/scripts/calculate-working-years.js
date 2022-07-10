const yearSpan = document.querySelector("#work-years-counter");
yearSpan.textContent = new Date().getFullYear() - new Date(2019, 2, 11).getFullYear();