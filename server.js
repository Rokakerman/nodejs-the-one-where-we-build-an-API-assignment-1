//const bodyParser = require ("body-parser");
const express = require("express");
const app = express();
const lowdb = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("database.json");
const database = lowdb(adapter);
const port = process.env.PORT || 3300;

app.use(express.static("public"));

const initiateDatabase = () => {
    const databaseInitiated = database.has("Catalogue").value();
    const shopingcartInitiated = database.has("Shopingcart").value();

    if (!databaseInitiated) {
        database.defaults({ Catalogue: [
            {
                Team: "Sauber",
                Name: "Alfa Romeo Racing C38",
                Price: "20M",
                Id: "1",
                Picture: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/alfa1-1550585365.jpg?crop=0.939xw:0.674xh;0.0401xw,0.161xh&resize=768:*"
            },
            {   
                Team: "Ferrari",
                Name: "Scuderia Ferrari SF90",
                Price: "48M",
                Id: "2",
                Picture: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/f1-1550238505.jpeg?crop=0.670xw:0.512xh;0.185xw,0.364xh&resize=980:*"
            },
            {
                Team: "Williams",
                Name: "Williams Racing FW42",
                Price: "16M",
                Id: "3",
                Picture: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/fw42-1550241762.jpg?crop=0.833xw:0.740xh;0.0697xw,0.154xh&resize=980:*"
            },
            {
                Team: "Mclaren",
                Name: "McLaren MCL34",
                Price: "28M",
                Id: "4",
                Picture: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/mcl34-website-2000x1100-c2-1550157567.jpg?crop=1xw:1xh;center,top&resize=980:*"
            },
            {
                Team: "Racingpoint",
                Name: "Racing Point F1 RP19",
                Price: "25M",
                Id: "5",
                Picture: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/screen-shot-2019-02-13-at-10-31-40-am-1550071961.png?crop=1xw:1xh;center,top&resize=980:*"
            },
            {
                Tean: "Mercedes",
                Name: "Mercedes-AMG Petronas W10",
                Price: "50M",
                Id: "6",
                Picture: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/petronas1-1550066805.jpg?crop=1.00xw:0.674xh;0,0.276xh&resize=980:*"
            },
            {
                Team: "Redbull",
                Name: "Red Bull Racing RB15",
                Price: "34M",
                Id: "7",
                Picture: "https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/gettyimages-1129368704.jpg?crop=0.821xw:0.615xh;0.0782xw,0.385xh&resize=980:*"
            }
        ] }).write();
    }

    if (!shopingcartInitiated) {
        database.defaults({ Shopingcart: [] }).write();
    }
}

app.get("/api/catalogue", async (request, response) => {
    console.log("Test:1", request.url);
    const products = await database.get('Catalogue').value();
    let msg = {
        // Default meddelande
        Succes: true,
        Status: 200,
        Message: "Catalogue loaded"
    }

    console.log(msg);
    response.send(products);
    return 
});


// Jag vill kunna lägga till produkter i en varukorg (KLAR)
app.post("/api/add", async (request, response) => {
    const productTeam = await request.query.car;
    const thisCartItemExists = await checkCartItem(productTeam);
    const product = await database.get('Catalogue').find({Team: productTeam}).value();
    let msg = {
        // Default meddelande
        Succes: false,
        Status: 200,
        Message: "The product does not exist, check for spelling error's"
    }

    if (thisCartItemExists == true) {
        msg.Message = "This product already exist's in your cart"
        response.send(msg);
        console.log(msg);

        return
    } else if (product != null) {
        msg.Succes = true ;
        msg.Status = 200;
        msg.Message = "Your products has been added to your cart!";
        await database.get("Shopingcart").push(product).write();

        response.send(msg);
        console.log(msg);

        return
    } else 

    response.send(msg);
    console.log(msg);
    return
});

// Jag vill kunna ta bort produkter från min varukorg (KLAR)
app.delete("/api/remove", async (request, response) => {
    const productTeam = await request.query.car;
    const thisCartItemExists = await checkCartItem(productTeam);
    let msg = {
        // Default meddelande
        Succes: false,
        Status: 200,
        Message: "This product does not exist in your cart"
    }

   
    if (thisCartItemExists == true) {
        msg.Succes= true ;
        msg.Status = 200;
        msg.Message = "Your product has been removed from your cart";
        await database.get('Shopingcart').remove({Team: productTeam}).write();

        console.log(msg)
        response.send(msg);
        return
    }

    console.log(msg)
    response.send(msg);
    return 
})

// Jag vill kunna se min varukorg och allt i den (KLAR)
app.get("/api/cart", async (request, response) => {
    const cart = await database.get("Shopingcart").value()
    let msg = {
        // Default meddelande
        Succes: true,
        Status: 200,
        Message: "Cart loaded"
    };

    console.log(msg)
    response.send(cart)
    return
})

// Jag vill bli påmind om produkten redan finns i min varukorg (KLAR)
const checkCartItem = async (productTeam) => {
    let thisCartItemExists = false;
    const product = await database.get("Shopingcart").find({Team: productTeam}).value();

    if (product != null) {
        thisCartItemExists = true;
        return thisCartItemExists
    }

    return thisCartItemExists
}


app.listen(port, () => {
    console.log("starting server", port);
    initiateDatabase();
});
