class Toggle {
  constructor() {}

  handleClick(toggle) {
    if (toggle.id === "my-toggle__input--search-by") {
      this.handleSearchByToggle(toggle);
    } else if (toggle.id === "my-toggle__input--cross-cover") {
      this.handleCrossOverToggle(toggle);
    } else if (toggle.id === "my-toggle__input--start-of-day") {
      this.handleStartOfDayToggle(toggle);
    } else if (toggle.id === "my-toggle__input--swap-with") {
      this.handleSwapWithToggle(toggle);
    }
  }

  getWrapper(toggle) {
    return toggle.closest(".my-toggle__wrapper");
  }

  getLabel(toggle) {
    return this.getWrapper(toggle).querySelector(".my-toggle__label");
  }

  handleSearchByToggle(toggle) {
    const formLabel = document.getElementById("text--form-heading-start");
    const headcodeSelector = document.getElementById("input--headcodes");
    const startOfDaySelector = document.getElementById("input--start");
    const toggleLabel = this.getLabel(toggle);
    if (toggle.checked) {
      toggleLabel.textContent = "Search by Headcode";
      formLabel.textContent = "Headcode";
      headcodeSelector.classList.remove("hidden");
      startOfDaySelector.classList.add("hidden");

      const swapWithToggle = document.getElementById("my-toggle--swap-with");
      this.unhideToggle(swapWithToggle);
    } else {
      toggleLabel.textContent = "Search by Start of Day Location";
      formLabel.textContent = "Start of Day";
      headcodeSelector.classList.add("hidden");
      startOfDaySelector.classList.remove("hidden");
      const swapWithToggle = document.getElementById("my-toggle--swap-with");
      this.hideToggle(swapWithToggle);
    }
  }

  unhideToggle(toggle) {
    this.getWrapper(toggle).classList.remove("hidden");
  }

  hideToggle(toggle) {
    this.getWrapper(toggle).classList.add("hidden");
  }

  handleCrossOverToggle(toggle) {
    const toggleLabel = this.getLabel(toggle);
    const container = document.getElementById(
      "container--cross-cover-selections"
    );

    if (toggle.checked) {
      toggleLabel.textContent = "Cross Cover Enabled";
      container.classList.remove("hidden");
    } else {
      toggleLabel.textContent = "Cross Cover Disabled";
      container.classList.add("hidden");
    }
  }

  handleStartOfDayToggle(toggle) {
    const toggleLabel = this.getLabel(toggle);
    if (toggle.checked) {
      toggleLabel.textContent =
        "Include swap options where trains start at the same location";
    } else {
      toggleLabel.textContent =
        "Exclude swap options where trains start at the same location";
    }
  }

  handleSwapWithToggle(toggle) {
    const toggleLabel = this.getLabel(toggle);
    const formLabel = document.getElementById("text--form-heading-end");
    const headcodeSelectorSwap = document.getElementById(
      "input--headcodes-swap"
    );
    const endOfDaySelector = document.getElementById("input--end");
    if (toggle.checked) {
      toggleLabel.textContent = "Swap by Headcode";
      formLabel.textContent = "Headcode";
      endOfDaySelector.classList.add("hidden");
      headcodeSelectorSwap.classList.remove("hidden");
    } else {
      toggleLabel.textContent = "Swap by End of Day Location";
      formLabel.textContent = "End of Day";
      endOfDaySelector.classList.remove("hidden");
      headcodeSelectorSwap.classList.add("hidden");
    }
  }
}

export default new Toggle();
