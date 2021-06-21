const express = require("express");
const request = require("request");
const config = require("config");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

//@route GET api/profile/me
//@desc Get current user profile
//@access Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]); //the user:req.user.id pertain  to our user in profile model // the populate('user -is our user model

    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
    res.json(profile); //if profile exists we return it in json form
  } catch (err) {
    console.error(err.message);
    res.status.send(500).send("server error");
  }
});

//@route POST api/profile/
//@desc create/update user profile
//@access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required").not().isEmpty(),
      check("skills", "skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      //taking our skiils as an array
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    //build social boject
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //if the prifle already exist we just update it
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //if no profile we create
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);

//@route GET api/profile
//@desc get all profiles
//@access Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route GET api/profile/user/:user_id
//@desc get profile by user ID
//@access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id, //id will come from the url
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "profile not found" });

    res.json(profile); //else return the profile
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

//@route DELETE api/profile  .//DELETING ACCOUNT
//@desc  Delete profile,user and post
//@access Private
router.delete("/", auth, async (req, res) => {
  try {
    //remove user posts
    await Post.deleteMany({user:req.user.id});
    //Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route PUT api/profile/experience
//@desc  Add profile experience
//@access Private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "company is required").not().isEmpty(),
      check("from", "from Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      //fetch the profile first where we want to add the experience
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp); //add our newExp in the experience array //check the Profile model for more
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route DELEE api/profile/experience/:exp_id
//@desc Delete experience from profile
//@access Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //Get the remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//////////////////////
//@route PUT api/profile/education
//@desc  Add profile education
//@access Private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required").not().isEmpty(),
      check("degree", "degree is required").not().isEmpty(),
      check("fieldofstudy", "Field of study is required").not().isEmpty(),
      check("from", "from Date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      //fetch the profile first where we want to add the experience
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu); //add our newExp in the experience array //check the Profile model for more
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route DELETE api/profile/education/:edu_id
//@desc Delete education from profile
//@access Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    //Get the remove index
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route GET api/profile/github/:username
//@desc Get user repos from Github
//@access Public

router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`,
      method:'GET',
      headers:{'user-agent':'node.js'}
    };
    request(options,(error,response,body)=>{
      if(error) console.error(error);
      if(response.statusCode !== 200){
        return res.status(404).json({msg:'No github profile found'})
      }
      res.json(JSON.parse(body));
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
//npm run server

// //@route GET api/profile/follow
// //@desc follow 
// //@access Public

// router.post('/follow',auth, async (req,res)=>{
// try {
 
  
// } catch (err) {
//   res.status(500).send("server Error")
// }

// })

// //@route GET api/profile/unfollow/:id
// //@desc follow 
// //@access Public

// router.post('/follow/:id',auth, async (req,res)=>{
// try {
  
// } catch (err) {
//   res.status(500).send("server Error")
// }

// })

