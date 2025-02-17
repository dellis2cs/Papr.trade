const { Router } = require("express");
const router = Router();
const userController = require("../controllers/userController");

router.post("/login", userController.login);
router.post("/signup", userController.signup);
router.post("/username", userController.updateUsername);
module.exports = router;
