const mongoose = require("mongoose"); 
const Review = require("./review.js"); // Ensure this path is correct
const Schema = mongoose.Schema;

const listingschema = new Schema({
    title: String,
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://media.istockphoto.com/id/1157048446/photo/aerial-shot-of-the-beach-from-above-showing-sea-beach-mountain-and-a-coconut-plantation-goa.jpg?s=170x170&k=20&c=mClQg10S6oxRf898dEsJws820tlnQxSkDiqsyhFE7SY=",
            set: (v) => v === "" ? "https://media.istockphoto.com/id/1157048446/photo/aerial-shot-of-the-beach-from-above-showing-sea-beach-mountain-and-a-coconut-plantation-goa.jpg?s=170x170&k=20&c=mClQg10S6oxRf898dEsJws820tlnQxSkDiqsyhFE7SY=" : v,
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",       
    },
    
    // Add availability field
    availability: [
        {
            title: {
                type: String,
                enum: ['Available', 'Booked'], // You can add more statuses if needed
                required: true
            },
            start: {
                type: Date,
                required: true
            },
            end: {
                type: Date,
                required: true
            },
            color: {
                type: String,
                default: '#00ff00' // Default color for availability
            }
        }
    ]
});

// Cascade delete reviews when a listing is deleted
listingschema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingschema);
module.exports = Listing;
