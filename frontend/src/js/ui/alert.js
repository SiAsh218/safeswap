class Alert {
  constructor() {
    this.alert = undefined;
    this.id = 0;
  }

  /**
   * Method to render a custom alert message.  Type 'error' is red, 'success' is green and 'info' is yellow
   * @param {String} message the message to be displayed (default = Something has gone wrong)
   * @param {String} type the message type "error" or "success" (default = "error")
   * @param {Number} time the seconds the message will be displayed for (default = 3)
   */
  render(message = "Something has gone wrong", type = "error", time = 3) {
    let fill = this.getAlertColour(type);

    this.markup = `<div class="alert" style="position: fixed; top: 0; z-index: 999; width: 100%; display: flex; justify-content: center; background-color: ${fill}; box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.5);" id="alert--${this.id}">
              <span style="padding: 5px; font-size: 18px; font-weight: bold;" >${message}</span>
            </div>`;

    const id = this.id;

    this.removeAllAlerts();

    document
      .querySelector("body")
      .insertAdjacentHTML("afterbegin", this.markup);

    setTimeout(() => {
      this.removeAlert(id);
    }, time * 1000);

    this.id++;
  }

  getAlertColour(type) {
    let fill = "";
    switch (type) {
      case "error":
        fill = "#f64f5f";
        break;
      case "success":
        fill = "#77DD77";
        break;
      case "info":
        fill = "#FDFD96";
        break;

      default:
        fill = "#f64f5f";
    }
    return fill;
  }

  /**
   * Remove alert form the DOM by id
   * @param {String} id the id of the alert
   */
  removeAlert(id) {
    if (document.getElementById(`alert--${id}`)) {
      document.getElementById(`alert--${id}`).remove();
    }
  }

  /**
   * Remove all alerts from the DOM
   */
  removeAllAlerts() {
    if (document.querySelector(".alert")) {
      document.querySelectorAll(".alert").forEach((alert) => alert.remove());
    }
  }
}

export default new Alert();
