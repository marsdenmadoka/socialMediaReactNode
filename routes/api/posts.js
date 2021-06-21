const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

//@route POST api/post
//@desc  create a post
//@access private

router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,//comes from our Post model
        name: user.name,//comes from our user model/collection
        avatar: user.avatar,//comes from our user model/collection
        user: req.user.id,//comes from our user model/collection
      });

      const post = await newPost.save();//save in our post collection
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route GET api/post
//@desc  GET all posts
//@access private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); //sort by date -1 so that we can get the most recent one
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

//@route GET api/post/:postid
//@desc  GET post by ID
//@access private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("server error");
  }
});

//@route DELETE api/post/:postid
//@desc DELETE post by ID
//@access private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    //check user-we want to make sure that its the owner of the post who can delete it
    if (post.user.toString() !== req.user.id) {
      res.status(401).json({ msg: "user not authorized" });
    }

    //else if its the owner
    await post.remove();
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
  }
});

//@route PUT api/post/like/:postid
//@desc LIKE A post
//@access private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been liked //user cannt like the same post twice
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }
    //else save the like
    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server Error");
  }
});

//@route PUT api/post/unlike/:postid
//@desc UNLIKE A post
//@access private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if the post has already been liked since we cannot unlikea post that we havent liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "post has not yet been liked" });
    }

    //remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server Error");
  }
});

//@route Comment api/post/comment/:postid
//@desc  comment on a post
//@access private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route DELETE api/post/comment/:post_id/:comment_id
//@desc delete a  comment
//@access private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //pull out the comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //make sure comment exists
    if (!comment) {
      return res.status(400).json({ msg: "comment does not exist" });
    }
    //check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(400).json({ msg: "User not authorized" });
    }

    //remove index
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
