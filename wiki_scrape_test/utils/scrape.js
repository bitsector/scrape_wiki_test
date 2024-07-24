// utils/scrape.js
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

async function scrapeWreckDivingSites() {
    const url = "https://en.wikipedia.org/wiki/List_of_wreck_diving_sites";
    const links = [];

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Select all links within the list of wreck diving sites
        $("li a").each((index, element) => {
            const link = $(element).attr("href");
            if (link && link.startsWith("/wiki/")) {
                links.push(`https://en.wikipedia.org${link}`);
            }
        });

    } catch (error) {
        console.error("Error fetching the page:", error);
    }

    // Print the entire array of URLs
    console.dir(links, { maxArrayLength: null });
    // Print the number of array elements
    console.log(`Number of links: ${links.length}`);

    // Convert the array to a JSON string
    const jsonLinks = JSON.stringify(links);

    // Investigate each link asynchronously
    links.forEach(link => {
        investigateLink(link);
    });

    return jsonLinks;
}

async function investigateLink(link) {
    try {
        const { data } = await axios.get(link);
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

        // Extract the link name from the URL
        const linkName = link.split("/").pop();
        const filename = path.join(__dirname, "../bin", `${linkName}_${timestamp}.html`);

        // Call the analyzeContents function
        const result = analyzeContents(data, filename);
        console.log(`Analysis result for ${filename}: ${result}`);

        fs.writeFileSync(filename, data);
        console.log(`Saved HTML content of ${link} to ${filename}`);
    } catch (error) {
        console.error(`Error fetching the page ${link}:`, error);
    }
}

// Function to analyze HTML content
function analyzeContents(html, filename) {
    const wgCoordinatesIndex = html.indexOf("wgCoordinates");
    if (wgCoordinatesIndex === -1) {
        console.log(`wgCoordinates not found in the HTML content of ${filename}.`);
        return false;
    }

    const latIndex = html.indexOf('"lat":', wgCoordinatesIndex);
    if (latIndex === -1) {
        console.error(`Latitude (lat) not found in the HTML content of ${filename}.`);
        return false;
    } else {
        const latStart = latIndex + 6; // Length of '"lat":'
        const latEnd = html.indexOf(",", latStart);
        const latitude = html.substring(latStart, latEnd).trim();
        console.log(`Latitude in ${filename}: ${latitude}`);
    }

    const lonIndex = html.indexOf('"lon":', wgCoordinatesIndex);
    if (lonIndex === -1) {
        console.error(`Longitude (lon) not found in the HTML content of ${filename}.`);
        return false;
    } else {
        const lonStart = lonIndex + 6; // Length of '"lon":'
        const lonEnd = html.indexOf("}", lonStart);
        const longitude = html.substring(lonStart, lonEnd).trim();
        console.log(`Longitude in ${filename}: ${longitude}`);
    }

    return true;
}

module.exports = {
    scrapeWreckDivingSites
};
