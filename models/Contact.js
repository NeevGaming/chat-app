const moongose = require("mongoose");


const scheme = new moongose.Schema({
    email : String ,
    contacts: [
        {
            name: String,
            email: String,
            messages: [
                {
                    sender: String,
                    text: String,
                    time: String
                }
            ]
        }
    ]
}); 

const Contact = moongose.model("Contact", scheme);


module.exports = Contact;