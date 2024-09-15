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
                <td>
                    ${reel.music 
                        ? `<audio controls>
                            <source src="data:audio/mp3;base64,${reel.music}" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>`
                        : 'N/A'
                    }
                </td>
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


function showModal(data) {
    const modal = document.createElement('div');
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h2>Details for NewsId_${data.reelsId}</h2>
            <p><strong>Background Color:</strong> ${data.background_color}</p>
            <p><strong>Font Color:</strong> ${data.font_color}</p>
            <p><strong>Font Family:</strong> ${data.font_family}</p>
            <p><strong>Image:</strong><br><img src="${data.image}" alt="Image" style="width:100%; max-height: 300px; object-fit: contain;"></p>
            <p><strong>Summary:</strong> ${data.summary}</p>
            <p><strong>Title:</strong> ${data.title}</p>
        </div>
    `;

    document.body.appendChild(modal);

    // Close the modal
    modal.querySelector('.close-button').addEventListener('click', () => {
        modal.remove();
    });

    // Remove the modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}


async function showReelDetails(reelsId) {
    try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        const response = await fetch(`http://localhost:8080/admin/getReelDetails/${reelsId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Create a modal or popup to display the details
        showModal(data);

    } catch (error) {
        console.error('Error fetching reel details:', error);
    }
}



// Function to format numbers with commas
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function updateDashboard() {
    try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        const response = await fetch('http://localhost:8080/admin/getDashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        document.querySelector('.box1 .topic-heading').textContent = data.newsReel_Views;
        document.querySelector('.box2 .topic-heading').textContent = formatNumber(data.likes);
        document.querySelector('.box3 .topic-heading').textContent = formatNumber(data.watchtime);
        document.querySelector('.box4 .topic-heading').textContent = formatNumber(data.published);

        const itemsContainer = document.querySelector('.report-body .items');
        itemsContainer.innerHTML = ''; // Clear existing items

        data.reelsList.slice(0, 10).forEach(reel => {
            const item = document.createElement('div');
            item.className = 'item1';
        
            item.innerHTML = `
                <h3 style="color:green; cursor:pointer;" class="t-op-nextlvl" data-reels-id="${reel.reelsId}" onclick="showReelDetails(${reel.reelsId})">
                    reelsId_${reel.reelsId}
                </h3>
                <h3 class="t-op-nextlvl">${formatNumber(reel.views)}</h3>
                <h3 class="t-op-nextlvl">${formatNumber(reel.likes)}</h3>
                <h3 class="t-op-nextlvl label-tag">${reel.status === '1' ? 'Published' : 'Unpublished'}</h3>
            `;
        
            itemsContainer.appendChild(item);
        });
        

     

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}





