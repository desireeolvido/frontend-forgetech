// Backend URL
import { backendURL, successNotification, errorNotification } from "../utils/utils.js";

// Form Register
const form_login = document.getElementById("form_login");

form_login.onsubmit = async (e) => {
  e.preventDefault();

  // disable button
  document.querySelector("#form_login button").disabled = true;
  document.querySelector("#form_login button").innerHTML =
    `<div class="spinner-border me-2" role="status">
  <span class="visually-hidden">Loading...</span>
  </div> <span>Loading...</span>`;

  //   Get values of form (input, textarea, select) put it as form-data
  const formData = new FormData(form_login);

  //   fetch API user login endpoint
  const response = await fetch(
    backendURL + "/api/login",
    {
      method: 'POST',
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "69420", // Include ngrok bypass header directly
      },
      body: formData,
    }
  );

  // Get response if 200-299 status code
  if (response.ok) {
    const json = await response.json();
    console.log(json);

    // store token
    localStorage.setItem("token", json.token);

    // Store role
    localStorage.setItem("role", json.user.role);

    // Store role
    localStorage.setItem("image", json.user.image);

    form_login.reset();

    successNotification("Successfully login account.");

    window.location.pathname = "/vehicle.html"

  }
  // Get response if 422 status code
  else if (response.status == 422) {
    const json = await response.json();

    errorNotification(json.message, 5);

  }

  // Enable button
  document.querySelector("#form_login button").disabled = false;
  document.querySelector("#form_login button").innerHTML = 'Login';
};
