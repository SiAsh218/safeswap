import dateHandler from "./core/dateHandler.js";
import fileInput from "./core/fileInput.js";
import textParser from "./core/textParser.js";
import alert from "./ui/alert.js";
import diagramHandler from "./core/diagramHandler.js";
import table from "./ui/table.js";
import toggle from "./ui/toggle.js";

const dateInput = document.getElementById("input--date");
const fleetInput = document.getElementById("input--fleet");
const startInput = document.getElementById("input--start");
const endInput = document.getElementById("input--end");
const checkboxes = [...document.querySelectorAll(".checkbox--swap-location")];
const resultsContainer = document.getElementById("container--result");
const resultsContainerThreeTrains = document.getElementById(
  "container--result-three-trains"
);

const getCrossCoverOptions = (fleet) => {
  const crossCoverOptions = [fleet];
  const crossCover = crosscoverToggle.checked;

  if (crossCover) {
    const checkboxes = document.querySelectorAll(".checkbox--cross-cover");

    checkboxes.forEach((box) => {
      if (box.checked) {
        if (!crossCoverOptions.includes(box.value)) {
          crossCoverOptions.push(box.value);
        }
      }
    });
  }

  return crossCoverOptions;
};

const banding = [
  {
    fleet: "800/5",
    banding: { green: 25, amber: 20 },
  },
  {
    fleet: "802/5",
    banding: { green: 25, amber: 20 },
  },
  {
    fleet: "800/9",
    banding: { green: 25, amber: 20 },
  },
  {
    fleet: "802/9",
    banding: { green: 25, amber: 20 },
  },
  {
    fleet: "387/1",
    banding: { green: 10, amber: 5 },
  },
  {
    fleet: "150/2",
    banding: { green: 10, amber: 5 },
  },
  {
    fleet: "158/0",
    banding: { green: 10, amber: 5 },
  },
  {
    fleet: "158/9",
    banding: { green: 10, amber: 5 },
  },
  {
    fleet: "255/4",
    banding: { green: 10, amber: 5 },
  },
  {
    fleet: "165/2",
    banding: { green: 10, amber: 5 },
  },
  {
    fleet: "165/5",
    banding: { green: 10, amber: 5 },
  },
  {
    fleet: "165/3",
    banding: { green: 10, amber: 5 },
  },
  {
    fleet: "166/6",
    banding: { green: 10, amber: 5 },
  },
];

// Set input value to today's date
dateInput.valueAsDate = new Date();

const diagrams = [];

const crosscoverToggle = document.getElementById(
  "my-toggle__input--cross-cover"
);

const myToggles = document.querySelectorAll(".my-toggle");

myToggles.forEach((myToggle) => {
  const toggleEl = myToggle.querySelector(".my-toggle__input");
  toggleEl.addEventListener("change", (e) => {
    toggle.handleClick(toggleEl);
  });
});

document.addEventListener("click", async (e) => {
  const button = e.target.closest(".button");

  const fileinput = e.target.closest(".fileinput");

  const myToggle = e.target.closest(".my-toggle__wrapper");
  if (fileinput) {
    const file = fileInput.handleClick(e);

    if (button && button.id === "fileinput__button--go") {
      const text = await fileInput.readFile(file);

      const convertedText = text.split("Rdg (4-6)").join("Reading");

      console.log(convertedText);

      const data = textParser.parseDiagrams(convertedText);

      // TODO: Render the error if no diagrams are found

      for (const item of data) {
        diagrams.push(item);
      }

      alert.render(`${data.length} lines loaded`, "success");

      const containerFilesUploaded = document.getElementById(
        "container--uploaded-files"
      );

      containerFilesUploaded.classList.remove("hidden");

      containerFilesUploaded.insertAdjacentHTML(
        "beforeend",
        `<span>${file.name}</span>`
      );

      console.log(diagrams);

      const headcodes = diagramHandler.getHeadcodes(diagrams);

      console.log(headcodes);
      const headcodeSelector = document.getElementById("input--headcodes");
      const headcodeSelectorSwap = document.getElementById(
        "input--headcodes-swap"
      );

      // load headcodes into the headcode selectors
      headcodes.forEach((headcode) => {
        headcodeSelector.insertAdjacentHTML(
          "beforeend",
          `<option value="${headcode}">${headcode}</option>`
        );

        headcodeSelectorSwap.insertAdjacentHTML(
          "beforeend",
          `<option value="${headcode}">${headcode}</option>`
        );
      });
    }
  } else if (button) {
    if (button.id === "button--go") {
      if (diagrams.length < 1) {
        alert.render("Please upload a diagram file", "error");
        return;
      }
      const date = dateInput.value;
      const day = dateHandler.getDayOfWeek(date);
      const fleet = fleetInput.value;
      const start = startInput.value;
      const end = endInput.value;
      const headcode = document.getElementById("input--headcodes").value;
      const headcodeSwap = document.getElementById(
        "input--headcodes-swap"
      ).value;

      // get the fleet types that can be used as part of the swap
      const fleetCoverOptions = getCrossCoverOptions(fleet);

      // get the diagrams for the selected date
      const todaysDiagrams = diagramHandler.filterByDate(diagrams, date, day);

      // get todays diagrams that match the fleet cover options
      const fleetDiagrams = diagramHandler.filterByFleets(
        todaysDiagrams,
        fleetCoverOptions
      );

      console.log("👇 Fleet Diagrams");
      console.log(fleetDiagrams);

      // prettier-ignore
      alert.render(`${fleetDiagrams.length} diagrams found for ${fleet} on ${dateHandler.convertDateFormat(date,"YYYY-MM-DD","DD/MM/YYYY")}`,"success",5);

      const headcodeToggle = document.getElementById(
        "my-toggle__input--search-by"
      ).checked;

      const headcodeToggleSwap = document.getElementById(
        "my-toggle__input--swap-with"
      ).checked;

      let diagramsStart = [];

      // if headcode toggle is checked, filter by headcode
      if (headcodeToggle) {
        // headcode doesn't need to check by fleet
        diagramsStart = diagramHandler.filterByHeadcode(
          todaysDiagrams,
          headcode
        );
        console.log(`👇 Diagrams containing headcode ${headcode} to swap`);
        console.log(diagramsStart);
      }
      // if headcode toggle is not checked, filter by start location
      else {
        diagramsStart = diagramHandler.filterByStartLocation(
          fleetDiagrams,
          start,
          end
        );
        console.log(`👇 Diagrams starting at ${start}`);
        console.log(diagramsStart);
      }

      const sodToggle = document.getElementById(
        "my-toggle__input--start-of-day"
      ).checked;

      // If headcode swap toggle is visible and checked
      let diagramsEnd = [];
      if (headcodeToggleSwap && sodToggle) {
        diagramsEnd = diagramHandler.filterByHeadcode(
          todaysDiagrams,
          headcodeSwap
        );
        console.log(`👇 Diagrams containing headcode ${headcode} for swap`);
        console.log(diagramsEnd);
      } else {
        diagramsEnd = diagramHandler.filterByEndLocation(
          fleetDiagrams,
          end,
          sodToggle === true || headcodeToggle ? null : start
        );
        console.log(`👇 Diagrams ending at ${end}`);
        console.log(diagramsEnd);
      }

      const swapLocations = [];
      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          swapLocations.push(checkbox.value);
        }
      });

      const diagramsToSwap = diagramHandler.getSwapLocations(
        diagramsStart,
        swapLocations
      );

      console.log("👇 diagrams that need to be swapped");
      console.log(diagramsToSwap);

      const diagramsForSwap = diagramHandler.getSwapLocations(
        diagramsEnd,
        swapLocations
      );

      console.log("👇 diagrams to be swapped with");
      console.log(diagramsForSwap);

      // loop through the diagrams to swap to check if any of the legs match

      const tableData = diagramHandler.getSwapOptions(
        diagramsToSwap,
        diagramsForSwap
      );

      const tableDataFor3Trains = diagramHandler.getSwapOptionsFor3Trains(
        diagramsToSwap,
        diagramsForSwap,
        fleetDiagrams,
        swapLocations,
        start,
        end
      );

      resultsContainer.innerHTML = "";
      resultsContainerThreeTrains.innerHTML = "";
      resultsContainer.classList.add("hidden");
      resultsContainer.classList.add("hidden");

      // prettier-ignore
      alert.render(`Successfully found swap options`,"success",5);

      if (tableData.length < 1 && tableDataFor3Trains.length < 1) {
        alert.render(`There are no results for the parameters you've selected`);
        return;
      }

      const priorityBanding = banding.find(
        (band) => band.fleet === fleet
      ).banding;

      if (tableData.length > 0) {
        resultsContainer.classList.remove("hidden");
        table.render(
          tableData,
          "container--result",
          "table--results",
          "SIMPLE SWAPS (2 SETS INVOLVED)"
        );
      }

      if (tableDataFor3Trains.length > 0) {
        resultsContainerThreeTrains.classList.remove("hidden");
        table.render(
          tableDataFor3Trains,
          "container--result-three-trains",
          "table--results-three-trains",
          "COMPLEX SWAPS (3 SETS INVOLVED)"
        );
      }

      const resultsTable = document.getElementById("table--results");
      const resultsTable3Trains = document.getElementById(
        "table--results-three-trains"
      );

      if (resultsTable) {
        table.formatResultsTable(
          resultsTable,
          dateHandler.timeDifferenceMins,
          priorityBanding
        );
      }

      if (resultsTable3Trains) {
        table.formatResultsTable3Trains(
          resultsTable3Trains,
          dateHandler.timeDifferenceMins,
          priorityBanding
        );
      }
    }
  }
});
