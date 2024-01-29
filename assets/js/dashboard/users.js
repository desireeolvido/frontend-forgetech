import {
    backendURL,
    showNavAdminPages,
    successNotification,
    errorNotification,
    getLoggedUser,
  } from "../utils/utils.js";
  
  // Get Logged User Info
  getLoggedUser();
  
  // Get Admin Pages
  showNavAdminPages();
  
  // Get All Data
  getData();
  
  async function getData(url = "", keyword = "") {
    // Add Loading if pagination or search is used; Remove if its not needed
    if (url != "" || keyword != "") {
      document.getElementById(
        "get_data"
      ).innerHTML = `<div class="col-sm-12 d-flex justify-content-center align-items-center">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <b class="ms-2">Loading Data...</b>
                    </div>`;
    }
  
    // To cater pagination and search feature
    let queryParams =
      "?" +
      (url != "" ? new URL(url).searchParams + "&" : "") + // Remove this line if not using pagination
      (keyword != "" ? "keyword=" + keyword : "");
  
    // Get Carousel API Endpoint; Caters search
    const response = await fetch(backendURL + "/api/user" + queryParams, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
        "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
      },
    });
  
    // Get response if 200-299 status code
    if (response.ok) {
      const json = await response.json();
  
      // Get Each Json Elements and merge with Html element and put it into a container
      let container = "";
      // Now caters pagination; You can use "json.data" if using pagination or "json" only if no pagination
      json.data.forEach((element) => {
        const date = new Date(element.created_at).toLocaleString();
  
        container += `<div class="col-sm-12">
                          <div class="card w-100 mt-3" data-id="${element.id}">
  
                              <div class="row">
                                  <div class="col-sm-4 d-flex align-items-center">
                                      <img class="rounded" src="${backendURL}/storage/${element.image}" width="100%" height="270px">
                                  </div>
  
                                  <div class="col-sm-8">
                                      <div class="card-body">
                                  
                                          <div class="dropdown float-end">
                                              <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
                                              <ul class="dropdown-menu">
                                                  <li>
                                                      <a class="dropdown-item" href="#" id="btn_edit" data-id="${element.id}">Edit</a>
                                                  </li>
                                                  <li>
                                                      <a class="dropdown-item" href="#" id="btn_delete" data-id="${element.id}">Delete</a>
                                                  </li>
                                              </ul>
                                          </div>
                                      
                                          <small>First Name</small><h5 class="card-title">${element.firstname}</h5>
                                          <small>Last Name</small><h5 class="card-title">${element.lastname}</h5>                                         
                                          <small>Role</small><h5 class="card-title">${element.role}</h5>
                                          <small>Email</small><h5 class="card-title">${element.email}</h5
                                          <small>Password</small><h5 class="card-title">${element.password}</h5>
                                          <h6 class="card-subtitle mb-2 text-body-secondary">
                                              <small>${date}</small>
                                          </h6>
  
                                      </div>
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
  
      // Get Each Json Elements and merge with Html element and put it into a container
      let pagination = "";
      // Now caters pagination; Remove below if no pagination
      json.links.forEach((element) => {
        pagination += `<li class="page-item">
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
  
      // Assign click event on Page Btns
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
  
    getData("", formData.get("keyword"));
  };
  
  // Submit Form Functionality; This is for Create and Update
  const form_users = document.getElementById("form_users");
  
  form_users.onsubmit = async (e) => {
    e.preventDefault();
  
    // Disable Button
    document.querySelector("#form_users button[type='submit']").disabled = true;
    document.querySelector(
      "#form_users button[type='submit']"
    ).innerHTML = `<div class="spinner-border me-2" role="status">
                        </div>
                        <span>Loading...</span>`;
  
    // Get Values of Form (input, textarea, select) set it as form-data
    const formData = new FormData(form_users);
  
    // Check key/value pairs of FormData; Uncomment to debug
    // for (let [name, value] of formData) {
    //   console.log(`${name} = ${value}`); // key1 = value1, then key2 = value2
    // }
  
    let response;
    // Check if for_update_id is empty, if empty then it's create, else it's update
    if (for_update_id == "") {
      // Fetch API User Item Store Endpoint
      response = await fetch(backendURL + "/api/user", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
        },
        body: formData,
      });
    }
    // for Update
    else {
      // Add Method Spoofing to cater Image upload coz you are using FormData; Comment if no Image upload
      formData.append("_method", "PUT");
      // Fetch API User Item Update Endpoint
      response = await fetch(backendURL + "/api/user/" + for_update_id, {
        method: "POST", // Change to PUT/PATCH if no Image Upload
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
        },
        // Comment body below; if with Image Upload; form-data equivalent
        body: formData,
        // Uncomment body below; if no Image Upload; form-urlencoded equivalent
        // body: new URLSearchParams(formData)
      });
    }
  
    // Get response if 200-299 status code
    if (response.ok) {
      // Uncomment for debugging purpose
      // const json = await response.json();
      // console.log(json);
  
      // Reset Form
      form_users.reset();
  
      successNotification(
        "Successfully " +
          (for_update_id == "" ? "created" : "updated") +
          " user.",
        10
      );
  
      // Close Modal Form
      document.getElementById("modal_close").click();
  
      // Reload Page
      getData();
    }
    // Get response if 422 status code
    else if (response.status == 422) {
      const json = await response.json();
  
      // Close Modal Form
      document.getElementById("modal_close").click();
  
      errorNotification(json.message, 10);
    }
  
    // Always reset for_update_id to empty string
    for_update_id = "";
  
    document.querySelector("#form_users button[type='submit']").disabled = false;
    document.querySelector("#form_users button[type='submit']").innerHTML =
      "Submit";
  };
  
  // Delete Functionality
  const deleteAction = async (e) => {

      

      // Get Id from data-id attribute within the btn_delete anchor tag
      const id = e.target.getAttribute("data-id");
  
      // Background red the card that you want to delete
      document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor =
        "red";

      // Use JS Confirm to ask for confirmation; You can use bootstrap modal instead of this
      if (confirm("Are you sure you want to delete?")) {
  
      // Fetch API User Item Delete Endpoint
      const response = await fetch(backendURL + "/api/user/" + id, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
        },
      });
  
      // Get response if 200-299 status code
      if (response.ok) {
        // Uncomment for debugging purpose
        // const json = await response.json();
        // console.log(json);
  
        successNotification("Successfully deleted user.", 10);
  
        // Remove the Card from the list
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
    // Get Id from data-id attribute within the btn_edit anchor tag
    const id = e.target.getAttribute("data-id");
  
    // Show Functionality function call
    showData(id);
  
    // Show Modal Form
    document.getElementById("modal_show").click();
  };
  
  // Storage of Id of chosen data to update
  let for_update_id = "";
  
  // Show Functionality
  const showData = async (id) => {
    // Background yellow the card that you want to show
    document.querySelector(`.card[data-id="${id}"]`).style.backgroundColor =
      "yellow";
  
    // Fetch API User Item Show Endpoint
    const response = await fetch(backendURL + "/api/user/" + id, {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
        "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
      },
    });
  
    // Get response if 200-299 status code
    if (response.ok) {
      const json = await response.json();
      // console.log(json);
  
      // Store id to a variable; id will be utilize for update
      for_update_id = json.id;
  
      // Display json response to Form tags; make sure to set id attrbute on tags (input, textarea, select)
      document.getElementById("lastname").value = json.lastname;
      document.getElementById("firstname").value = json.firstname;
      document.getElementById("email").value = json.email;
      document.getElementById("role").value = json.role;
      document.getElementById("image").value = json.image;
      document.getElementById("password").value = json.password;
  
      // Change Button Text using textContent; either innerHTML or textContent is fine here
      document.querySelector("#form_users button[type='submit']").textContent =
        "Update Info";
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
    // Get url from data-url attrbute within the btn_paginate anchor tag
    const url = e.target.getAttribute("data-url");
  
    // Refresh card list
    getData(url);
  };
  