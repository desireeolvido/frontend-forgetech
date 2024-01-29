import { backendURL, showNavAdminPages, successNotification, errorNotification, getLoggedUser, } from "../utils/utils.js";

// calling function - important to execute the code inside the function
getLoggedUser();

// Get All Data
getData();

showNavAdminPages();

async function getData(url = "", keyword = "") {
  // Add Loading if pagination or search is used; Remove if its not needed
  if (url != "" || keyword != "") {
    document.getElementById("get_data").innerHTML =
      `<div class="col-sm-12 d-flex justify-content-center align-items-center">
        <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <b class="ms-2">Loading Data...</b>
    </div>`;
  }

  // Clear existing content before loading new data
  document.getElementById("get_data").innerHTML = "";

  // To cater pagination and search feature
  let queryParams = "?" +
    (url != "" ? new URL(url).searchParams + "&" : "") + //Remove this line if not using pagination
    (keyword != "" ? "keyword=" + keyword : "");

  // Get Property Owner API Endpoint; Caters search
  const response = await fetch(
    backendURL + "/api/vehicle" + queryParams,
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

    console.log(json);

    // Get Each Json Elements and merge with HTML element and put it into a container 
    let container = "";
    // Now caters pagination; You can use "json.data" if using pagination or "json" only if no pagination
    json.data.forEach((element) => {
      const date = new Date(element.created_at).toLocaleString();

      container += `<div class="col-sm-12">
                    <div class="card w-100 mt-3" data-id="${element.VIN}">
                    
                    <div class="row">
                        <div class="col-sm-4 d-flex align-items-center">
                            <img class="rounded" src="${backendURL}/storage/${element.image}" width="100%" height="270px">
                        </div>

                        <div class="col-sm-8">
                        <div class="card-body">
                                           
       
                            <div>
                            <h6 class="card-title"><b>VIN:</b>     ${element.VIN}</h5>
                            
                            <h6 class="card-text"><b>Price:</b>     ${element.price}</h6>
                            <h6 class="card-text"><b>Model:</b>     ${element.models.model_name}</h6>
                            <h6 class="card-title"><b>Category:</b>     ${element.models.category}</h5>
                            <h6 class="card-title"><b>Transmission:</b>     ${element.transmission}</h5>
                            <h6 class="card-text"><b>Color:</b>     ${element.color}</h6>
                            <h6 class="card-text"><b>Brand:</b>     ${element.models.brand.brand_name}</h6>
                            </div>
                            <h6 class="card-subtitle text-body-secondary mt-4">
                            <small><b>Date created:</b>     ${date}</small>
                            </h6>
                        </div>
                        </div>
                        
                        <div class="col-sm-8 text-center ps-5 ms-5">
                            <a class="col-sm-2 btn btn-danger mb-2" href="#" id="btn_edit" data-id="${element.VIN}"><i class="fas fa-inbox"></i> Inquire</a>
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
  const brandKeyword = formData.get("brand");

  // Use the brandKeyword as the search parameter
  getData("", brandKeyword);
};

//Store and Update Functionality Combined
// Submit Form Functionality; This is for create and update 
const form_vehicles = document.getElementById("form_vehicles");

form_vehicles.onsubmit = async (e) => {
  e.preventDefault();

  // Disable button
  document.querySelector("#form_vehicles button[type = 'submit']").disabled = true;
  document.querySelector("#form_vehicles button[type = 'submit']").innerHTML =
    `<div class="col-sm-12 d-flex justify-content-center align-items-center">
      <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
      </div>
      <b class="ms-2">Loading...</b>
  </div>`;

  //   Get values of form (input, textarea, select) put it as form-data
  const formData = new FormData(form_vehicles);

  // Check Key/value pairs of form data; Uncomment to debug
  // for (let [name, value] of formData) {
  //   //key1 = value1, then key2 = value2
  //   // Use for checking if the store property owner is working
  //   console.log(`${name} = ${value}`); 
  // }

  let response;
  // Check if for_update_id is empty; If it is empty then it's create, else it's update
  if (for_update_id == "") {

    // const id = document.querySelector('#form_vehicles input[type="hidden"]').value;
    // const forUpdate = id.length > 0 ? true : false;

    //   fetch API property owner store endpoint
    response = await fetch(
      backendURL + "/api/inventory",
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

    //   fetch API property owner update endpoint
    response = await fetch(
      backendURL + "/api/inventory/" + for_update_id,
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

  // const id = document.querySelector('#form_vehicles input[type="hidden"]').value;
  // const forUpdate = id.length > 0 ? true : false;

  // Get response if 200-299 status code
  if (response.ok) {
    // uncomment the two code lines below for debugging purpose 
    // const json = await response.json();
    // console.log(json);

    // Reset Form
    form_vehicles.reset();

    // // Refresh the page
    // location.reload(10); 

    successNotification("Successfully" + (for_update_id == "" ? " created" : " updated") + " inventory.", 10);

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

  document.querySelector("#form_vehicles button[type='submit']").disabled = false;
  document.querySelector("#form_vehicles button[type='submit']").innerHTML = "Submit";
};

// Delete Functionality
const deleteAction = async (e) => {

  // Get Id from data Id attribute within the btn_delete anchor tag
  const id = e.target.getAttribute("data-id");

  // Background red the card that you want to delete
  document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor =
    "red";

  //   fetch API property owner delete endpoint
  const response = await fetch(
    backendURL + "/api/inventory/" + id,
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

      successNotification("Successfully deleted property owner", 10);

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

  // Background Yellow the card you want to delete
  document.querySelector(`.card[data-id="${id}"]`).style.borderColor =
    "red";

  // Fetch API Dealer show endpoint
  const response = await fetch(
    backendURL + "/api/vehicle/dealer/" + id, {
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
      "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
    },
  });

  // Get response if 200-299 status code
  if (response.ok) {
    const json = await response.json();
    console.log(json);

    // Store id to a variable; id will be utilize for update
    for_update_id = json.id;

    // Display json response to Form tags; make sure to set id attribute on tags (input, textarea, select)    
    document.getElementById("dealer_name").value = "";
    document.getElementById("area").value = "";
    document.getElementById("address").value = "";
    document.getElementById("phone").value = "";

    // Display dealer information
    let dealerContainer = "";
    const propertiesToShow = ['dealer_name', 'area', 'address', 'phone'];

    for (const key of propertiesToShow) {
      if (json.dealer.hasOwnProperty(key)) {

        dealerContainer += `
                <div class="row mb-3">
                    <div class="col-sm-3">
                        <label for="">${key}:</label>
                    </div>
                    <div class="col-sm-9">
                        ${json.dealer[key]}
                    </div>
                </div>`;
      }
    }

    document.getElementById("dealer_container").innerHTML = dealerContainer;

    // Change Button Description; You can also use textContent instead of innerHTML
    document.querySelector("#form_vehicles button[type='submit']").innerHTML = "Update Info";
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

  // Get search keyword from the form
  const formData = new FormData(form_search);
  const brandKeyword = formData.get("brand");

  // Refresh card list with the correct parameters
  getData(url, brandKeyword);
}

export { getData };