/**
 * @module TextParser
 * Handles text parsing and string manipulation
 */

import dateHandler from "./dateHandler.js";

/**
 * A class for parsing text-based train diagram files into structured JSON format.
 */
class TextParser {
  constructor() {}

  /**
   * Splits a string at uppercase letters.
   * @param {string} str - The input string.
   * @returns {string[]} Array of substrings split at uppercase letters.
   */
  splitByUpperCase(str) {
    return str.split(/(?=[A-Z])/);
  }

  /**
   * Determines the diagram type ("IET" or "DMU") based on the contents of the text.
   * Logs an error if the type cannot be determined.
   * @param {string} text - The raw text of the diagram.
   * @returns {string|undefined} "IET", "DMU", or undefined if not found.
   */
  getDiagramType(text) {
    if (
      text.includes("FLEET :\t802/9") ||
      text.includes("FLEET :\t802/5") ||
      text.includes("FLEET :\t800/9") ||
      text.includes("FLEET :\t800/5")
    ) {
      return "IET";
    } else if (
      text.includes("Fleet   :\t150/2") ||
      text.includes("Fleet   :\t158/9") ||
      text.includes("Fleet   :\t158/0") ||
      text.includes("Fleet   :\t255/4") ||
      text.includes("Fleet   :\t165/2") ||
      text.includes("Fleet   :\t165/5") ||
      text.includes("Fleet   :\t165/3") ||
      text.includes("Fleet   :\t166/6")
    ) {
      return "DMU";
    } else
      return console.log(
        "textParser.getDiagramType could not determine the diagram type"
      );
  }

  /**
   * Parses IET diagram text into structured JSON objects.
   * @param {string} text - Raw text of IET diagram.
   * @returns {Object[]} Array of parsed diagram objects.
   */
  parseDiagramFileIET(text) {
    const textArray = text.split("\r\n\tDIAGRAM :");

    const diagrams = textArray
      .filter((item) => item.trim().length > 0)
      .map((item) => item.trim());

    const data = [];

    for (const dia of diagrams) {
      const diaText = dia.split("\tFLEET :\t")[0].trim();
      const dayCode = diaText.split(" ").at(-1);
      const dayCodes = this.splitByUpperCase(dayCode);
      const diagramNo = diaText.split(dayCode)[0].trim();

      const fleet = dia.split("\tFLEET :\t")[1].split("\t")[0].trim();
      const planType = dia
        .split(`\tFLEET :\t${fleet}\t`)[1]
        .split("\r\n")[0]
        .trim();

      const startDate = dateHandler.convertDateFormat(
        dia.split("\tStart Date :")[1].split("\t")[0].trim(),
        "DD/MM/YYYY",
        "YYYY-MM-DD"
      );

      const endDate = dateHandler.convertDateFormat(
        dia.split("\tEnd Date :")[1].split("\r\n")[0].trim(),
        "DD/MM/YYYY",
        "YYYY-MM-DD"
      );

      const off = dia.split("\r\n\tOFF\t")[1].split("\t")[0].trim();

      const works = dia.split("\r\n\tWORKS\t")[1].split("\t")[0];

      const legsText = dia.split("Coupled\r\n")[1].split("\r\n\tWORKS")[0];

      const legsArr = legsText
        .split("\r\n")
        .filter((item) => item.trim().length > 0);

      const legs = [];
      for (const leg of legsArr) {
        const split = leg.split("\t");

        let line = {};
        if (split.length === 9) {
          line.location = split[2];
          line.arr = split[3].split(".").join(":").split("+").join(":");
          line.dep = split[4].split(".").join(":").split("+").join(":");
          line.wtt = split[5];
          line.route = split[6];
          line.act = split[7];
          line.coupled = split[8];
          line.forms = "";
        } else {
          line.location = "";
          line.arr = "";
          line.dep = "";
          line.wtt = "";
          line.route = "";
          line.act = "";
          line.coupled = "";
          line.forms = "";
        }
        legs.push(line);
      }

      const diagram = {
        diagramNo,
        dayCodes,
        fleet,
        planType,
        startDate,
        endDate,
        off,
        legs,
        works,
      };

      data.push(diagram);
    }
    return data;
  }

  /**
   * Parses DMU diagram text into structured JSON objects.
   * @param {string} text - Raw text of DMU diagram.
   * @returns {Object[]} Array of parsed diagram objects.
   */
  parseDiagramFileDMU(text) {
    const textArray = text.split("\r\n\tDiagram :\t");

    const diagrams = textArray
      .filter((item) => item.trim().length > 0)
      .map((item) => item.trim());

    const data = [];

    for (const dia of diagrams) {
      const diaText = dia.split("\r\n")[0];

      const dayCode = this.getTextBetween(diaText, "(", ")");
      const dayCodes = this.splitByUpperCase(dayCode);
      const diagramNo = diaText.split("(")[0].trim().split("\t").join(" ");

      const fleet = this.getTextBetween(dia, "Fleet   :\t", "\t").trim();
      const planType = diaText.split("\t").at(-1).trim();

      const startDate = dateHandler.convertDateFormat(
        this.getTextBetween(dia, "OPERATES\t", "\r\n").split("-")[0].trim(),
        "DD/MM/YYYY",
        "YYYY-MM-DD"
      );

      const endDate = dateHandler.convertDateFormat(
        this.getTextBetween(dia, "OPERATES\t", "\r\n").split("-")[1].trim(),
        "DD/MM/YYYY",
        "YYYY-MM-DD"
      );

      const off = this.getTextBetween(dia, "\r\n\tOFF     :\t", "(").trim();

      const works = dia.split("WORKS   :")[1].trim();

      const legsText = this.getTextBetween(
        dia,
        "Route\r\n",
        "WORKS   :"
      ).trim();

      const legsArr = legsText
        .split("\r\n\t")
        .filter((item) => item.trim().length > 0);

      const legs = [];
      for (const leg of legsArr) {
        const split = leg.split("\t");

        let line = {};
        if (split.length === 7) {
          line.location = split[0];
          line.arr = split[1].split(".").join(":").split("+").join(":");
          line.dep = split[2].split(".").join(":").split("+").join(":");
          line.wtt = split[4];
          line.act = split[3];
          line.coupled = split[6];
          line.miles = split[5];
        } else {
          line.location = "";
          line.arr = "";
          line.dep = "";
          line.wtt = "";
          line.act = split[3];
          line.coupled = "";
          line.miles = "";
        }

        legs.push(line);
      }

      const diagram = {
        diagramNo,
        dayCodes,
        fleet,
        planType,
        startDate,
        endDate,
        off,
        legs,
        works,
      };

      data.push(diagram);
    }
    return data;
  }

  /**
   * Parses diagram text and returns structured diagram data.
   * Detects diagram type and processes accordingly.
   * @param {string} text - Raw text from the diagram file.
   * @returns {Object[]} Array of parsed and processed diagram objects.
   */
  parseDiagrams(text) {
    const diagramType = this.getDiagramType(text);

    let data = undefined;
    switch (diagramType) {
      case "DMU":
        data = this.parseDiagramFileDMU(text);

        break;
      case "IET":
        data = this.parseDiagramFileIET(text);
        break;

      default:
        break;
    }

    for (const item of data) {
      item.legs = this.combineMovementEntries(item.legs);
      item.legs = this.processLegActs(item.legs);
    }

    return data;
  }

  /**
   * Combines consecutive movement entries for the same location
   * when arrival is on one line and departure is on the next.
   * @param {Object[]} entries - Array of leg entries.
   * @returns {Object[]} Array of legs with merged entries where applicable.
   */
  combineMovementEntries(entries) {
    const combined = [];

    for (let i = 0; i < entries.length; i++) {
      const current = entries[i];
      const next = entries[i + 1];

      if (
        next &&
        current.location === next.location &&
        current.arr &&
        !current.dep &&
        !next.arr &&
        next.dep
      ) {
        // Merge both
        combined.push({
          location: current.location,
          arr: current.arr,
          dep: next.dep,
          wtt: next.wtt || current.wtt,
          act: current.act || next.act,
          coupled: current.coupled || next.coupled,
          miles: next.miles || current.miles,
        });

        i++; // Skip the next item as it's already merged
      } else {
        combined.push(current);
      }
    }

    return combined;
  }

  /**
   * Converts `act` properties into arrays and combines orphan acts
   * (those with empty location) into the most recent valid entry.
   * @param {Object[]} legs - Array of leg objects with action codes.
   * @returns {Object[]} Legs with consolidated `act` arrays.
   */
  processLegActs(legs) {
    const result = [];

    for (const entry of legs) {
      // Always make `act` an array, even if it's empty or missing
      const acts = entry.act ? [entry.act] : [];

      if (entry.location) {
        // Copy the entry and replace `act` with array form
        result.push({
          ...entry,
          act: acts,
        });
      } else if (acts.length > 0 && result.length > 0) {
        // Add to the previous entry's `act` array
        result[result.length - 1].act.push(...acts);
      }
    }

    return result;
  }

  /**
   * Extracts a substring from `text` that lies between `start` and `end`.
   * @param {string} text - Full text string.
   * @param {string} start - Start delimiter.
   * @param {string} end - End delimiter.
   * @returns {string} Extracted substring.
   */
  getTextBetween(text, start, end) {
    const trimStart = text.split(start)[1];
    return trimStart.split(end)[0];
  }
}

export default new TextParser();
