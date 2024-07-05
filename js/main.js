let menuicn = document.querySelector(".menuicn");
let nav = document.querySelector(".navcontainer");

menuicn.addEventListener("click", () => {
    nav.classList.toggle("navclose");
})


document.getElementById("viewAllButton").addEventListener("click", function() {
    window.location.href = "viewall.html";
});








