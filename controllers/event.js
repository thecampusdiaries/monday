const Event = require('../models/event.js')

module.exports.index = async (req, res) => {
    const events = await Event.find().populate('organizer').exec()
    res.render('event/index.ejs', { events })
}

module.exports.addEvent = async (req, res) => {
    const { name, description, date } = req.body;
    const event = new Event({
        name,
        description,
        date,
        organizer: req.user._id
    });
    await event.save();
    res.redirect(`/events/${event._id}`); // Redirect to event listing page
}

module.exports.renderNewForm = (req, res) => {
    res.render('event/new.ejs')
}
module.exports.showAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate({
                path: 'posts',
                populate: {
                    path: 'owner',
                    select: 'username' // Select only the username of the owner
                }
            })
            .populate('organizer', 'username') // Select only the username of the organizer
            .exec();

        res.render('event/index', { events });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching events');
    }
};
module.exports.showEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId)
            .populate('organizer')
            .populate({
                path: 'posts',
                populate: {
                    path: 'owner',
                    select: 'username'  // Assuming owner has a 'name' field
                }
            })
            .exec();

        if (!event) {
            return res.status(404).send('Event not found');
        }

        res.render('event/show', { event });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching event');
    }
};