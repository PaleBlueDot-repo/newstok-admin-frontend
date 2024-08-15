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
    const token = localStorage.getItem('token');

    const url = `http://localhost:8080/admin/getNews?name=${encodeURIComponent(source)}&category=${encodeURIComponent(category)}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(newsList => {
        const resultContainer = document.getElementById("scrapResult");
        resultContainer.innerHTML = `
        <h1 style="color:#199961;">📰 Scraped News is Ready!</h1>
        <p>Latest news from <strong>${source}</strong> in the <strong>${category}</strong> category has been gathered.</p>
        <p>Scroll down to explore the articles:</p>
        <br>
        <hr>
        <br>
    `;
        newsList.forEach(news => {
            resultContainer.innerHTML += `
                <div>
                    <h3 style="color:#199961;" >${news.title}</h3>
                    <p>${news.article}</p>
                    <a style="color:#199961;" href="${news.link}" target="_blank">Read more</a>
                    <p><small>Published on: ${news.published}</small></p>
                </div>
                <hr>
            `;
        });
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById("scrapResult").innerHTML = `<p>Failed to scrape news. Please try again later.</p>`;
    });
}
