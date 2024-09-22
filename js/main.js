let menuicn = document.querySelector(".menuicn");
let nav = document.querySelector(".navcontainer");

const loadingSpinner = document.createElement('div');
loadingSpinner.className = 'loading-spinner';
loadingSpinner.innerText = 'Loading...';
document.body.appendChild(loadingSpinner);


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
        console.error('Error:', error.message);
        document.getElementById("scrapResult").innerHTML = `<p>Failed to scrape news. Please try again later.</p>`;
    });
}



async function fetchAndPopulateNews() {
    document.getElementById("tableclass").style.display = 'none';

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
                <td contenteditable="false" class="title">${news.title}</td>
                <td contenteditable="false" class="newspaperName">${news.newspaperName}</td>
                <td contenteditable="false" class="published">${news.published}</td>
                <td contenteditable="false" class="article">${news.article}</td>
                <td>
                    <button class="update-btn" data-id="${news.id}" style="background-color: #199961;color:white;">Update</button>
                    <button class="save-btn" data-id="${news.id}" style="display: none; background-color:#199961;color:white;">Save</button>
                    <button class="delete-btn" data-id="${news.id}" style="background-color: red;color:white;">Delete</button>
                    <button class="create-btn" data-id="${news.id}" style="background-color: #199961;color:white;">Create reel</button>

                </td>
            `;

            newsTableBody.appendChild(row);
        });

        // Add event listeners for the update, save, and delete buttons
        document.querySelectorAll('.update-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const newsId = e.target.getAttribute('data-id');
                enableInlineEditing(newsId);  // Enable inline editing when Update is clicked
            });
        });

        document.querySelectorAll('.save-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const newsId = e.target.getAttribute('data-id');
                await saveNews(newsId);  // Save the updated news item
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const newsId = e.target.getAttribute('data-id');
                await deleteNews(newsId);
            });
        });
        document.querySelectorAll('.create-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const newsId = e.target.getAttribute('data-id');
                await createReel(newsId);
            });
        });
        
    } catch (error) {
        console.error('Error fetching news:', error.message);
    }
}

// Function to enable inline editing
function enableInlineEditing(newsId) {
    const row = document.querySelector(`[data-id="${newsId}"]`).closest('tr');
    
    row.querySelector('.title').setAttribute('contenteditable', 'true');
    row.querySelector('.newspaperName').setAttribute('contenteditable', 'true');
    row.querySelector('.published').setAttribute('contenteditable', 'true');
    row.querySelector('.article').setAttribute('contenteditable', 'true');

    // Hide the update button and show the save button
    row.querySelector('.update-btn').style.display = 'none';
    row.querySelector('.save-btn').style.display = 'inline-block';
}

// Function to save the updated news item
async function saveNews(newsId) {
    const row = document.querySelector(`[data-id="${newsId}"]`).closest('tr');
    const updatedNews = {
        id: newsId,
        title: row.querySelector('.title').innerText,
        newspaperName: row.querySelector('.newspaperName').innerText,
        published: row.querySelector('.published').innerText,
        article: row.querySelector('.article').innerText
    };

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:8080/admin/updateNews/${newsId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedNews)
        });

        if (response.ok) {
            console.log('News item updated successfully.');
            // Optionally re-fetch and refresh the table
            await fetchAndPopulateNews();
        } else {
            throw new Error('Error updating news item');
        }
    } catch (error) {
        console.error('Error saving news:', error);
    }
}

// Function to delete a news item
async function deleteNews(newsId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`http://localhost:8080/admin/deleteNews/${newsId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            console.log('News item deleted successfully.');
            await fetchAndPopulateNews();  // Refresh the table after deleting
        } else {
            throw new Error('Error deleting news item');
        }
    } catch (error) {
        console.error('Error deleting news:', error.message);
    }
}

async function createReel(newsId) {
    if (!newsId) {
        alert('No news selected!');
        return;
    }

    // Convert the single newsId into an array
    const selectedIds = [newsId];
    console.log(selectedIds);

    try {
        // Show loading message
        document.getElementById('loadingMessage').style.display = 'block';
        loadingSpinner.style.display = 'block';
        tableclass.style.display = 'none'; // Hide the table initially
        const token = localStorage.getItem('token');  // Retrieve the token from localStorage

        // Make the POST request to the backend
        const response = await fetch('http://localhost:8080/admin/getAllReels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
            },
            body: JSON.stringify({ ids: selectedIds }),  // Send selectedIds as an array
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
      

        // Show the table and populate it with data
        const table = document.getElementById('dataTable');
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = '';  

        result.forEach(reel => {
            const row = document.createElement('tr');

            
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

        document.getElementById('statusMessage').innerText = 'Reel created successfully.';
        tableclass.style.display = 'block';  // Show the table class
        table.style.display = 'table';  // Make sure the table is displayed
        table.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        document.getElementById('statusMessage').innerText = `Error: ${error.message}`;
    } finally {
        document.getElementById('loadingMessage').style.display = 'none';  
        loadingSpinner.style.display = 'none';

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
        

        document.getElementById('statusMessage').innerText = 'Reels created successfully.';
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
        <div class="modal-content" style="background-color: ${data.background_color}; color: ${data.font_color}; font-family: ${data.font_family};">
            <span class="close-button">&times;</span>
            
            <h2>Details for NewsId_${data.reelsId}</h2>

            <!-- Title (Not Editable) -->
            <p><strong>Reels Title:</strong> ${data.title}</p>

            <!-- Summary (Editable) -->
            <p><strong>Reels Summary:</strong></p>
            <textarea style="width:100%" id="summary-input">${data.summary}</textarea>
            <button class="regenerate" data-field="summary">Regenerate Summary</button>
            
            <!-- Image (Not Editable) -->
            <p><strong>Image:</strong><br>
                <img src="data:image/jpeg;base64,${data.image}" alt="Image" style="width:100%; max-height: 300px; object-fit: contain;">
                <button class="regenerate-image">Regenerate Image</button>
            </p>

            <!-- Music (Not Editable) -->
            <p><strong>Music:</strong> ${data.music 
                ? `<audio controls>
                    <source style="width:100%" src="data:audio/mp3;base64,${data.music}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>` 
                : 'N/A'
            }
                <button class="regenerate-music">Regenerate Music</button>
            </p>

            <!-- Background Color (Editable) -->
            <p><strong>Background Color:</strong></p>
            <input style="width:100%"  type="text" id="background-color-input" value="${data.background_color}">
            <button class="regenerate" data-field="background_color">Regenerate Color</button>

            <!-- Font Color (Editable) -->
            <p><strong>Font Color:</strong></p>
            <input style="width:100%" type="text" id="font-color-input" value="${data.font_color}">
            <button class="regenerate" data-field="font_color">Regenerate Font Color</button>

            <!-- Font Family (Editable) -->
            <p><strong>Font Family:</strong></p>
            <input style="width:100%" type="text" id="font-family-input" value="${data.font_family}">
            <button class="regenerate" data-field="font_family">Regenerate Font Family</button>

            <!-- Update Button -->
            <button class="update-fields">Update Fields</button>

            <!-- Image Regeneration Prompt Box -->
            <div class="prompt-box-image" style="display:none;">
                <label for="prompt-image">Enter prompt for image regeneration:</label>
                <input type="text" id="prompt-image" placeholder="Enter prompt for image regeneration">
                <button class="submit-prompt-image">Submit</button>
            </div>

            <!-- Music Regeneration Prompt Box -->
            <div class="prompt-box-music" style="display:none;">
                <label for="prompt-music">Enter prompt for music regeneration:</label>
                <input type="text" id="prompt-music" placeholder="Enter prompt for music regeneration">
                <button class="submit-prompt-music">Submit</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.querySelector('.main-container').classList.add('blur-background');
    document.querySelector('.indexHead').classList.add('blur-background');

    // Close the modal
    modal.querySelector('.close-button').addEventListener('click', () => {
        modal.remove();

        document.querySelector('.main-container').classList.remove('blur-background');
        document.querySelector('.indexHead').classList.remove('blur-background');
    });

    // Update fields
    modal.querySelector('.update-fields').addEventListener('click', () => {
        
        const updatedData = {
            reelsId: data.reelsId,
            summary: document.getElementById('summary-input').value,
            background_color: document.getElementById('background-color-input').value,
            font_color: document.getElementById('font-color-input').value,
            font_family: document.getElementById('font-family-input').value
        };
        modal.remove();
        loadingSpinner.style.display = 'block';
        updateFields(updatedData);
    });

    modal.querySelector('.regenerate-image').addEventListener('click', () => {
        document.querySelector('.prompt-box-image').style.display = 'block';
    });

    modal.querySelector('.regenerate-music').addEventListener('click', () => {
        document.querySelector('.prompt-box-music').style.display = 'block';
    });

    modal.querySelector('.submit-prompt-image').addEventListener('click', () => {
        const prompt = document.getElementById('prompt-image').value;
        modal.remove();
        loadingSpinner.style.display = 'block';
        regenerateMedia('image', prompt, data.reelsId);
    });

    modal.querySelector('.submit-prompt-music').addEventListener('click', () => {
        const prompt = document.getElementById('prompt-music').value;
        modal.remove();
        loadingSpinner.style.display = 'block';
        regenerateMedia('music', prompt, data.reelsId);
    });

    document.querySelectorAll('.regenerate').forEach(button => {
        button.addEventListener('click', function() {
          const field = this.getAttribute('data-field'); 
          modal.remove();
          loadingSpinner.style.display = 'block';
          regenerateField(field,data.reelsId);
         
        });
      });
}

// Function to update all fields except title, image, and music
// done worke
async function updateFields(updatedData) {
 
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/admin/updateFields`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error('Error updating fields');
        }
        const newData = await response.json();
        console.log("updated");
        loadingSpinner.style.display = 'none';
        showModal(newData);
    } catch (error) {
        console.error('Error updating fields:', error);
    }
}


async function regenerateField(field, reelsId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/admin/regenerateField`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reelsId, field })
        });

        if (!response.ok) {
            throw new Error('Error regenerating field');
        }

        const updatedData = await response.json();
        loadingSpinner.style.display = 'none';
        showModal(updatedData);

    } catch (error) {
        console.error('Error regenerating field:', error);
    }

}

// Function to regenerate image or music
async function regenerateMedia(type, prompt, reelsId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/admin/regenerateMedia`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reelsId, type, prompt })
        });

        if (!response.ok) {
            throw new Error(`Error regenerating ${type}`);
        }

        const updatedData = await response.json();
        loadingSpinner.style.display = 'none';
        showModal(updatedData);  

    } catch (error) {
        console.error(`Error regenerating ${type}:`, error);
    }
}


// Fetch and show reel details

async function showReelDetails(reelsId) {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:8080/admin/getReelDetails/${reelsId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

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
            <h3 class="t-op-nextlvl label-tag" style="background-color:${reel.status === '1' ? 'green' : 'red'};">
                ${reel.status === '1' ? 'Published' : 'Unpublished'}
            </h3>
        `;
        
        
            itemsContainer.appendChild(item);
        });
        

     

    } catch (error) {
        console.error('Error fetching dashboard data:', error.message);
    }
}

async function updateViewAll() {
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

      

        const itemsContainer = document.querySelector('.report-body .items');
        itemsContainer.innerHTML = ''; 

        data.reelsList.forEach(reel => {
            const item = document.createElement('div');
            item.className = 'item1';
        
            item.innerHTML = `
                <h3 style="color:green; cursor:pointer;" class="t-op-nextlvl" data-reels-id="${reel.reelsId}" onclick="showReelDetails(${reel.reelsId})">
                    reelsId_${reel.reelsId}
                </h3>
                <h3 class="t-op-nextlvl">${formatNumber(reel.views)}</h3>
                <h3 class="t-op-nextlvl">${formatNumber(reel.likes)}</h3>
 <h3 class="t-op-nextlvl label-tag" style="background-color:${reel.status === '1' ? 'green' : 'red'};">
                ${reel.status === '1' ? 'Published' : 'Unpublished'}
            </h3>            `;
        
            itemsContainer.appendChild(item);
        });
        

     

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}



