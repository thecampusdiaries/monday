const Post = require('../models/post.js')
const Event = require('../models/event.js')

module.exports.createPost = async (req, res) => {

    const { title, caption, eventId } = req.body;
    const event = await Event.findById(eventId);

    if (!event) {
        return res.status(404).send('Event not found');
    }
    const newPost = new Post({
        title,
        caption,
        owner: event.organizer._id, // Use organizer's ObjectId as the owner
        event: eventId
    });

    const url = req.file.path
    const filename = req.file.filename
    newPost.image = { url, filename }

    newPost.owner = req.user._id

    await newPost.save();

    event.posts.push(newPost._id);
    await event.save();
    console.log('all done')
    res.redirect(`/events/${eventId}/`); // Redirect to the event page after adding post
};

module.exports.renderPostForm = async (req, res) => {
    const events = await Event.find({ organizer: req.user._id });
    return res.render('post/new', { events });
};

module.exports.showPost = async (req, res) => {
    let { id } = req.params;
    const post = await Post.findById(id)
        .populate({
            path: "comments",
            populate: {
                path: "author",
            }
        })
        .populate('owner');
    if (!post) {
        req.flash("error", "The post you are trying to access does not exist.")
        res.redirect('/explore')
    }
    res.render('post/show.ejs', { post });
}


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let post = await Post.findById(id);
    if (!post) {
        req.flash("error", "The post you are trying to edit does not exist.")
        res.redirect('/explore')
    }
    let imgUrl = post.image.url;
    imgUrl = imgUrl.replace('/upload', '/upload/w_250')
    res.render('post/edit.ejs', { post, imgUrl });
}

module.exports.updatePost = async (req, res) => {
    let { id } = req.params;
    let post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    if (req.file) {
        const url = req.file.path
        const filename = req.file.filename
        console.table([url, filename])
        post.image = { url, filename }
        await post.save()
    }
    await post.save();
    req.flash("success", "Post Updated Successfully !!")
    res.redirect(`/posts/${id}`);
}

module.exports.deletePost = async (req, res) => {
    let { id } = req.params;
    await Post.findByIdAndDelete(id);
    console.log(`${id} deleted !!`);
    req.flash("success", "Post Deleted Successfully !!")
    res.redirect('/explore');
}

module.exports.likePost = async (req, res) => {
    const { id, commentId } = req.params;
    const user = req.user;

    try {
        let post;
        if (commentId) {
            // Like/unlike comment
            post = await Post.findOneAndUpdate(
                { _id: id, 'comments._id': commentId },
                {
                    $addToSet: { 'comments.$.likedBy': user._id },
                    $inc: { 'comments.$.likes': 1 }
                },
                { new: true }
            );
        } else {
            // Like/unlike post
            post = await Post.findByIdAndUpdate(id, {
                $addToSet: { likedBy: user._id },
                $inc: { likes: 1 }
            }, { new: true });
        }

        if (!post) {
            return res.status(404).json({ error: 'Post or comment not found' });
        }

        res.json({ likes: commentId ? post.comments.find(c => c._id.equals(commentId)).likes : post.likes });
    } catch (error) {
        console.error('Error liking post/comment:', error);
        res.status(500).json({ error: 'Could not update likes' });
    }
};