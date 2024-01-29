function setRouter() {
    switch (window.location.pathname) {
        // If you are logged in you cant access outside pages
        case "/login.html":
        case "/register.html":
            if (localStorage.getItem("token")) {
                window.location.pathname = "/dashboard.html"
            }
            break;
        // If you are not logged in you cant access dashboard pages
        case "/dashboard.html":
        // case "/":
        case "/owners.html":
        case "/declaration.html":
        // case "/register.html":
            if (!localStorage.getItem("token")) {
                window.location.pathname = "/login.html";
            }
            break;
        case "/users.html":
            if (localStorage.getItem("role") != "Dealer" || localStorage.getItem("role") != "Admin") {
                window.location.pathname = "/dashboard.html";
            }
        default:
            break;

    }
}

export {setRouter};