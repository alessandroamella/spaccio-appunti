const paypalButtonsComponent = paypal.Buttons({
    style: {
        color: "gold",
        shape: "rect",
        layout: "vertical"
    },

    // set up the transaction
    createOrder: async (data, actions) => {
        const res = await axios.post("/api/order", {
            id: parseInt(
                document
                    .querySelector('input[name="item"]:checked')
                    .id.split("select-")[1]
            )
        });
        return res.data.id;
    },

    // finalize the transaction
    onApprove: async (data, actions) => {
        const res = await axios.post("/api/capture", { id: data.orderID });
        document.getElementById("code").value = res.data.id;
        document.getElementById("download-btn").click();
    },

    // handle unrecoverable errors
    onError: err => {
        console.error(
            "An error prevented the buyer from checking out with PayPal",
            err
        );
        alert("errore");
    }
});

paypalButtonsComponent.render("#paypal-button-container").catch(err => {
    console.error("PayPal Buttons failed to render");
});
