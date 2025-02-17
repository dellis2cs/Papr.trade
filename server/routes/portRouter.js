const { Router } = require("express");
const router = Router();
const portController = require("../controllers/portController");

router.get("/balance", portController.getBalance);
router.post("/deposit", portController.depositFunds);
module.exports = router;
