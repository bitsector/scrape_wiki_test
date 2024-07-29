// utils/scrape.js
const axios = require("axios");
const cheerio = require("cheerio");

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

    // Investigate each link asynchronously and aggregate results
    const investigationPromises = links.map(link => investigateLink(link).then(result => ({ link, ...result })));

    const results = await Promise.all(investigationPromises);
    const successfulLinks = results.filter(r => r.result);
    // console.log("Links for which investigateLink() returned true:");
    // successfulLinks.forEach(({ link, lat, lon }) => {
    //     console.log(`Link: ${link}, Latitude: ${lat}, Longitude: ${lon}`);
    // });

    // console.log("Links for which investigateLink() returned false:");
    // const interestingFailedLinks = failedLinks.filter(isLinkOfInterest);
    // console.dir(interestingFailedLinks, { maxArrayLength: null });
    console.log(successfulLinks);
    
    // Return the successfulLinks as a JSON object
    return JSON.stringify({ successfulLinks });
}

async function investigateLink(link) {
    try {
        const { data } = await axios.get(link);
        
        // Extract the link name from the URL
        const linkName = link.split("/").pop();

        // Call the analyzeContents function
        const analysisResult = analyzeContents(data, linkName);
        console.log(`Analysis result for ${linkName}: ${analysisResult.result}`);
        return analysisResult;
    } catch (error) {
        console.error(`Error fetching the page ${link}:`, error);
        return { result: false, lat: null, lon: null };
    }
}

// Function to analyze HTML content
function analyzeContents(html, linkname) {
    const wgCoordinatesIndex = html.indexOf("wgCoordinates");
    if (wgCoordinatesIndex === -1) {
        console.log(`wgCoordinates not found in the HTML content of ${linkname}.`);
        return { result: false, lat: null, lon: null };
    }

    const latIndex = html.indexOf('"lat":', wgCoordinatesIndex);
    let latitude = null;
    if (latIndex === -1) {
        console.error(`Latitude (lat) not found in the HTML content of ${linkname}.`);
        return { result: false, lat: null, lon: null };
    } else {
        const latStart = latIndex + 6; // Length of '"lat":'
        const latEnd = html.indexOf(",", latStart);
        latitude = html.substring(latStart, latEnd).trim();
        console.log(`Latitude in ${linkname}: ${latitude}`);
    }

    const lonIndex = html.indexOf('"lon":', wgCoordinatesIndex);
    let longitude = null;
    if (lonIndex === -1) {
        console.error(`Longitude (lon) not found in the HTML content of ${linkname}.`);
        return { result: false, lat: latitude, lon: null };
    } else {
        const lonStart = lonIndex + 6; // Length of '"lon":'
        const lonEnd = html.indexOf("}", lonStart);
        longitude = html.substring(lonStart, lonEnd).trim();
        console.log(`Longitude in ${linkname}: ${longitude}`);
    }

    return { result: true, lat: latitude, lon: longitude };
}

function isLinkOfInterest(link) {
    const substrings = ["ss", "sms", "hms", "hmas", "uss", "usc"];
    const lowerCaseLink = link.toLowerCase();
    return substrings.some(substring => lowerCaseLink.includes(substring));
}

module.exports = {
    scrapeWreckDivingSites
};
