/**
 * Class representing a file input handler.
 * Handles UI updates and file reading from file input elements.
 */
class FileInput {
  constructor() {
    this.addFileInputChangeListeners();
  }

  /**
   * Adds change event listeners to all file input elements on the page.
   * Displays the Go button and sets the label text to the selected file name when a file is selected.
   */
  addFileInputChangeListeners() {
    const fileinputs = document.querySelectorAll("input[type='file']");

    if (fileinputs.length > 0) {
      for (const input of fileinputs) {
        input.addEventListener("change", () => {
          if (input.files.length < 1) return;

          const label = input
            .closest(".fileinput")
            .querySelector(".fileinput__label");

          const goButton = input
            .closest(".fileinput")
            .querySelector(".fileinput__button--go");

          goButton.style.opacity = "1";
          goButton.disabled = false;

          label.title = label.textContent = input.files[0].name;
        });
      }
    }
  }

  /**
   * Handles button clicks within `.fileinput` containers.
   * If the "Select File" button is clicked, triggers the file input.
   * If the "Go" button is clicked, returns the selected file.
   *
   * @param {MouseEvent} e - The click event.
   * @returns {File|false} The selected file, or false if none was selected or no relevant button was clicked.
   */
  handleClick(e) {
    const fileinput = e.target.closest(".fileinput");

    const button = e.target.closest(".fileinput__button");
    if (!button) return false;

    if (button.classList.contains("fileinput__button--select-file")) {
      const input = button.querySelector("input[type='file']");

      input.click();
      document.querySelector(".fileinput__label").style.opacity = 100;
      document.querySelector(".fileinput__button--go").style.opacity = 100;

      return false;
    } else if (button.classList.contains("fileinput__button--go")) {
      const input = fileinput.querySelector("input[type='file']");

      if (input.files.length < 1) return false;

      document.querySelector(".fileinput__label").style.opacity = 0;
      document.querySelector(".fileinput__button--go").style.opacity = 0;

      return input.files[0];
    }
  }

  /**
   * Reads the contents of a file as plain text.
   *
   * @param {File} file - The file to read.
   * @returns {Promise<string>} A promise that resolves to the file's text contents.
   */
  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }
}

export default new FileInput();
