const path = require("path");
const viewController = require("./controllers/viewController.js");

const templateEngine = require("./templateEngine.js");

class Router {
  constructor() {
    this.routes = {};
  }

  async handleRequest(req, res) {
    console.log("Request URL: " + req.url);

    if (req.url === "/" && req.method === "GET") {
      let template = await templateEngine.readFileUtf8(
        path.join(viewController.viewsPath, "index.html"),
      );

      await viewController.render(template, res);
    }
  }
}

const router = new Router();
module.exports = router;
