/**
 * @module DiagramHandler
 * Handles filtering and manipulation of train diagram data based on date, location, fleet, and timing.
 */

import dateHandler from "../core/dateHandler.js";

/**
 * Class representing the DiagramHandler.
 */
class DiagramHandler {
  constructor() {}

  /**
   * Filters diagrams by date, day code, and selects STP diagrams if duplicates exist.
   * @param {Array} diagrams - List of diagram objects.
   * @param {string} date - The target date (in 'YYYY-MM-DD' format).
   * @param {string} day - The day code to filter by (e.g., '1', '2', ..., '7').
   * @returns {Array} Filtered list of diagram objects.
   */
  filterByDate(diagrams, date, day) {
    // filter by date
    const diagramsByDate = diagrams.filter((dia) => {
      return dateHandler.isDateBetween(dia.startDate, dia.endDate, date);
    });

    console.log(`${diagramsByDate.length} diagrams by date`);

    // filter by day
    const diagramsByDateAndDay = diagramsByDate.filter((dia) => {
      if (dia.dayCodes.includes("X")) {
        return dia.dayCodes.includes(day) ? false : true;
      } else {
        return dia.dayCodes.includes(day) ? true : false;
      }
    });

    console.log(`${diagramsByDateAndDay.length} diagrams by date and day`);

    const diagramNos = diagramsByDateAndDay.map((item) => item.diagramNo);

    const uniqueDiagramNos = [...new Set(diagramNos)];

    const finalDiagrams = [];

    for (const no of uniqueDiagramNos) {
      const filteredDias = diagramsByDateAndDay.filter(
        (dia) => dia.diagramNo === no
      );

      if (filteredDias.length === 1) {
        finalDiagrams.push(filteredDias[0]);
      } else if (filteredDias.length > 1) {
        if (filteredDias.length > 2) {
          alert.render(`Multiple diagrams found for ${no}`);
        }

        finalDiagrams.push(filteredDias.find((dia) => dia.planType === "STP"));
      }
    }

    console.log(`${finalDiagrams.length} diagrams by date and day and STP`);

    return finalDiagrams;
  }

  /**
   * Checks if one time string (HH:MM) is before another.
   * @param {string} first - First time in "HH:MM" format.
   * @param {string} second - Second time in "HH:MM" format.
   * @returns {boolean} True if first time is before second.
   */
  isTimeBefore(first, second) {
    // Helper function to convert "HH:MM" to total minutes
    const toMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const start = toMinutes(first);
    const end = toMinutes(second);

    return start < end;
  }

  /**
   * Checks whether two time ranges overlap. Accounts for midnight crossover.
   * @param {string} startTime1 - Start time of first range (HH:MM).
   * @param {string} endTime1 - End time of first range (HH:MM).
   * @param {string} startTime2 - Start time of second range (HH:MM).
   * @param {string} endTime2 - End time of second range (HH:MM).
   * @returns {boolean} True if ranges overlap.
   */
  doTimeRangesOverlap(startTime1, endTime1, startTime2, endTime2) {
    // Helper function to convert "HH:MM" to total minutes
    const toMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const start1 = toMinutes(startTime1);
    const end1 = toMinutes(endTime1);
    const start2 = toMinutes(startTime2);
    const end2 = toMinutes(endTime2);

    // Normalize intervals to account for crossing midnight
    const normalizeRange = (start, end) =>
      end >= start ? [start, end] : [start, end + 1440];

    const [normStart1, normEnd1] = normalizeRange(start1, end1);
    const [normStart2, normEnd2] = normalizeRange(start2, end2);

    // Check if there is an overlap
    return normStart1 < normEnd2 && normStart2 < normEnd1;
  }

  /**
   * Filters diagrams by fleet type, treating 800/9 and 802/9 as equivalent.
   * @param {Array} diagrams - List of diagram objects.
   * @param {string} fleet - Fleet code to filter by.
   * @returns {Array} Filtered list of diagram objects.
   */
  filterByFleet(diagrams, fleet) {
    const mappedFleet = this.getMappedFleet(fleet);

    if (mappedFleet === "IET/9") {
      return diagrams.filter(
        (dia) => dia.fleet === "800/9" || dia.fleet === "802/9"
      );
    } else return diagrams.filter((dia) => dia.fleet === fleet);
  }

  filterByFleets(diagrams, fleets) {
    const filteredDiagrams = [];

    for (const fleet of fleets) {
      const filtered = this.filterByFleet(diagrams, fleet);
      for (const dia of filtered) {
        filteredDiagrams.push(dia);
      }
    }

    return filteredDiagrams;
  }

  // TODO: extend mapping for West (i.e. cross fleet cover / is this hard coded or selectable???)
  //  -- selectable may be better as it links in with the balancing / short formation correction
  getMappedFleet(fleet) {
    switch (fleet) {
      case "800/9":
        return "IET/9";
      case "802/9":
        return "IET/9";

      default:
        return fleet;
    }
  }

  /**
   * Filters diagrams where the start location matches, but the end location does not.
   * @param {Array} diagrams - List of diagram objects.
   * @param {string} start - Start location code.
   * @param {string} end - End location code to exclude.
   * @returns {Array} Filtered diagrams.
   */
  filterByStartLocation(diagrams, start, end) {
    return diagrams.filter(
      (dia) =>
        dia.legs[0].location === start &&
        this.getDiagramEndLocation(dia) !== end
    );
  }

  /**
   * Gets the last location with a value in a diagram’s legs.
   * @param {Object} diagram - A diagram object.
   * @returns {string} The final location code.
   */
  getDiagramEndLocation(diagram) {
    for (let i = diagram.legs.length - 1; i >= 0; i--) {
      if (!diagram.legs[i].location) continue;
      return diagram.legs[i].location;
    }
  }

  /**
   * Filters diagrams where the end location matches and start location optionally does not.
   * @param {Array} diagrams - List of diagram objects.
   * @param {string} end - End location code.
   * @param {string|null} start - Optional start location to exclude.
   * @returns {Array} Filtered diagrams.
   */
  filterByEndLocation(diagrams, end, start) {
    if (start === null) {
      return diagrams.filter(
        (dia) => this.getDiagramEndLocation(dia) === end
        //&&  dia.legs[0].location !== start
      );
    } else {
      return diagrams.filter(
        (dia) =>
          this.getDiagramEndLocation(dia) === end &&
          dia.legs[0].location !== start
      );
    }
  }

  /**
   * Gets all valid 3-train swap options from diagrams based on fleet and swap locations.
   * @param {Array} diagramsToSwap - Diagrams that need to be swapped.
   * @param {Array} diagramsForSwap - Pool of diagrams to swap with.
   * @param {Array} fleetDiagrams - All available fleet diagrams.
   * @param {Array} swapLocations - List of valid swap locations.
   * @param {string} start - Start location for filtering.
   * @param {string} end - End location for filtering.
   * @returns {Array} Swap combinations table data.
   */
  getSwapOptionsFor3Trains(
    diagramsToSwap,
    diagramsForSwap,
    fleetDiagrams,
    swapLocations,
    start,
    end
  ) {
    const tableData = [];

    const midFleetDiagrams = fleetDiagrams.filter(
      (dia) =>
        dia.legs[0].location !== start &&
        this.getDiagramEndLocation(dia) !== end
    );

    const swapOptionsFleetDiagrams = this.getSwapLocations(
      midFleetDiagrams,
      swapLocations
    );

    const midToEnd = this.getSwapOptions(
      swapOptionsFleetDiagrams,
      diagramsForSwap
    );

    const startToMid = this.getSwapOptions(
      diagramsToSwap,
      swapOptionsFleetDiagrams
    );

    // loop through diagrams starting in the correct location
    for (const starting of startToMid) {
      // loop through mif to end
      for (const mid of midToEnd) {
        if (
          starting.swapWith !== mid.diagram ||
          !this.isTimeBefore(starting.swapDep, mid.diagramArr) ||
          starting.location !== mid.location
        )
          continue;

        tableData.push({
          location: starting.location,
          diagram1: starting.diagram,
          headcode1: starting.incomingHeadcode,
          arr1: starting.diagramArr,
          dep1: starting.diagramDep,
          coupled1: starting.incomingCoupled,
          diagram2: starting.swapWith,
          headcode2: starting.swapHeadcode,
          arr2: starting.swapArr,
          dep2: starting.swapDep,
          coupled2: starting.swapCoupled,
          diagram3: mid.diagram,
          headcode3: mid.incomingHeadcode,
          arr3: mid.diagramArr,
          dep3: mid.diagramDep,
          coupled3: mid.incomingCoupled,
          diagram4: mid.swapWith,
          headcode4: mid.swapHeadcode,
          arr4: mid.swapArr,
          dep4: mid.swapDep,
          coupled4: mid.swapCoupled,
        });
      }
    }

    return tableData;
  }

  /**
   * Gets swap opportunities between two sets of diagrams based on overlapping legs.
   * @param {Array} diagramsToSwap - Set of diagrams initiating the swap.
   * @param {Array} diagramsForSwap - Set of diagrams that can be swapped with.
   * @returns {Array} List of valid swap opportunities.
   */
  getSwapOptions(diagramsToSwap, diagramsForSwap) {
    const tableData = [];
    // loop diagrams to swap
    for (const diagram of diagramsToSwap) {
      const legs = diagram.swapLegs;
      // loop swap for diagrams
      for (const swapWith of diagramsForSwap) {
        if (diagram.no === swapWith.no) continue;

        const swapWithLegs = swapWith.swapLegs;

        // loop through legs
        for (const leg of legs) {
          // loop through swap with legs
          for (const swapLeg of swapWithLegs) {
            if (!leg.arr || !leg.dep || !swapLeg.arr || !swapLeg.dep) continue;

            if (
              leg.location === swapLeg.location &&
              this.doTimeRangesOverlap(
                leg.arr,
                leg.dep,
                swapLeg.arr,
                swapLeg.dep
              )
            ) {
              tableData.push({
                location: leg.location,
                diagram: diagram.no,
                incomingHeadcode:
                  leg.wtt === leg.prevWtt || !leg.prevWtt
                    ? leg.wtt
                    : leg.prevWtt,
                diagramArr: leg.arr,
                diagramDep: leg.dep,
                incomingCoupled: leg.coupled,
                swapWith: swapWith.no,
                swapHeadcode: swapLeg.wtt,
                swapArr: swapLeg.arr,
                swapDep: swapLeg.dep,
                swapCoupled: swapLeg.coupled,
                sameStartLocation: diagram.sod === swapWith.sod ? "Yes" : "",
              });
            }
          }
        }
      }
    }

    return tableData;
  }

  /**
   * Gets the next leg in a sequence from a specific index and location.
   * @param {Array} legs - List of leg objects.
   * @param {number} currentIndex - Current index in legs array.
   * @param {string} loc - Location code to match.
   * @returns {Object|string} The next leg or empty string if none.
   */
  getNextLeg(legs, currentIndex, loc) {
    for (let i = currentIndex + 1; i < legs.length; i++) {
      if (legs[i].location === loc && legs[i].dep) {
        return legs[i];
      }
    }
    return "";
  }

  /**
   * Gets the previous leg in a sequence from a specific index and location.
   * @param {Array} legs - List of leg objects.
   * @param {number} currentIndex - Current index in legs array.
   * @param {string} loc - Location code to exclude.
   * @returns {Object|undefined} The previous leg or undefined if none.
   */
  getPrevLeg(legs, currentIndex, loc) {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (legs[i].location !== "" && legs[i].location !== loc) {
        return legs[i];
      }
    }
  }

  /**
   * Processes a single leg to determine if it matches a swap location and formats swap data.
   * @param {Object} startingAt - Diagram containing the leg.
   * @param {Array} swapLocations - Locations that are valid for swaps.
   * @param {Object} leg - Current leg.
   * @param {number} legIndex - Index of the leg in diagram.
   * @returns {Object|undefined} Swap leg data or undefined if not valid.
   */
  processSwapLegs(startingAt, swapLocations, leg, legIndex) {
    for (const loc of swapLocations) {
      if (leg.location === loc) {
        if (leg.arr && leg.dep) {
          return {
            location: loc,
            arr: leg.arr,
            dep: leg.dep,
            wtt: leg.wtt,
            coupled: leg.coupled,
          };
        } else if (leg.arr && !leg.dep) {
          const nextLeg = this.getNextLeg(startingAt.legs, legIndex, loc);
          const prevLeg = this.getPrevLeg(startingAt.legs, legIndex, loc);

          return {
            location: loc,
            arr: leg.arr,
            dep: nextLeg.dep,
            wtt: nextLeg.wtt,
            prevWtt: prevLeg.wtt,
            coupled: nextLeg.coupled,
          };
        }
      }
    }
  }

  /**
   * Converts diagrams into a format containing only swap-relevant legs at defined locations.
   * @param {Array} diagrams - List of diagram objects.
   * @param {Array} swapLocations - Locations of interest for swap.
   * @returns {Array} List of diagrams with extracted swap leg data.
   */
  getSwapLocations(diagrams, swapLocations) {
    const diagramsInSwapLocations = [];

    // loop through diagrams starting at "X"
    for (const starting of diagrams) {
      const diagram = {
        no: starting.diagramNo,
        sod: starting.legs[0].location,
        swapLegs: [],
      };
      // loop through the legs of each diagram
      for (let i = 0; i < starting.legs.length; i++) {
        const leg = starting.legs[i];

        const data = this.processSwapLegs(starting, swapLocations, leg, i);

        if (!data) continue;

        diagram.swapLegs.push(data);
      }
      diagramsInSwapLocations.push(diagram);
    }
    return diagramsInSwapLocations;
  }

  filterByHeadcode(diagrams, headcode) {
    const filteredDiagrams = diagrams.filter((dia) => {
      for (const leg of dia.legs) {
        if (leg.wtt === headcode) {
          return true;
        }
      }
      return false;
    });

    return filteredDiagrams;
  }

  getHeadcodes(diagrams) {
    const headcodes = [];

    for (const diagram of diagrams) {
      for (const leg of diagram.legs) {
        if (leg.wtt && !headcodes.includes(leg.wtt)) {
          headcodes.push(leg.wtt);
        }
      }
    }

    const sortedHeadcodes = headcodes.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    return sortedHeadcodes;
  }
}

export default new DiagramHandler();
