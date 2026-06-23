const Listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.index = async (req,res)=>{
    const {category} = req.query;
    let allListing;
    if(category){
        allListing = await Listing.find({categories: category});
    }else{
        allListing = await Listing.find({});
    }
    res.render("../views/listings/index.ejs" , {allListing, currentCategory: category || null});
};

module.exports.renderNewForm = async (req,res)=>{
    res.render("../views/listings/new.ejs");
};

module.exports.newListing = async (req,res)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    // let{title, description, image, price, location, country} = req.body;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};

    try {
        const query = `${newListing.location}, ${newListing.country}`;
        const encodedQuery = encodeURIComponent(query);

        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`, {
            headers: {
                'User-Agent': process.env.USER_AGENT 
            }
        });
        const geoData = await response.json();

        if (geoData && geoData.length > 0) {
            const lat = parseFloat(geoData[0].lat);
            const lng = parseFloat(geoData[0].lon);
            
            newListing.geometry = {
                type: "Point",
                coordinates: [lng, lat]
            };
        } else {
            newListing.geometry = {
                type: "Point",
                coordinates: [78.9629, 20.5937]
            };
        }
    } catch (err) {
        console.log("Geocoding Error:", err);
        newListing.geometry = { type: "Point", coordinates: [78.9629, 20.5937] };
    }

    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
};

module.exports.showListing = async (req,res)=>{
    let {id} = req.params;

    const listing = await Listing.findById(id).populate({path: "reviews",populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested doesn't exist!");
        res.redirect("/listings");
    }

    const bookings = await Booking.find({listing: listing._id});
    const bookedDates = bookings.map(booking=>{
        return{
            from: booking.checkIn,
            to: booking.checkOut
        };
    });
    res.render("../views/listings/show.ejs" , {listing, bookedDates});
};

module.exports.renderEditListing = async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","listing you requested doesn't exist");
        req.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    if (originalImageUrl && originalImageUrl.includes("/upload")) {
        originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    }
    res.render("../views/listings/edit.ejs" , {listing, originalImageUrl});
};

module.exports.editListing = async (req, res) => {
    let { id } = req.params;

    try {
        const query = `${req.body.listing.location}, ${req.body.listing.country}`;
        const encodedQuery = encodeURIComponent(query);

        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`, {
            headers: {
                'User-Agent': process.env.USER_AGENT 
            }
        });

        if (response.ok) {
            const geoData = await response.json();
            if (geoData && geoData.length > 0) {
                req.body.listing.geometry = {
                    type: "Point",
                    coordinates: [parseFloat(geoData[0].lon), parseFloat(geoData[0].lat)]
                };
            }
        }
    } catch (err) {
        console.log("Geocoding Error:", err.message);
    }

    if (typeof req.file !== "undefined") {
        req.body.listing.image = { url: req.file.path, filename: req.file.filename };
    }

    await Listing.findByIdAndUpdate(id, req.body.listing, { returnDocument: 'after' });

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};

module.exports.searchListings = async(req,res)=>{
    let {query} = req.query;
    if(!query){
        return res.redirect("/listings");
    }
    const allListings = await Listing.find({
        $or: [
            { location: { $regex: query, $options: "i" } },
            { country: { $regex: query, $options: "i" } },
            { title: { $regex: query, $options: "i" } }
        ]
    });

    if(allListings.length === 0){
        req.flash("error", `No listings found for "${query}"`);
        return res.redirect("/listings");
    }

    res.locals.success = `${allListings.length} listings found for "${query}"`;
    res.render("listings/search.ejs",{allListings});
};

module.exports.reserveListing = async(req,res)=>{
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        const newBooking = new Booking(req.body.booking);


        newBooking.author = req.user._id;
        newBooking.listing = listing._id;

        await newBooking.save();

        req.flash("success", "Reservation successfully created! Pack your bags!");
        res.redirect(`/listings/${listing._id}`);

    } catch (e) {
        req.flash("error", "Something went wrong with your booking: " + e.message);
        res.redirect(`/listings/${req.params.id}`);
    }
};

module.exports.rendertrips = async(req,res)=>{
    try{
        let trips = await Booking.find({author: req.user._id}).populate("listing");
        res.render("../views/listings/mytrips.ejs" , {trips});
    }catch(e){
        req.flash("error","Couldn't fetch your trips.");
        console.log(e.message);
        res.redirect("/listings");
    }
};

module.exports.renderHostDashboard = async(req,res)=>{
    try{
        const myListings = await Listing.find({owner: req.user._id});
        const listingIds = myListings.map(listing => listing._id);
        const reservations = await Booking.find({listing: { $in: listingIds }}).populate("listing").populate("author");
        res.render("../views/listings/hostDashboard.ejs", { reservations });
    }catch(e){
        req.flash("error", "Could not load the host dashboard.");
        res.redirect("/listings");
        console.log(e.message);
    }
};