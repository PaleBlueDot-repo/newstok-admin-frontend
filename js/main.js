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




function scrapNews(source, category) {
    const data = {
        newsSource: source,
        newsCategory: category
    };

    const token = localStorage.getItem('token');

    fetch('/admin/scrap-news', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        // Handle the result returned by the backend
        document.getElementById("scrapResult").innerHTML = `<p>${result.message}</p>`;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById("scrapResult").innerHTML = `<p>Failed to scrap news. Please try again later.</p>`;
    });
}