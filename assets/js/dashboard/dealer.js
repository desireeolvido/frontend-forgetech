import { backendURL, showNavAdminPages, successNotification, errorNotification, getLoggedUser, } from "../utils/utils.js";

// calling function - important to execute the code inside the function
getLoggedUser();

// Get All Data
getData();

showNavAdminPages();

async function getData(url = "", dealer_name = "") {
  // Add Loading if pagination or search is used; Remove if its not needed
  if (url != "" || dealer_name != "") {
    document.getElementById("get_data").innerHTML = 
    `<div class="col-sm-12 d-flex justify-content-center align-items-center">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <b class="ms-2">Loading Data...</b>
    </div>`;
  }

  // To cater pagination and search feature
  let queryParams = "?" + 
  (url != "" ? new URL(url).searchParams + "&" : "") + //Remove this line if not using pagination
  (dealer_name != "" ? "dealer_name=" + dealer_name : "");

  // Get Dealer API Endpoint; Caters search
  const response = await fetch(
    backendURL + "/api/dealer" + queryParams,
    {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
        "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
      },
    }
  );


// async function getData() {
//   // Get Owner API Endpoint
//   const response = await fetch(
//     backendURL + "/api/owner",
//     {
//       headers: {
//         Accept: "application/json",
//         Authorization: "Bearer " + localStorage.getItem("token"),
//       },
//     }
//   );

  // Get response if 200-299 status code
  if (response.ok) {
    const json = await response.json();

    // Get Each Json Elements and merge with HTML element and put it into a container 
    let container = "";
    // Now caters pagination; You can use "json.data" if using pagination or "json" only if no pagination
    json.data.forEach((element) => {
      const date = new Date(element.created_at).toLocaleString();

      container += `<div class="col-sm-12 mb-3">
                        <div class="card w-100" data-id="${element.dealer_id}">
                        <div class="card-body">

                            <div class="row">
                            
                                <!--<div class="col-sm-4 d-flex align-items-center"> 
                                <div id="map"></div>
                                </div>-->

                                <div class="col-sm-7">
                                    
                                        <small><i class="fas fa-user-tie"></i> Dealer</small><h5 class="card-title">${element.dealer_name}</h5>
                                        <small><i class="fas fa-chart-area"></i> Area</small><h5 class="card-title">${element.area}</h5>
                                        <small><i class="fas fa-location-arrow"></i> Address</small><h5 class="card-title">${element.address}</h5>
                                        <small><i class="fas fa-phone"></i> Phone</small><h5 class="card-title">
                                        <a href="tel:${element.phone}">${element.phone}</a>
                                        </h5>                                         
                                        <h6 class="card-subtitle mb-2 text-body-secondary mt-4">
                                            <small><i class="fas fa-calendar"></i> ${date}</small>
                                        </h6>
                                        
                                    </div>
                                </div>

                                <div class="col-sm-10 text-center ps-5 ms-5">
                                  <a class="col-sm-2 btn btn-danger mb-2" href="#" id="btn_edit" data-id="${element.dealer_id}"><i class="fas fa-business-time"></i> View Inventory</a>
                              </div>

                            </div>     
                        </div>
                    </div>`;
    });

    // Use the container to display the fetch data
    document.getElementById("get_data").innerHTML = container;

    // Assign click event on Edit Btns
    document.querySelectorAll("#btn_edit").forEach((element) => {
      element.addEventListener("click", editAction);
    });

    // Assign click event on Delete Btns
    document.querySelectorAll("#btn_delete").forEach((element) => {
      element.addEventListener("click", deleteAction);
    });

    // Get Each Json Elements and merge with Html elements and put it into a container
    let pagination = "";
    // Now caters pagination; Remove below if no pagination 
    json.links.forEach((element) => {
      pagination += `<li class="mt-5 page-item">
                    <a class="page-link
                    ${element.url == null ? " disabled" : ""}
                    ${element.active ? " active" : ""}
                    " href="#" id="btn_paginate" data-url="${element.url}">
                      ${element.label}
                    </a>
                    </li>`;
    });
    // Use the container to display the fetch data
    document.getElementById("get_pagination").innerHTML = pagination;

    // Assign  click event on Page Btns
    document.querySelectorAll("#btn_paginate").forEach((element) => {
      element.addEventListener("click", pageAction);
    });
  } 
  // Get response if 400+ or 500+ status code
  else {
    errorNotification("HTTP-Error: " + response.status);
  }
}

// Search Form
const form_search = document.getElementById("form_search");
form_search.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(form_search);

  getData("", formData.get("dealer_name"));
};

//Store and Update Functionality Combined
// Submit Form Functionality; This is for create and update 
const form_dealers = document.getElementById("form_dealers");

form_dealers.onsubmit = async (e) => {
  e.preventDefault();

  // Disable button
  document.querySelector("#form_dealers button[type = 'submit']").disabled = true;
  document.querySelector("#form_dealers button[type = 'submit']").innerHTML = 
  `<div class="col-sm-12 d-flex justify-content-center align-items-center">
      <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
      </div>
      <b class="ms-2">Loading...</b>
  </div>`;

  //   Get values of form (input, textarea, select) put it as form-data
  const formData = new FormData(form_dealers);

  // Check Key/value pairs of form data; Uncomment to debug
  // for (let [name, value] of formData) {
  //   //key1 = value1, then key2 = value2
  //   // Use for checking if the store property owner is working
  //   console.log(`${name} = ${value}`); 
  // }

  let response;
  // Check if for_update_id is empty; If it is empty then it's create, else it's update
  if (for_update_id == "") {

  // const id = document.querySelector('#form_dealers input[type="hidden"]').value;
  // const forUpdate = id.length > 0 ? true : false;

  //   fetch API Dealer store endpoint
  response = await fetch(
    backendURL + "/api/dealer",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
        "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
      },
      body: formData,
    }
  );
  }

  // For Update
  else {
    // Add Method Spoofing to cater Image Upload; Cause you are using FormData; Uncomment if necessary
    // formData.append("_method", "PUT");

    //   fetch API Dealer update endpoint
    response = await fetch(
      backendURL + "/api/dealer/" + for_update_id,
      {
        method: "PUT", //Change to POST if with Image Upload
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
        },
        // Uncomment body below; If with Image Upload
        // body: formData,
        // Comment body below; if with Image Upload
        body: new URLSearchParams(formData),
      }
    );
  }

  // Check Key/value pairs of form data, un comment to debug
  // for (let [name, value] of formData) {
  //   //key1 = value1, then key2 = value2
  //   // Use for checking if the store property owner is working
  //   console.log(`${name} = ${value}`); 
  // }

  // const id = document.querySelector('#form_dealers input[type="hidden"]').value;
  // const forUpdate = id.length > 0 ? true : false;

  // Get response if 200-299 status code
  if (response.ok) {
    // uncomment the two code lines below for debugging purpose 
    // const json = await response.json();
    // console.log(json);

    // Reset Form
    form_dealers.reset();

    // // Refresh the page
    // location.reload(10); 

    successNotification("Successfully" + (for_update_id == "" ? " created":" updated") + " dealer.", 10);

    // Close Modal
    document.getElementById("modal_close").click();

    // Reload Page
    getData();

    // // Refresh the page
    // location.reload(10); 
    
  } 
  // Get response if 422 status code
  else if (response.status == 422) {
    const json = await response.json();

    // Close Modal
    document.getElementById("modal_close").click();


    errorNotification(json.message, 10);
  }
  // Always reset for_update_id to empty string
  for_update_id = "";

  document.querySelector("#form_dealers button[type='submit']").disabled = false;
  document.querySelector("#form_dealers button[type='submit']").innerHTML = "Submit";
};

// Delete Functionality
const deleteAction = async (e) => {

  // Get Id from data Id attribute within the btn_delete anchor tag
  const id = e.target.getAttribute("data-id");

  // Background red the card that you want to delete
  document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor =
    "red";

    //   fetch API Dealer delete endpoint
    const response = await fetch(
      backendURL + "/api/dealer/" + id, 
      {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
        "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
      },
    });

    // Use JS confirm to ask for confirmation; You can use bootstrap modal instead of this
    if (confirm("Are you sure you want to delete?")) {

    // Get response if 200-299 status code
    if (response.ok) {

      // Uncomment for debugging purpose
      // const json = await response.json();
      // console.log(json);

      successNotification("Successfully deleted dealer", 10);

      // Remove the card from the list 
      document.querySelector(`.card[data-id="${id}"]`).remove();

    } 
    
    // Get response if 400+ or 500+
    else {
      errorNotification("Unable to delete!", 10);

      // Background white the card if unable to delete
      document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor =
      "white"; 
    } 
  }
};

// Update Functionality
const editAction = async (e) => {
    
    // Get Id from data Id attribute within the btn_delete anchor tag
    const id = e.target.getAttribute("data-id");
  
    // Show Functionality Function Call
    showData(id);
    
    // Show Modal Form
    document.getElementById("modal_show").click();
}

// Storage of Id of chosen data to update
let for_update_id = "";

// Show Functionality
const showData = async (id) => {

  // Background red the card you want to edit
  document.querySelector(`.card[data-id="${id}"]`).style.borderColor =
    "red";

  // Fetch API dealer show endpoint
  const response = await fetch(
    backendURL + "/api/dealer/inventory/" + id,  {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
      "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
    },
  });

  // Get response if 200-299 status code
  if (response.ok) {
    const json = await response.json();
    // const inventoryData = json.inventory[0]; // Access the first element of the array

    // uncomment to debug; Show fetch data from API in console
    console.log(json);

    // Store id to a variable; id will be utilize for update
    for_update_id = json.id;

    // Display json response to Form tags; make sure to set id attribute on tags (input, textarea, select)    
    document.getElementById("VIN").value = "";
    document.getElementById("model_name").value ="";
    document.getElementById("category").value = "";
    document.getElementById("price").value = "";
    document.getElementById("color").value = "";
    // document.getElementById("image").value = json.stock;
    document.getElementById("stock").value = "";
    document.getElementById("sales").value = "";
    document.getElementById("dealer").value = "";

    // Display inventory information
    let inventoryContainer = "";
    const propertiesToShow = ['VIN', 'model_name', 'category', 'price', 'color', 'stock', 'sales', 'dealer','image'];

    for (const inventoryData of json.inventory) {
      

      for (const key of propertiesToShow) {
        if (inventoryData.hasOwnProperty(key)) {
          if (key === 'image') {
            inventoryContainer += `
                <div class="row mb-3">
                    <div class="col-sm-3">
                        <label for="">${key}:</label>
                    </div>
                    <div class="col-sm-9">
                        <img class="img-fluid image_display" src="${backendURL}/storage/${inventoryData[key]}" alt="Image">
                    </div>
                </div>`;
                    
        } else {
            inventoryContainer += `
                <div class="row mb-3">
                    <div class="col-sm-3">
                        <label for="">${key}:</label>
                    </div>
                    <div class="col-sm-9">
                        <input class="form-control" type="text" value="${inventoryData[key]}" readonly>
                    </div>
                </div>`;
        }
      }
    }
    inventoryContainer += "<hr>"; // Separate inventory items with a horizontal line

    document.getElementById("inventory_container").innerHTML = inventoryContainer;

    // Show the modal
    document.getElementById("form_modal").style.display = "block";

    // Change Button Description; You can also use textContent instead of innerHTML
    document.querySelector("#form_dealers button[type='submit']").innerHTML = "Update Info";
  } 
}
  // Get response if 400+ or 500+
  else {
    errorNotification("Unable to show!", 10);

    // Background white the card if unable to show
    document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor =
      "white";
  }
};

// Page Functionality
const pageAction = async (e) => {
  // Get url from data-url attribute within the btn_pagination anchor tag
  const url = e.target.getAttribute("data-url");

  // Refresh card list
  getData(url);
}

// <!-- leaflet -->
var map = L.map('map').setView([14.62656, 121.06031], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var marker;
// <!-- Leaflet End -->

// Get the select element from the HTML
const selectDealer = document.getElementById("dealer_name");

// Add an event listener to the select element
selectDealer.addEventListener("change", function () {
  // Get the selected value
  const selectedDealer = selectDealer.value;

  // Use a switch statement to update the map based on the selected value
  switch (selectedDealer) {
    case "PeakMove Cubao":
      updateMap([14.62656, 121.06031]); // Update coordinates accordingly
      break;
    case "PeakMove Pasig":
      updateMap([14.598330, 121.090750]);
      break;
    case "PeakMove Valenzuela":
      updateMap([14.703240, 120.961700]);
      break;
    case "PeakMove Albay":
      updateMap([13.179215, 123.677060]);
      break;
    case "PeakMove Bacoor, Cavite, INC.":
      updateMap([14.429585, 120.964128]);
      break;
    case "PeakMove Cebu City, INC.":
      updateMap([10.295255741960217, 123.90515839584133]);
      break;
    case "PeakMove Calbayog, Samar":
      updateMap([12.056803, 124.619253]);
      break;
    case "PeakMove Butuan City":
      updateMap([8.942241, 125.497178]);
      break;
    case "PeakMove Cagayan de Oro, INC.":
      updateMap([8.493128071466028, 124.63276382242343]);
      break;
    // Add more cases for other options
    default:
      // Set a default case if the selected option doesn't match any case
      updateMap([14.62656, 121.06031]); // Default coordinates
      break;
  }
});

// Function to update the Leaflet map view and marker
function updateMap(coordinates) {
  map.setView(coordinates, 13); // Update the view coordinates and zoom level

  // Remove the existing marker
  if (marker) {
    map.removeLayer(marker);
  }

  // Add a new marker at the updated coordinates
  marker = L.marker(coordinates).addTo(map);
}



export {getData};