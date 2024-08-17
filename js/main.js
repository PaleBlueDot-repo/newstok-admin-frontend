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



async function fetchAndPopulateNews() {
    document.getElementById("tableclass").style.display='none';

    try {
        const token = localStorage.getItem('token');  // Retrieve the token from localStorage
        const response = await fetch('http://localhost:8080/admin/getAllNews', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');  // Handle any errors in the response
        }

        const newsData = await response.json();

        const newsTableBody = document.getElementById('newsTableBody');
        newsTableBody.innerHTML = ''; // Clear the table body

        newsData.forEach(news => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td><input type="checkbox" class="select-row" data-id="${news.id}"></td>
                <td>${news.title}</td>
                <td>${news.newspaperName}</td>
                <td>${news.published}</td>
                <td>${news.article}</td>
            `;
            
            newsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

async function sendSelectedNewsIds() {
    const tableclass=document.getElementById("tableclass");

    const selectedCheckboxes = document.querySelectorAll('.select-row:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-id'));

    if (selectedIds.length === 0) {
        alert('No news selected!');
        return;
    }

    try {
        document.getElementById('loadingMessage').style.display = 'block';
        tableclass.style.display='none';
        const token = localStorage.getItem('token');  // Retrieve the token from localStorage

        const response = await fetch('http://localhost:8080/admin/getAllReels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
            },
            body: JSON.stringify({ ids: selectedIds }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        // Show the table and populate it with data
        const table = document.getElementById('dataTable');
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';  // Clear existing rows

        result.forEach(reel => {
            const row = document.createElement('tr');

            // Add columns for each piece of data
            row.innerHTML = `
                <td>${reel.newsId || 'N/A'}</td>
                <td>${reel.background_color || 'N/A'}</td>
                <td>${reel.font_color || 'N/A'}</td>
                <td>${reel.font_family || 'N/A'}</td>
                <td><img src="data:image/jpeg;base64,${reel.image}" alt="Image" style="width:100px;height:auto;"></td>
                <td>${reel.music || 'N/A'}</td>
                <td>${reel.summary || 'N/A'}</td>
                <td>${reel.title || 'N/A'}</td>
            `;

            tbody.appendChild(row);
        });

        document.getElementById('statusMessage').innerText = 'Data successfully loaded.';
        tableclass.style.display='block';
        table.style.display = 'table';  
    } catch (error) {
        document.getElementById('statusMessage').innerText = `Error: ${error.message}`;
    } finally {
        document.getElementById('loadingMessage').style.display = 'none';
    }
}

