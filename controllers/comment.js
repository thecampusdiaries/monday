const Post = require('../models/post.js')
const Comment = require('../models/comment.js');

module.exports.writeComment = async (req, res) => {
    let post = await Post.findById(req.params.id);
    let newComment = new Comment(req.body.comment);
    newComment.author = req.user._id
    console.log(newComment)
    post.comments.push(newComment);
    await newComment.save();
    await post.save();
    console.log('Comment added');
    req.flash("success", "Comment Added Successfully !!")
    res.redirect(`/posts/${req.params.id}`)
}

module.exports.deleteComment = async (req, res) => {
    let { id, commentId } = req.params;
    await Comment.findByIdAndDelete(commentId);
    await Post.findByIdAndUpdate(id, {
        $pull: {
            comments: commentId
        }
    });
    console.log(`Comment '${commentId}' deleted`);
    req.flash("success", "Comment Deleted Successfully !!")
    res.redirect(`/posts/${id}`);
}

module.exports.likeComment = async (req, res) => {

    let post = await Post.findById(req.params.id);
    console.log(post)

    const { commentId } = req.params;
    const reqComment = await Comment.findById(commentId);

    const userId = req.user._id;    // like karel to user

    if (!reqComment) {
        req.flash('error', 'Cannot find that comment!');
        return res.redirect(`posts/${req.params.id}`);
    }

    const likedIndex = reqComment.likedBy.indexOf(userId);

    if (likedIndex === -1) {    // If user has not liked the post yet, like it
        reqComment.likes += 1;
        reqComment.likedBy.push(userId);
    } else {    // If user has already liked the post, unlike it
        reqComment.likes -= 1;
        reqComment.likedBy.splice(likedIndex, 1);
    }
    await reqComment.save();

    await post.save();
    res.redirect(`/posts/${req.params.id}`);
}