/*
==================================================
BOOK BADDIES ADMIN
==================================================
*/


let allOrders = [];

let currentOrder = null;


/*
==================================================
CHECK ADMIN
==================================================
*/

async function checkAdmin() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (!session) {

        showLogin();

        return false;

    }


    const {
        data: admin,
        error
    } = await supabaseClient
        .from("admins")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();


    if (error || !admin) {

        await supabaseClient.auth.signOut();

        showLogin();

        document.getElementById("loginError").textContent =
            "This account does not have administrator access.";

        return false;

    }


    showDashboard();

    return true;

}


/*
==================================================
SHOW LOGIN
==================================================
*/

function showLogin() {

    document
        .getElementById("loginScreen")
        .classList.remove("hidden");

    document
        .getElementById("dashboardScreen")
        .classList.add("hidden");

}


/*
==================================================
SHOW DASHBOARD
==================================================
*/

function showDashboard() {

    document
        .getElementById("loginScreen")
        .classList.add("hidden");

    document
        .getElementById("dashboardScreen")
        .classList.remove("hidden");

    loadOrders();

}


/*
==================================================
LOGIN
==================================================
*/

document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                .getElementById("loginEmail")
                .value
                .trim();


            const password =
                document
                .getElementById("loginPassword")
                .value;


            const errorBox =
                document
                .getElementById("loginError");


            errorBox.textContent =
                "Logging in...";


            const {
                data,
                error
            } =
                await supabaseClient.auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


            if (error) {

                errorBox.textContent =
                    "Incorrect email or password.";

                return;

            }


            /*
            Check whether this user is
            actually the Book Baddies admin.
            */

            const {
                data: admin
            } =
                await supabaseClient
                .from("admins")
                .select("user_id")
                .eq(
                    "user_id",
                    data.user.id
                )
                .maybeSingle();


            if (!admin) {

                await supabaseClient.auth.signOut();

                errorBox.textContent =
                    "This account is not authorised to access the admin area.";

                return;

            }


            errorBox.textContent = "";

            showDashboard();

        }
    );


/*
==================================================
LOAD ORDERS
==================================================
*/

async function loadOrders() {

    const table =
        document.getElementById("ordersTable");


    table.innerHTML =
        `<tr>
            <td colspan="7">
                Loading orders...
            </td>
        </tr>`;


    const {
        data,
        error
    } =
        await supabaseClient
        .from("orders")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(error);

        table.innerHTML =
            `<tr>
                <td colspan="7">
                    Could not load orders.
                </td>
            </tr>`;

        return;

    }


    allOrders =
        data || [];


    updateStatistics();

    displayOrders(allOrders);

}


/*
==================================================
STATISTICS
==================================================
*/

function updateStatistics() {

    document
        .getElementById("totalOrders")
        .textContent =
        allOrders.length;


    document
        .getElementById("newOrders")
        .textContent =
        allOrders.filter(
            order =>
            order.status === "New"
        ).length;


    document
        .getElementById("paidOrders")
        .textContent =
        allOrders.filter(
            order =>
            order.status === "Paid"
        ).length;


    document
        .getElementById("shippedOrders")
        .textContent =
        allOrders.filter(
            order =>
            order.status === "Shipped"
        ).length;

}


/*
==================================================
DISPLAY ORDERS
==================================================
*/

function displayOrders(orders) {

    const table =
        document.getElementById("ordersTable");


    const empty =
        document.getElementById("emptyOrders");


    if (!orders.length) {

        table.innerHTML = "";

        empty.classList.remove("hidden");

        return;

    }


    empty.classList.add("hidden");


    table.innerHTML =
        orders.map(
            order => {

                const date =
                    new Date(
                        order.created_at
                    )
                    .toLocaleDateString(
                        "en-ZA",
                        {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                        }
                    );


                return `

                <tr>

                    <td>
                        <strong>
                            #${order.id}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            order.customer_name
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.product
                        )}
                    </td>

                    <td>
                        ${order.quantity}
                    </td>

                    <td>

                        <span class="status">
                            ${escapeHTML(
                                order.status
                            )}
                        </span>

                    </td>

                    <td>
                        ${date}
                    </td>

                    <td>

                        <button
                        class="view-button"
                        onclick="openOrder(${order.id})">

                            View

                        </button>

                    </td>

                </tr>

                `;

            }
        )
        .join("");

}


/*
==================================================
SEARCH
==================================================
*/

document
    .getElementById("searchOrders")
    .addEventListener(
        "input",
        filterOrders
    );


document
    .getElementById("statusFilter")
    .addEventListener(
        "change",
        filterOrders
    );


function filterOrders() {

    const search =
        document
        .getElementById("searchOrders")
        .value
        .toLowerCase()
        .trim();


    const status =
        document
        .getElementById("statusFilter")
        .value;


    const filtered =
        allOrders.filter(
            order => {

                const matchesSearch =

                    order.customer_name
                    .toLowerCase()
                    .includes(search)

                    ||

                    order.product
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(order.id)
                    .includes(search);


                const matchesStatus =

                    status === "all"

                    ||

                    order.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    displayOrders(filtered);

}


/*
==================================================
OPEN ORDER
==================================================
*/

function openOrder(id) {

    currentOrder =
        allOrders.find(
            order =>
            order.id === id
        );


    if (!currentOrder) {
        return;
    }


    document
        .getElementById("modalOrderNumber")
        .textContent =
        "#" + currentOrder.id;


    document
        .getElementById("modalName")
        .textContent =
        currentOrder.customer_name;


    document
        .getElementById("modalPhone")
        .textContent =
        currentOrder.phone;


    document
        .getElementById("modalProduct")
        .textContent =
        currentOrder.product;


    document
        .getElementById("modalQuantity")
        .textContent =
        currentOrder.quantity;


    document
        .getElementById("modalLocker")
        .textContent =
        currentOrder.pudo_locker;


    document
        .getElementById("modalDate")
        .textContent =
        new Date(
            currentOrder.created_at
        ).toLocaleString(
            "en-ZA"
        );


    document
        .getElementById("modalNotes")
        .textContent =
        currentOrder.notes ||
        "No additional notes.";


    document
        .getElementById("modalStatus")
        .value =
        currentOrder.status;


    document
        .getElementById("statusMessage")
        .textContent =
        "";


    document
        .getElementById("orderModal")
        .classList.remove("hidden");

}


/*
==================================================
CLOSE ORDER
==================================================
*/

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


document
    .getElementById("orderModal")
    .addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                this
            ) {

                closeModal();

            }

        }
    );


function closeModal() {

    document
        .getElementById("orderModal")
        .classList.add("hidden");

}


/*
==================================================
SAVE STATUS
==================================================
*/

document
    .getElementById("saveStatus")
    .addEventListener(
        "click",
        async function() {

            if (!currentOrder) {
                return;
            }


            const newStatus =
                document
                .getElementById("modalStatus")
                .value;


            const button =
                document
                .getElementById("saveStatus");


            button.disabled = true;

            button.textContent =
                "Saving...";


            const {
                error
            } =
                await supabaseClient
                .from("orders")
                .update({
                    status: newStatus
                })
                .eq(
                    "id",
                    currentOrder.id
                );


            button.disabled = false;

            button.textContent =
                "Save Status";


            if (error) {

                console.error(error);

                document
                    .getElementById(
                        "statusMessage"
                    )
                    .textContent =
                    "Could not update the order.";

                return;

            }


            document
                .getElementById(
                    "statusMessage"
                )
                .textContent =
                "♡ Order status updated!";


            await loadOrders();


            currentOrder =
                allOrders.find(
                    order =>
                    order.id === currentOrder.id
                );

        }
    );


/*
==================================================
REFRESH
==================================================
*/

document
    .getElementById("refreshButton")
    .addEventListener(
        "click",
        loadOrders
    );


/*
==================================================
LOGOUT
==================================================
*/

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        async function() {

            await supabaseClient.auth.signOut();

            showLogin();

        }
    );


/*
==================================================
HTML ESCAPE
==================================================
*/

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/*
==================================================
START
==================================================
*/

checkAdmin();