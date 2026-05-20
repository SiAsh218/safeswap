/**
 * Class responsible for rendering HTML tables with color-coded styling.
 */
class Table {
  constructor() {
    this.red = "#FAA0A0";
    this.amber = "#F2C898";
    this.green = "#C1E1C1";
  }

  /**
   * Renders a table based on provided data and inserts it into a specified container.
   *
   * @param {Object[]} data - An array of objects representing the table rows. Each object must have the same keys.
   * @param {string} containerId - The ID of the HTML element to render the table into.
   * @param {string} id - The ID to assign to the newly created table. If a table with this ID already exists, it will be removed.
   * @param {string} tableTitle - The title to display above the table.
   */
  render(data, containerId, id, tableTitle) {
    const container = document.getElementById(containerId);

    container.innerHTML = "";

    if (document.getElementById(id)) {
      document.getElementById(id).remove();
    }

    const headers = Object.keys(data[0]);

    const headersMarkup = headers.reduce((acc, cur) => {
      return (acc += `<th>${cur}</th>`);
    }, "");

    const bodyMarkup = data.reduce((acc, item) => {
      return (acc += `<tr>${headers.reduce((acc2, header) => {
        return (acc2 += `<td class="column--${header.toLowerCase()}">${
          item[header]
        }</td>`);
      }, "")}</tr>`);
    }, "");

    let markup = `<span style="text-align: center;" class="text--heading">${tableTitle}</span><table id="${id}">
          <thead>
            <tr class="sticky-header">
              ${headersMarkup}
            </tr>
          </thead>
          <tbody>
              ${bodyMarkup}
          </tbody>
        </table>`;

    container.insertAdjacentHTML("beforeend", markup);

    container.classList.remove("hidden");
  }

  getSwapTime(swapTimeDiff, originalTimeDiff) {
    return swapTimeDiff < originalTimeDiff ? swapTimeDiff : originalTimeDiff;
  }

  formatResultsTable(table, timeDifferenceMins, banding) {
    const rows = [...table.querySelectorAll("tr:not(.sticky-header)")];

    for (const row of rows) {
      const firstArr = row.querySelector(".column--diagramarr").textContent;
      const firstDep = row.querySelector(".column--diagramdep").textContent;
      const firstHeadcode = row.querySelector(
        ".column--incomingheadcode"
      ).textContent;
      const secondArr = row.querySelector(".column--swaparr").textContent;
      const secondDep = row.querySelector(".column--swapdep").textContent;
      const secondHeadcode = row.querySelector(
        ".column--swapheadcode"
      ).textContent;

      const timeDiffSwap1 = timeDifferenceMins(firstArr, secondDep);
      const timeDiffOriginal1 = timeDifferenceMins(firstArr, firstDep);
      const timeDiffSwap2 = timeDifferenceMins(secondArr, firstDep);
      const timeDiffOriginal2 = timeDifferenceMins(secondArr, secondDep);

      const swap1 = this.getSwapTime(timeDiffSwap1, timeDiffOriginal2);
      const swap2 = this.getSwapTime(timeDiffSwap2, timeDiffOriginal1);

      const turnaroundTime = swap1 < swap2 ? swap1 : swap2;

      const tooltipArray = [];

      tooltipArray.push(
        `${swap1} minuite turnaround time when swapping ${firstHeadcode} with ${secondHeadcode}`
      );
      tooltipArray.push(
        `${swap2} minute turnaround time when swapping ${secondHeadcode} with ${firstHeadcode}`
      );

      this.formatRowByTurnaround(row, turnaroundTime, banding);

      if (swap1 > 60 || swap2 > 60) {
        if (row.style.backgroundColor === "rgb(193, 225, 193)") {
          /*if green*/ row.style.backgroundColor = this.amber;
        }

        tooltipArray.push(
          `This swap results in a train being platformed for longer than 60 minutes!`
        );
      }

      row.title = tooltipArray.join("\n");

      this.hideCoupledResults(row);
    }
  }

  hideCoupledResults(row) {
    const diagramNoOnly = row
      .querySelector(".column--diagram")
      .textContent.split(" ")[1]
      .trim();
    const swapDiagramNoOnly = row
      .querySelector(".column--swapwith")
      .textContent.split(" ")[1]
      .trim();
    const incomingCoupled = row.querySelector(
      ".column--incomingcoupled"
    ).textContent;
    const swapCoupled = row.querySelector(
      ".column--incomingcoupled"
    ).textContent;

    if (
      (incomingCoupled.includes(diagramNoOnly) &&
        incomingCoupled.includes(swapDiagramNoOnly)) ||
      (swapCoupled.includes(diagramNoOnly) &&
        swapCoupled.includes(swapDiagramNoOnly))
    ) {
      row.classList.add("hidden");
    }
  }

  hideCoupledResultsComplex(row) {
    const diagram1NoOnly = row
      .querySelector(".column--diagram1")
      .textContent.split(" ")[1]
      .trim();
    const diagram2NoOnly = row
      .querySelector(".column--diagram2")
      .textContent.split(" ")[1]
      .trim();
    const diagram3NoOnly = row
      .querySelector(".column--diagram3")
      .textContent.split(" ")[1]
      .trim();
    const diagram4NoOnly = row
      .querySelector(".column--diagram4")
      .textContent.split(" ")[1]
      .trim();

    const coupled1 = row.querySelector(".column--coupled1").textContent;
    const coupled2 = row.querySelector(".column--coupled2").textContent;
    const coupled3 = row.querySelector(".column--coupled3").textContent;
    const coupled4 = row.querySelector(".column--coupled4").textContent;

    if (
      (coupled1.includes(diagram1NoOnly) &&
        coupled1.includes(diagram2NoOnly)) ||
      (coupled2.includes(diagram1NoOnly) && coupled2.includes(diagram2NoOnly))
    ) {
      row.classList.add("hidden");
      return;
    }

    if (
      (coupled3.includes(diagram3NoOnly) &&
        coupled3.includes(diagram4NoOnly)) ||
      (coupled4.includes(diagram3NoOnly) && coupled4.includes(diagram4NoOnly))
    ) {
      row.classList.add("hidden");
      return;
    }
  }

  //TODO: Refactor this so that it utilses the same code as the simple swap!
  formatResultsTable3Trains(table, timeDifferenceMins, banding) {
    const rowsComplex = [...table.querySelectorAll("tr:not(.sticky-header)")];

    for (const row of rowsComplex) {
      const arr1 = row.querySelector(".column--arr1").textContent;
      const dep1 = row.querySelector(".column--dep1").textContent;
      const headcode1 = row.querySelector(".column--headcode1").textContent;
      const arr2 = row.querySelector(".column--arr2").textContent;
      const dep2 = row.querySelector(".column--dep2").textContent;
      const headcode2 = row.querySelector(".column--headcode2").textContent;
      const arr3 = row.querySelector(".column--arr3").textContent;
      const dep3 = row.querySelector(".column--dep3").textContent;
      const headcode3 = row.querySelector(".column--headcode3").textContent;
      const arr4 = row.querySelector(".column--arr4").textContent;
      const dep4 = row.querySelector(".column--dep4").textContent;
      const headcode4 = row.querySelector(".column--headcode4").textContent;

      // For the first of the 2 swaps
      const timeDiffSwap1 = timeDifferenceMins(arr1, dep2);
      const timeDiffOriginal1 = timeDifferenceMins(arr1, dep1);
      const timeDiffSwap2 = timeDifferenceMins(arr2, dep1);
      const timeDiffOriginal2 = timeDifferenceMins(arr2, dep2);

      const swap1 = this.getSwapTime(timeDiffSwap1, timeDiffOriginal2);
      const swap2 = this.getSwapTime(timeDiffSwap2, timeDiffOriginal1);

      // For the second of the 2 swaps
      const timeDiffSwap3 = timeDifferenceMins(arr3, dep4);
      const timeDiffOriginal3 = timeDifferenceMins(arr3, dep3);
      const timeDiffSwap4 = timeDifferenceMins(arr4, dep3);
      const timeDiffOriginal4 = timeDifferenceMins(arr4, dep4);

      const swap3 = this.getSwapTime(timeDiffSwap3, timeDiffOriginal4);
      const swap4 = this.getSwapTime(timeDiffSwap4, timeDiffOriginal3);

      const turnaroundTime1 = swap1 < swap2 ? swap1 : swap2;

      const turnaroundTime2 = swap3 < swap4 ? swap3 : swap4;

      const turnaroundTime =
        turnaroundTime1 < turnaroundTime2 ? turnaroundTime1 : turnaroundTime2;

      const tooltipArray = [];

      tooltipArray.push(
        `${swap1} minuite turnaround time when swapping ${headcode1} with ${headcode2}`
      );
      tooltipArray.push(
        `${swap2} minute turnaround time when swapping ${headcode2} with ${headcode1}`
      );
      tooltipArray.push(
        `${swap3} minute turnaround time when swapping ${headcode3} with ${headcode4}`
      );
      tooltipArray.push(
        `${swap4} minute turnaround time when swapping ${headcode4} with ${headcode3}`
      );

      this.formatRowByTurnaround(row, turnaroundTime, banding);

      if (swap1 > 60 || swap2 > 60 || swap3 > 60 || swap4 > 60) {
        if (row.style.backgroundColor === "rgb(193, 225, 193)") {
          /*if green*/ row.style.backgroundColor = this.amber;
        }

        tooltipArray.push(
          `This swap results in a train being platformed for longer than 60 minutes!`
        );
      }

      row.title = tooltipArray.join("\n");

      this.hideCoupledResultsComplex(row);
    }
  }

  formatRowByTurnaround(
    row,
    turnaroundTime,
    banding = { green: 25, amber: 20 }
  ) {
    if (turnaroundTime >= banding.green) {
      row.style.backgroundColor = this.green;
    } else if (turnaroundTime >= banding.amber) {
      row.style.backgroundColor = this.amber;
    } else {
      row.style.backgroundColor = this.red;
    }
  }
}

export default new Table();
