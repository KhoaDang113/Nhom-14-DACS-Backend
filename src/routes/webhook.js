const webhookRouter = require("express").Router();
const { handleWebHook } = require("../controllers/webhookController");

webhookRouter.post("/", handleWebHook);
module.exports = webhookRouter;
