let menuicn = document.querySelector(".menuicn");
let nav = document.querySelector(".navcontainer");

menuicn.addEventListener("click", () => {
    nav.classList.toggle("navclose");
})


document.getElementById("viewAllButton").addEventListener("click", function() {
    window.location.href = "viewall.html";
});



function logout() {
    localStorage.removeItem('token');

    window.location.href = 'login.html';
}


